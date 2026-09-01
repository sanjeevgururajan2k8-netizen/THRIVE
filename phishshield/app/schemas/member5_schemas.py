from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class ActionType(str, Enum):
    READ = "READ"
    CLICK_URL = "CLICK_URL"
    DOWNLOAD_ATTACHMENT = "DOWNLOAD_ATTACHMENT"
    REPLY = "REPLY"
    FORWARD = "FORWARD"
    ENTER_PASSWORD = "ENTER_PASSWORD"
    ENTER_OTP = "ENTER_OTP"
    SUBMIT_CREDENTIALS = "SUBMIT_CREDENTIALS"
    MAKE_PAYMENT = "MAKE_PAYMENT"

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AccessDecision(str, Enum):
    ALLOW = "ALLOW"
    WARN = "WARN"
    RESTRICT = "RESTRICT"
    BLOCK = "BLOCK"

class EmployeeBase(BaseModel):
    employee_id: str
    name: str
    email: EmailStr
    role: str
    department: str
    privilege_level: int = 1
    system_access: int = 1
    financial_access: int = 1
    administrative_access: int = 1
    data_sensitivity: int = 1
    business_criticality: int = 1

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime

class RiskProfileResponse(BaseModel):
    employee_id: str
    role: str
    department: str
    privilege_level: int
    system_access: int
    financial_access: int
    data_sensitivity: int
    business_criticality: int
    exposure_score: int
    business_impact_score: int

class BehaviorEvaluation(BaseModel):
    anomaly_detected: bool
    anomaly_score: float
    indicators: List[str] = []

class ContactEvaluation(BaseModel):
    is_new_contact: bool
    relationship_strength: str
    contact_risk: float

class VictimRiskResponse(BaseModel):
    email_id: str
    employee_id: str
    threat_score: float
    exposure_score: float
    business_impact_score: float
    victim_risk_score: float
    risk_level: RiskLevel
    explanation: List[str]
    behavior: BehaviorEvaluation
    contact: ContactEvaluation
    recommendation: AccessDecision

class EvaluateRiskRequest(BaseModel):
    email_id: str
    employee_id: str
    threat_score: float = 0.0 # Optional mockup input from upstream
    sender_email: str = "unknown@example.com"
    current_volume: int = 20

class ActionEvaluateRequest(BaseModel):
    email_id: str
    employee_id: str
    action: ActionType
    threat_score: float = 0.0

class ActionRiskResponse(BaseModel):
    action: ActionType
    action_risk: float
    decision: AccessDecision
    allowed: bool
    reason: str

class AccessEvaluateRequest(BaseModel):
    employee_id: str
    email_id: str
    action: ActionType
    threat_score: float = 0.0

class AccessEvaluateResponse(BaseModel):
    decision: AccessDecision
    risk_score: float
    risk_level: RiskLevel
    action: ActionType
    allowed: bool
    reason: str
    requires_warning: bool
