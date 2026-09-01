from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    role = Column(String)
    department = Column(String)
    
    # Access and privilege metrics (e.g., 1-10)
    privilege_level = Column(Integer, default=1)
    system_access = Column(Integer, default=1)
    financial_access = Column(Integer, default=1)
    administrative_access = Column(Integer, default=1)
    data_sensitivity = Column(Integer, default=1)
    business_criticality = Column(Integer, default=1)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(String, index=True)
    employee_id = Column(String, ForeignKey("employees.employee_id"), index=True)
    
    threat_score = Column(Float, default=0.0)
    exposure_score = Column(Float, default=0.0)
    business_impact_score = Column(Float, default=0.0)
    victim_risk_score = Column(Float, default=0.0)
    risk_level = Column(String) # LOW, MEDIUM, HIGH, CRITICAL
    
    behavior_score = Column(Float, nullable=True)
    contact_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    employee = relationship("Employee")

class BehaviorEvent(Base):
    __tablename__ = "behavior_events"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.employee_id"), index=True)
    event_type = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(Text, default="{}")
    anomaly_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    employee = relationship("Employee")

class ContactRelationship(Base):
    __tablename__ = "contact_relationships"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.employee_id"), index=True)
    contact_email = Column(String, index=True)
    interaction_count = Column(Integer, default=0)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    relationship_strength = Column(String, default="UNKNOWN") # UNKNOWN, WEAK, NORMAL, STRONG
    known_domain = Column(Boolean, default=False)
    
    employee = relationship("Employee")
