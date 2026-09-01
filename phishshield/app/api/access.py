from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.member5 import Employee
from app.schemas.member5_schemas import AccessEvaluateRequest, AccessEvaluateResponse
from app.services.victim_risk_engine import (
    calculate_exposure_score, calculate_business_impact_score, 
    calculate_victim_risk, get_risk_level
)
from app.services.action_risk_engine import calculate_action_risk
from app.services.access_boundary import AccessPolicy

router = APIRouter(prefix="/api/access", tags=["Access Control"])

@router.post("/evaluate", response_model=AccessEvaluateResponse)
def evaluate_access(req: AccessEvaluateRequest, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == req.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    exposure = calculate_exposure_score(emp)
    impact = calculate_business_impact_score(emp)
    threat = req.threat_score
    victim_score = calculate_victim_risk(threat, exposure, impact)
    
    action_risk = calculate_action_risk(victim_score, req.action)
    decision, allowed, reason, warning = AccessPolicy.evaluate(action_risk, req.action)
    
    risk_level = get_risk_level(action_risk)
    
    return AccessEvaluateResponse(
        decision=decision,
        risk_score=action_risk,
        risk_level=risk_level,
        action=req.action,
        allowed=allowed,
        reason=reason,
        requires_warning=warning
    )
