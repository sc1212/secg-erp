"""API router registry — mounts all sub-routers under /api prefix."""

from fastapi import APIRouter

from backend.api.admin import router as admin_router
from backend.api.dashboard import router as dashboard_router
from backend.api.projects import router as projects_router
from backend.api.vendors import router as vendors_router
from backend.api.financials import router as financials_router
from backend.api.crm import router as crm_router
from backend.api.team import router as team_router
from backend.api.billing import router as billing_router
from backend.api.auth import router as auth_router
from backend.api.calendar import router as calendar_router
from backend.api.daily_logs import router as daily_logs_router
from backend.api.weather import router as weather_router
from backend.api.documents import router as documents_router
from backend.api.inventory import router as inventory_router
from backend.api.fleet import router as fleet_router
from backend.api.safety import router as safety_router
from backend.api.warranty import router as warranty_router
from backend.api.scorecard import router as scorecard_router
from backend.api.portal import router as portal_router
from backend.api.briefing import router as briefing_router
from backend.api.notifications import router as notifications_router
from backend.api.exceptions_queue import router as exceptions_router
from backend.api.approvals import router as approvals_router
from backend.api.timeclock import router as timeclock_router
from backend.api.purchase_orders import router as purchase_orders_router
from backend.api.draw_requests import router as draw_requests_router
from backend.api.permits import router as permits_router
from backend.api.profit_fade import router as profit_fade_router
from backend.api.cash_flow import router as cash_flow_router
from backend.api.search import router as search_router

api_router = APIRouter()
api_router.include_router(admin_router)
api_router.include_router(dashboard_router)
api_router.include_router(projects_router)
api_router.include_router(vendors_router)
api_router.include_router(financials_router)
api_router.include_router(crm_router)
api_router.include_router(team_router)
api_router.include_router(billing_router)
api_router.include_router(auth_router)
api_router.include_router(calendar_router)
api_router.include_router(daily_logs_router)
api_router.include_router(weather_router)
api_router.include_router(documents_router)
api_router.include_router(inventory_router)
api_router.include_router(fleet_router)
api_router.include_router(safety_router)
api_router.include_router(warranty_router)
api_router.include_router(scorecard_router)
api_router.include_router(portal_router)
api_router.include_router(briefing_router)
api_router.include_router(notifications_router)
api_router.include_router(exceptions_router)
api_router.include_router(approvals_router)
api_router.include_router(timeclock_router)
api_router.include_router(purchase_orders_router)
api_router.include_router(draw_requests_router)
api_router.include_router(permits_router)
api_router.include_router(profit_fade_router)
api_router.include_router(cash_flow_router)
api_router.include_router(search_router)
