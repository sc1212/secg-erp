"""Fleet & Equipment API — vehicles, maintenance, fuel logs, alerts."""

from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from backend.core.deps import get_db
from backend.models.fleet import FleetVehicle, MaintenanceSchedule, MaintenanceLog, FuelLog
from backend.schemas.fleet import (
    FleetVehicleOut, FleetVehicleCreate, FleetVehicleUpdate, FleetVehicleDetailOut,
    MaintenanceScheduleOut,
    MaintenanceLogOut, MaintenanceLogCreate,
    FuelLogOut, FuelLogCreate,
    MaintenanceAlertOut,
)

router = APIRouter(prefix="/fleet", tags=["Fleet"])


# ── Vehicles CRUD ──────────────────────────────────────────────────────

@router.get("/alerts", response_model=list[MaintenanceAlertOut])
def maintenance_alerts(
    miles_threshold: int = Query(1000, description="Miles-until-due threshold"),
    days_threshold: int = Query(30, description="Days-until-due threshold"),
    db: Session = Depends(get_db),
):
    """Upcoming maintenance due within mileage or date threshold."""
    today = date.today()
    cutoff_date = today + timedelta(days=days_threshold)

    schedules = (
        db.query(MaintenanceSchedule)
        .join(FleetVehicle)
        .filter(FleetVehicle.status != "sold")
        .options(joinedload(MaintenanceSchedule.vehicle))
        .all()
    )

    alerts = []
    for s in schedules:
        vehicle = s.vehicle
        miles_until = None
        days_until = None
        urgency = "upcoming"

        if s.next_due_mileage and vehicle.current_mileage:
            miles_until = s.next_due_mileage - vehicle.current_mileage
            if miles_until <= 0:
                urgency = "overdue"
            elif miles_until <= miles_threshold // 3:
                urgency = "due_soon"

        if s.next_due_date:
            days_until = (s.next_due_date - today).days
            if days_until <= 0:
                urgency = "overdue"
            elif days_until <= days_threshold // 3:
                urgency = "due_soon"

        # Only include if within threshold
        within_miles = miles_until is not None and miles_until <= miles_threshold
        within_days = s.next_due_date is not None and s.next_due_date <= cutoff_date
        if within_miles or within_days:
            alerts.append(MaintenanceAlertOut(
                vehicle_id=vehicle.id,
                vehicle_name=vehicle.name,
                service_type=s.service_type,
                next_due_date=s.next_due_date,
                next_due_mileage=s.next_due_mileage,
                current_mileage=vehicle.current_mileage or 0,
                miles_until_due=miles_until,
                days_until_due=days_until,
                urgency=urgency,
            ))

    # Sort: overdue first, then due_soon, then upcoming
    priority = {"overdue": 0, "due_soon": 1, "upcoming": 2}
    alerts.sort(key=lambda a: (priority.get(a.urgency, 9), a.miles_until_due or 9999))
    return alerts


@router.get("", response_model=list[FleetVehicleOut])
def list_vehicles(
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by name, VIN, or plate"),
    db: Session = Depends(get_db),
):
    """List all fleet vehicles with optional filters."""
    q = db.query(FleetVehicle)
    if status:
        q = q.filter(FleetVehicle.status == status)
    if search:
        pattern = f"%{search}%"
        q = q.filter(
            FleetVehicle.name.ilike(pattern)
            | FleetVehicle.vin.ilike(pattern)
            | FleetVehicle.license_plate.ilike(pattern)
        )
    return q.order_by(FleetVehicle.name).all()


@router.get("/{vehicle_id}", response_model=FleetVehicleDetailOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """Get vehicle detail with maintenance schedules, logs, and fuel history."""
    vehicle = (
        db.query(FleetVehicle)
        .options(
            joinedload(FleetVehicle.maintenance_schedules),
            joinedload(FleetVehicle.maintenance_logs),
            joinedload(FleetVehicle.fuel_logs),
        )
        .filter(FleetVehicle.id == vehicle_id)
        .first()
    )
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    return FleetVehicleDetailOut.model_validate(vehicle)


@router.post("", response_model=FleetVehicleOut, status_code=201)
def create_vehicle(payload: FleetVehicleCreate, db: Session = Depends(get_db)):
    """Add a new vehicle to the fleet."""
    vehicle = FleetVehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.patch("/{vehicle_id}", response_model=FleetVehicleOut)
def update_vehicle(vehicle_id: int, payload: FleetVehicleUpdate, db: Session = Depends(get_db)):
    """Update an existing vehicle."""
    vehicle = db.query(FleetVehicle).filter(FleetVehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(vehicle, field, value)

    db.commit()
    db.refresh(vehicle)
    return vehicle


# ── Maintenance ────────────────────────────────────────────────────────

@router.get("/{vehicle_id}/maintenance", response_model=list[MaintenanceLogOut])
def list_maintenance(vehicle_id: int, db: Session = Depends(get_db)):
    """Get maintenance logs for a vehicle."""
    vehicle = db.query(FleetVehicle).filter(FleetVehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    return (
        db.query(MaintenanceLog)
        .filter(MaintenanceLog.vehicle_id == vehicle_id)
        .order_by(MaintenanceLog.performed_date.desc())
        .all()
    )


@router.post("/{vehicle_id}/maintenance", response_model=MaintenanceLogOut, status_code=201)
def log_maintenance(vehicle_id: int, payload: MaintenanceLogCreate, db: Session = Depends(get_db)):
    """Log a maintenance event for a vehicle."""
    vehicle = db.query(FleetVehicle).filter(FleetVehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")

    log = MaintenanceLog(vehicle_id=vehicle_id, **payload.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


# ── Fuel ───────────────────────────────────────────────────────────────

@router.get("/{vehicle_id}/fuel", response_model=list[FuelLogOut])
def list_fuel(vehicle_id: int, db: Session = Depends(get_db)):
    """Get fuel logs for a vehicle."""
    vehicle = db.query(FleetVehicle).filter(FleetVehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    return (
        db.query(FuelLog)
        .filter(FuelLog.vehicle_id == vehicle_id)
        .order_by(FuelLog.fill_date.desc())
        .all()
    )


@router.post("/{vehicle_id}/fuel", response_model=FuelLogOut, status_code=201)
def log_fuel(vehicle_id: int, payload: FuelLogCreate, db: Session = Depends(get_db)):
    """Log a fuel fill-up for a vehicle."""
    vehicle = db.query(FleetVehicle).filter(FleetVehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")

    fuel = FuelLog(vehicle_id=vehicle_id, **payload.model_dump())
    db.add(fuel)
    db.commit()
    db.refresh(fuel)
    return fuel
