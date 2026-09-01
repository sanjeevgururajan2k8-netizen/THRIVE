from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base

# Association table for Campaign <-> Incident
campaign_incident_association = Table(
    'campaign_incident',
    Base.metadata,
    Column('campaign_id', String, ForeignKey('campaigns.id')),
    Column('incident_id', String, ForeignKey('incidents.id'))
)

# Association table for Campaign <-> IOC
campaign_ioc_association = Table(
    'campaign_ioc',
    Base.metadata,
    Column('campaign_id', String, ForeignKey('campaigns.id')),
    Column('ioc_id', Integer, ForeignKey('iocs.id'))
)


class IOC(Base):
    __tablename__ = "iocs"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)  # EMAIL, DOMAIN, URL, IP, MD5, SHA1, SHA256, ATTACHMENT
    raw_value = Column(String)
    normalized_value = Column(String, index=True, unique=True)
    first_seen = Column(DateTime, default=datetime.utcnow, index=True)
    last_seen = Column(DateTime, default=datetime.utcnow, index=True)
    reputation_score = Column(Float, default=0.0, index=True)
    confidence = Column(Float, default=0.0)
    malicious = Column(Boolean, default=False, index=True)
    sources = Column(String)  # JSON encoded list of sources
    times_seen = Column(Integer, default=1)
    incident_count = Column(Integer, default=0)
    campaign_count = Column(Integer, default=0)
    affected_user_count = Column(Integer, default=0)
    status = Column(String, default="ACTIVE")
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    campaigns = relationship("Campaign", secondary=campaign_ioc_association, back_populates="iocs")


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, index=True)  # e.g., PAYPAL-CAMP-001
    campaign_key = Column(String, unique=True, index=True)
    name = Column(String)
    status = Column(String, default="ACTIVE")  # ACTIVE, MONITORING, CONTAINED, CLOSED
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    email_count = Column(Integer, default=0)
    target_count = Column(Integer, default=0)
    affected_user_count = Column(Integer, default=0)
    department_count = Column(Integer, default=0)
    risk_score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    primary_brand = Column(String, nullable=True)
    primary_domain = Column(String, nullable=True)
    primary_url = Column(String, nullable=True)
    campaign_dna_hash = Column(String, index=True, nullable=True)
    campaign_dna = Column(Text, default="{}") # JSON encoded features
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    incidents = relationship("Incident", secondary=campaign_incident_association, back_populates="campaigns")
    iocs = relationship("IOC", secondary=campaign_ioc_association, back_populates="campaigns")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    sender = Column(String)
    recipient = Column(String)
    subject = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    raw_content = Column(Text, nullable=True)
    
    campaigns = relationship("Campaign", secondary=campaign_incident_association, back_populates="incidents")


class Victim(Base):
    __tablename__ = "victims"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    department = Column(String, nullable=True)
    risk = Column(Float, default=0.0)
    
    # Simple denormalized counters for hackathon scope
    emails_delivered = Column(Integer, default=0)
    emails_opened = Column(Integer, default=0)
    urls_clicked = Column(Integer, default=0)
    attachments_downloaded = Column(Integer, default=0)
    credentials_submitted = Column(Integer, default=0)
