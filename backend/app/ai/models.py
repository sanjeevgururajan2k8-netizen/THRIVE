from pydantic import BaseModel, Field
from typing import List, Optional

class URLAnalysis(BaseModel):
    url: str
    reputation: str = "unknown"
    lookalike: bool = False

class AttachmentAnalysis(BaseModel):
    filename: str
    dangerous: bool = False

class AIAnalysisRequest(BaseModel):
    subject: str = ""
    body: str = ""
    sender: str = ""
    reply_to: str = ""
    urls: List[URLAnalysis] = []
    attachments: List[AttachmentAnalysis] = []

class IntentResult(BaseModel):
    label: str
    confidence: int = Field(ge=0, le=100)
    evidence: List[str] = []

class PsychologyResult(BaseModel):
    fear: int = Field(ge=0, le=100)
    urgency: int = Field(ge=0, le=100)
    authority: int = Field(ge=0, le=100)
    greed: int = Field(ge=0, le=100)
    panic: int = Field(ge=0, le=100)
    manipulation: int = Field(ge=0, le=100)

class ThreatIndicator(BaseModel):
    type: str
    severity: str
    evidence: str

class SuspiciousRequest(BaseModel):
    type: str
    severity: str
    evidence: str

class AIAnalysisResponse(BaseModel):
    phishing_probability: int = Field(ge=0, le=100)
    classification: str
    confidence: int = Field(ge=0, le=100)
    intent: IntentResult
    psychology: PsychologyResult
    indicators: List[ThreatIndicator] = []
    suspicious_requests: List[SuspiciousRequest] = []
    explanation: str
    evidence: List[str] = []
