from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.member5 import Employee, RiskScore, ContactRelationship
from app.schemas.member5_schemas import (
    EvaluateRiskRequest, ActionEvaluateRequest, ActionRiskResponse,
    BehaviorEvaluation, ContactEvaluation, ActionType
)
from app.services.victim_risk_engine import (
    calculate_exposure_score, calculate_business_impact_score,
    calculate_victim_risk, get_risk_level, generate_risk_explanation
)
from app.services.action_risk_engine import calculate_action_risk
from app.services.access_boundary import AccessPolicy
from app.services.behavioral_engine import detect_behavioral_anomaly
from app.services.contact_risk_engine import evaluate_contact_risk
from app.adapters.threat_intel_adapter import derive_threat_score_from_db

router = APIRouter(prefix="/api/risk", tags=["Risk Analysis"])

@router.post("/evaluate")
def evaluate_victim_risk(req: EvaluateRiskRequest, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == req.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    exposure = calculate_exposure_score(emp)
    impact = calculate_business_impact_score(emp)

    # Auto-derive threat score from Members 2–4 DB if not explicitly provided
    if req.threat_score == 0.0:
        threat = derive_threat_score_from_db(db, req.email_id, req.sender_email)
    else:
        threat = req.threat_score
    
    victim_score = calculate_victim_risk(threat, exposure, impact)
    level = get_risk_level(victim_score)
    explanation = generate_risk_explanation(threat, emp)
    
    # --- Behavioral Analysis ---
    baseline = {
        "normal_start_hour": 8,
        "normal_end_hour": 19,
        "average_daily_emails": 20
    }
    current_event = {
        "current_volume": req.current_volume
    }
    is_anomaly, anomaly_score, indicators = detect_behavioral_anomaly(current_event, baseline)
    behavior_eval = BehaviorEvaluation(
        anomaly_detected=is_anomaly,
        anomaly_score=anomaly_score,
        indicators=indicators
    )
    
    # --- Contact Risk Engine ---
    contact_rel = db.query(ContactRelationship).filter(
        ContactRelationship.employee_id == req.employee_id,
        ContactRelationship.contact_email == req.sender_email
    ).first()
    
    is_new = contact_rel is None
    contact_risk = evaluate_contact_risk(contact_rel, is_new)
    rel_strength = contact_rel.relationship_strength if contact_rel else "UNKNOWN"
    
    contact_eval = ContactEvaluation(
        is_new_contact=is_new,
        relationship_strength=rel_strength,
        contact_risk=contact_risk
    )
    
    # --- Recommendation (Action Boundary) ---
    # Default recommendation for base access (READ)
    action_risk = calculate_action_risk(victim_score, ActionType.READ)
    decision, _, _, _ = AccessPolicy.evaluate(action_risk, ActionType.READ)
    
    db_risk = RiskScore(
        email_id=req.email_id,
        employee_id=emp.employee_id,
        threat_score=threat,
        exposure_score=exposure,
        business_impact_score=impact,
        victim_risk_score=victim_score,
        risk_level=level,
        behavior_score=anomaly_score,
        contact_score=contact_risk
    )
    db.add(db_risk)
    db.commit()
    
    return {
        "email_id": req.email_id,
        "employee_id": req.employee_id,
        "threat_score": threat,
        "exposure_score": exposure,
        "business_impact_score": impact,
        "victim_risk_score": victim_score,
        "risk_level": level,
        "explanation": explanation,
        "behavior": behavior_eval.model_dump(),
        "contact": contact_eval.model_dump(),
        "recommendation": decision
    }

@router.post("/action", response_model=ActionRiskResponse)
def evaluate_action_risk(req: ActionEvaluateRequest, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == req.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    exposure = calculate_exposure_score(emp)
    impact = calculate_business_impact_score(emp)
    threat = req.threat_score
    victim_score = calculate_victim_risk(threat, exposure, impact)
    
    action_risk = calculate_action_risk(victim_score, req.action)
    decision, allowed, reason, warning = AccessPolicy.evaluate(action_risk, req.action)
    
    return ActionRiskResponse(
        action=req.action,
        action_risk=action_risk,
        decision=decision,
        allowed=allowed,
        reason=reason
    )
