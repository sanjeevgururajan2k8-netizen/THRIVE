"""
Member 5 — Demo Seed Data
==========================
Run this script to populate the database with:
  - 3 realistic employees (Marketing Intern, Finance Manager, IT Administrator)
  - Contact relationship history per employee
  - Sample behavior baselines

Usage:
  cd phishshield
  python seed/seed_member5.py
"""

import sys
import os

# Allow running from project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal, engine, Base
from app.models import member5  # registers models with Base

# Create all tables
Base.metadata.create_all(bind=engine)

from app.models.member5 import Employee, ContactRelationship, BehaviorEvent

def seed():
    db = SessionLocal()
    try:
        # ------------------------------------------------------------------ #
        # Employees — three different risk profiles for the demo
        # ------------------------------------------------------------------ #
        employees = [
            Employee(
                employee_id="EMP-001",
                name="Alex Chen",
                email="alex.chen@company.com",
                role="Marketing Intern",
                department="Marketing",
                privilege_level=1,
                system_access=2,
                financial_access=1,
                administrative_access=1,
                data_sensitivity=2,
                business_criticality=2,
            ),
            Employee(
                employee_id="EMP-002",
                name="Sarah Johnson",
                email="sarah.johnson@company.com",
                role="Finance Manager",
                department="Finance",
                privilege_level=8,
                system_access=8,
                financial_access=10,
                administrative_access=5,
                data_sensitivity=9,
                business_criticality=9,
            ),
            Employee(
                employee_id="EMP-003",
                name="Marcus Williams",
                email="marcus.williams@company.com",
                role="IT Administrator",
                department="IT",
                privilege_level=10,
                system_access=10,
                financial_access=5,
                administrative_access=10,
                data_sensitivity=9,
                business_criticality=10,
            ),
        ]

        for emp in employees:
            existing = db.query(Employee).filter(Employee.employee_id == emp.employee_id).first()
            if not existing:
                db.add(emp)
                print(f"  ✅ Created employee: {emp.name} ({emp.role})")
            else:
                print(f"  ⚠️  Employee already exists: {emp.name}")

        db.commit()

        # ------------------------------------------------------------------ #
        # Contact Relationships — known vs unknown contacts per employee
        # ------------------------------------------------------------------ #
        now = datetime.now(timezone.utc)
        contacts = [
            # EMP-001 (Intern) — knows some people internally
            ContactRelationship(
                employee_id="EMP-001",
                contact_email="manager@company.com",
                interaction_count=35,
                first_seen=now - timedelta(days=180),
                last_seen=now - timedelta(days=1),
                relationship_strength="STRONG",
                known_domain=True,
            ),
            ContactRelationship(
                employee_id="EMP-001",
                contact_email="recruiter@agency.com",
                interaction_count=3,
                first_seen=now - timedelta(days=30),
                last_seen=now - timedelta(days=5),
                relationship_strength="WEAK",
                known_domain=False,
            ),
            # EMP-002 (Finance Manager) — knows vendors and internal finance team
            ContactRelationship(
                employee_id="EMP-002",
                contact_email="vendor@trustedsupplier.com",
                interaction_count=120,
                first_seen=now - timedelta(days=730),
                last_seen=now - timedelta(days=2),
                relationship_strength="STRONG",
                known_domain=True,
            ),
            ContactRelationship(
                employee_id="EMP-002",
                contact_email="cfo@company.com",
                interaction_count=200,
                first_seen=now - timedelta(days=365),
                last_seen=now - timedelta(hours=3),
                relationship_strength="STRONG",
                known_domain=True,
            ),
            # EMP-003 (IT Admin) — knows IT vendors
            ContactRelationship(
                employee_id="EMP-003",
                contact_email="support@itvendor.com",
                interaction_count=80,
                first_seen=now - timedelta(days=400),
                last_seen=now - timedelta(days=7),
                relationship_strength="NORMAL",
                known_domain=True,
            ),
        ]

        for contact in contacts:
            existing = db.query(ContactRelationship).filter(
                ContactRelationship.employee_id == contact.employee_id,
                ContactRelationship.contact_email == contact.contact_email
            ).first()
            if not existing:
                db.add(contact)
                print(f"  ✅ Created contact: {contact.employee_id} ↔ {contact.contact_email}")
            else:
                print(f"  ⚠️  Contact relationship already exists: {contact.employee_id} ↔ {contact.contact_email}")

        db.commit()

        # ------------------------------------------------------------------ #
        # Behavior Events — sample historical events
        # ------------------------------------------------------------------ #
        events = [
            # Normal intern activity
            BehaviorEvent(
                employee_id="EMP-001",
                event_type="EMAIL_SENT",
                timestamp=now - timedelta(hours=5),
                metadata_json='{"recipient": "manager@company.com", "subject": "Weekly Report"}',
                anomaly_score=0.0,
            ),
            # Finance manager normal activity
            BehaviorEvent(
                employee_id="EMP-002",
                event_type="EMAIL_SENT",
                timestamp=now - timedelta(hours=2),
                metadata_json='{"recipient": "vendor@trustedsupplier.com", "subject": "Invoice Q3"}',
                anomaly_score=0.0,
            ),
            # IT admin — normal login
            BehaviorEvent(
                employee_id="EMP-003",
                event_type="UNUSUAL_LOGIN_TIME",
                timestamp=now - timedelta(hours=10),
                metadata_json='{"login_hour": 2, "reason": "maintenance_window"}',
                anomaly_score=35.0,
            ),
        ]

        for event in events:
            db.add(event)
            print(f"  ✅ Created behavior event: {event.employee_id} — {event.event_type}")

        db.commit()
        print("\n🎉 Seed data complete!")
        print("\nDemo scenario ready:")
        print("  EMP-001 → Marketing Intern  (low risk profile)")
        print("  EMP-002 → Finance Manager   (high risk profile)")
        print("  EMP-003 → IT Administrator  (critical risk profile)")
        print("\nTest the demo with:")
        print("  POST /api/risk/evaluate  { email_id, employee_id, threat_score: 94 }")

    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding Member 5 demo data...\n")
    seed()
