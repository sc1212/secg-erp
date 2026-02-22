"""Application configuration loaded from environment variables."""

import os
from dataclasses import dataclass, field
from typing import List


@dataclass
class Settings:
    # Database
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://secg_user:secg_local_dev_2026@localhost:5432/secg_erp",
    )
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    echo_sql: bool = os.getenv("ECHO_SQL", "false").lower() == "true"
    import_batch_size: int = int(os.getenv("IMPORT_BATCH_SIZE", "500"))

    # API
    api_title: str = "SECG ERP API"
    api_version: str = "1.0.0"
    api_prefix: str = "/api"
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Auth
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_exp_minutes: int = int(os.getenv("ACCESS_TOKEN_EXP_MINUTES", "60"))

    # Billing
    stripe_secret_key: str = os.getenv("STRIPE_SECRET_KEY", "")
    stripe_webhook_secret: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    # CORS
    cors_origins: List[str] = field(default_factory=lambda: [
        o.strip() for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:5173,"
            "https://secg-erp.onrender.com,https://secg-erp-pi9h.onrender.com,"
            "https://secg-erp-api.onrender.com"
        ).split(",")
    ])

    # Railway injects DATABASE_URL with postgres:// prefix; SQLAlchemy 2.x needs postgresql://
    def __post_init__(self):
        if self.database_url.startswith("postgres://"):
            self.database_url = self.database_url.replace("postgres://", "postgresql://", 1)


settings = Settings()
