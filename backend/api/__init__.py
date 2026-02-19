"""API router registry — mounts all sub-routers under /api prefix."""

from fastapi import APIRouter

from backend.api.admin import router as admin_router
from backend.api.dashboard import router as dashboard_router
from backend.api.projects import router as projects_router
from backend.api.vendors import router as vendors_router
from backend.api.financials import router as financials_router
from backend.api.crm import router as crm_router
from backend.api.team import router as team_router

api_router = APIRouter()
api_router.include_router(admin_router)
api_router.include_router(dashboard_router)
api_router.include_router(projects_router)
api_router.include_router(vendors_router)
api_router.include_router(financials_router)
api_router.include_router(crm_router)
api_router.include_router(team_router)
