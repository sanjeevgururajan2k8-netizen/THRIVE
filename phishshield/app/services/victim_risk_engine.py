from typing import List, Tuple
from app.models.member5 import Employee
from app.schemas.member5_schemas import RiskLevel

def calculate_exposure_score(employee: Employee) -> int:
    """
    Calculate an employee exposure score using relevant employee characteristics.
    Factors: Privilege, System Access, Financial Access, Administrative Access, Data Sensitivity.
    Assumes attributes are 1-10.
    """
    score = (
        employee.privilege_level * 1.5 +
        employee.system_access * 1.2 +
        employee.financial_access * 1.5 +
        employee.administrative_access * 1.3 +
        employee.data_sensitivity * 1.5
    )
    normalized = (score / 70.0) * 100
    return min(int(normalized), 100)

def calculate_business_impact_score(employee: Employee) -> int:
    """
    Calculate business impact.
    Factors: Business Criticality, Financial Access, Data Sensitivity, Administrative Access.
    Assumes attributes are 1-10.
    """
    score = (
        employee.business_criticality * 2.0 +
        employee.financial_access * 1.5 +
        employee.data_sensitivity * 1.5 +
        employee.administrative_access * 1.0
    )
    normalized = (score / 60.0) * 100
    return min(int(normalized), 100)

def calculate_victim_risk(threat: float, exposure: float, impact: float) -> float:
    """
    Victim Risk = f(Threat, Exposure, Business Impact)
    """
    risk = (threat * 0.4) + (exposure * 0.3) + (impact * 0.3)
    return min(round(risk, 2), 100.0)

def get_risk_level(score: float) -> RiskLevel:
    """
    0-29: LOW, 30-59: MEDIUM, 60-84: HIGH, 85-100: CRITICAL
    """
    if score < 30:
        return RiskLevel.LOW
    elif score < 60:
        return RiskLevel.MEDIUM
    elif score < 85:
        return RiskLevel.HIGH
    else:
        return RiskLevel.CRITICAL

def generate_risk_explanation(threat: float, employee: Employee) -> List[str]:
    reasons = []
    if threat >= 80:
        reasons.append("High-threat email detected")
    elif threat >= 50:
        reasons.append("Medium-threat email detected")

    if employee.financial_access >= 8:
        reasons.append("Employee has significant financial access")
    if employee.data_sensitivity >= 8:
        reasons.append("Employee handles highly sensitive data")
    if employee.privilege_level >= 8 or employee.administrative_access >= 8:
        reasons.append("Employee has elevated administrative privileges")
    if employee.business_criticality >= 8:
        reasons.append("Employee role has high business criticality")
        
    if not reasons:
        reasons.append("Standard risk factors apply")
    return reasons
