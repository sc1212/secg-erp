"""Auth API — signup/login/me baseline for secure dashboard access."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
try:
    from jose import JWTError, jwt
except ImportError:  # pragma: no cover
    JWTError = Exception
    jwt = None

try:
    from passlib.context import CryptContext
except ImportError:  # pragma: no cover
    CryptContext = None
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.core.deps import get_db
from backend.models.extended import UserAccount

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") if CryptContext else None


class SignupRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=72)
    full_name: str = Field(min_length=2, max_length=160)
    username: str = Field(min_length=3, max_length=60)


class LoginRequest(BaseModel):
    username_or_email: str = Field(min_length=3, max_length=200)
    password: str = Field(min_length=8, max_length=72)


class AuthTokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int


class MeOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: str


def _require_auth_dependencies() -> None:
    if jwt is None or pwd_context is None:
        raise HTTPException(
            status_code=500,
            detail="Auth dependencies missing. Install python-jose and passlib[bcrypt].",
        )


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def _verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def _create_access_token(subject: str) -> AuthTokenOut:
    expires = timedelta(minutes=settings.access_token_exp_minutes)
    expire_at = datetime.now(tz=timezone.utc) + expires
    payload = {"sub": subject, "exp": expire_at}
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)
    return AuthTokenOut(
        access_token=token,
        expires_in_seconds=int(expires.total_seconds()),
    )


def _parse_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid bearer token format")
    return parts[1]


def _current_user(db: Session, token: str) -> UserAccount:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        subject = payload.get("sub")
        if not subject:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

    user = db.query(UserAccount).filter(UserAccount.email == subject).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


@router.post("/signup", response_model=MeOut)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    _require_auth_dependencies()
    existing = db.query(UserAccount).filter(
        (UserAccount.email == payload.email) | (UserAccount.username == payload.username)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email or username already exists")

    user = UserAccount(
        email=payload.email,
        username=payload.username,
        full_name=payload.full_name,
        password_hash=_hash_password(payload.password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return MeOut(id=user.id, email=user.email, username=user.username, full_name=user.full_name)


@router.post("/login", response_model=AuthTokenOut)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    _require_auth_dependencies()
    user = db.query(UserAccount).filter(
        (UserAccount.email == payload.username_or_email) | (UserAccount.username == payload.username_or_email)
    ).first()
    if not user or not _verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    user.last_login_at = datetime.now(tz=timezone.utc)
    db.commit()
    return _create_access_token(user.email)


@router.get("/me", response_model=MeOut)
def me(
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
):
    _require_auth_dependencies()
    token = _parse_bearer_token(authorization)
    user = _current_user(db, token)
    return MeOut(id=user.id, email=user.email, username=user.username, full_name=user.full_name)
