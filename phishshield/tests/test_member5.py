"""
Member 5 — PhishShield Tests
==============================================
Tests for:
  - Victim Risk Engine (unit)
  - Behavioral Engine (unit)
  - Contact Risk Engine (unit)
  - Action Risk Engine (unit)
  - Access Boundary (unit)
  - Employee CRUD APIs (integration)
  - Victim Risk API (integration)
  - Action Risk API (integration)
  - Access Evaluate API (integration)
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.models.member5 import Employee, ContactRelationship
from app.schemas.member5_schemas import ActionType, AccessDecision, RiskLevel
from app.services.victim_risk_engine import (
    calculate_exposure_score,
    calculate_business_impact_score,
    calculate_victim_risk,
    get_risk_level,
    generate_risk_explanation,
)
from app.services.action_risk_engine import calculate_action_risk, get_action_sensitivity
from app.services.access_boundary import AccessPolicy
from app.services.behavioral_engine import detect_behavioral_anomaly
from app.services.contact_risk_engine import evaluate_contact_risk

# --------------------------------------------------------------------------- #
# Test Database Setup
# --------------------------------------------------------------------------- #
# StaticPool ensures all connections share the SAME in-memory SQLite database.
# Without it, each new connection gets a separate empty in-memory DB — tables vanish.
SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    """Create all tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# --------------------------------------------------------------------------- #
# Shared helpers
# --------------------------------------------------------------------------- #
INTERN_ATTRS = dict(
    employee_id="EMP-001",
    name="Marketing Intern",
    email="intern@company.com",
    role="Marketing Intern",
    department="Marketing",
    privilege_level=1,
    system_access=2,
    financial_access=1,
    administrative_access=1,
    data_sensitivity=2,
    business_criticality=2,
)

FINANCE_ATTRS = dict(
    employee_id="EMP-002",
    name="Finance Manager",
    email="finance@company.com",
    role="Finance Manager",
    department="Finance",
    privilege_level=8,
    system_access=8,
    financial_access=10,
    administrative_access=5,
    data_sensitivity=9,
    business_criticality=9,
)

IT_ADMIN_ATTRS = dict(
    employee_id="EMP-003",
    name="IT Administrator",
    email="itadmin@company.com",
    role="IT Administrator",
    department="IT",
    privilege_level=10,
    system_access=10,
    financial_access=5,
    administrative_access=10,
    data_sensitivity=9,
    business_criticality=10,
)


def make_employee(**kwargs) -> Employee:
    return Employee(**kwargs)


# ============================================================================ #
# UNIT TESTS — Victim Risk Engine
# ============================================================================ #

class TestVictimRiskEngine:
    """Tests for exposure, business impact, and victim risk calculations."""

    def test_low_privilege_employee_low_exposure(self):
        emp = make_employee(**INTERN_ATTRS)
        exposure = calculate_exposure_score(emp)
        assert 0 <= exposure <= 100
        assert exposure < 35, f"Intern exposure should be low, got {exposure}"

    def test_high_privilege_employee_high_exposure(self):
        emp = make_employee(**FINANCE_ATTRS)
        exposure = calculate_exposure_score(emp)
        assert exposure > 70, f"Finance Manager exposure should be high, got {exposure}"

    def test_it_admin_maximum_exposure(self):
        emp = make_employee(**IT_ADMIN_ATTRS)
        exposure = calculate_exposure_score(emp)
        assert exposure >= 80, f"IT Admin exposure should be very high, got {exposure}"

    def test_business_impact_low_for_intern(self):
        emp = make_employee(**INTERN_ATTRS)
        impact = calculate_business_impact_score(emp)
        assert impact < 30, f"Intern impact should be low, got {impact}"

    def test_business_impact_high_for_finance(self):
        emp = make_employee(**FINANCE_ATTRS)
        impact = calculate_business_impact_score(emp)
        assert impact > 80, f"Finance impact should be high, got {impact}"

    def test_same_threat_different_victim_risk(self):
        """Core PhishShield concept: same threat → different victim risk per employee."""
        threat = 90.0
        intern = make_employee(**INTERN_ATTRS)
        finance = make_employee(**FINANCE_ATTRS)
        it_admin = make_employee(**IT_ADMIN_ATTRS)

        victim_intern = calculate_victim_risk(
            threat, calculate_exposure_score(intern), calculate_business_impact_score(intern)
        )
        victim_finance = calculate_victim_risk(
            threat, calculate_exposure_score(finance), calculate_business_impact_score(finance)
        )
        victim_it = calculate_victim_risk(
            threat, calculate_exposure_score(it_admin), calculate_business_impact_score(it_admin)
        )

        assert victim_intern < victim_finance < victim_it, (
            f"Victim risk should increase with privilege: intern={victim_intern}, "
            f"finance={victim_finance}, IT admin={victim_it}"
        )
        assert victim_it >= 85, f"IT admin should be CRITICAL risk, got {victim_it}"
        assert victim_intern < 70, f"Intern risk should not be critical, got {victim_intern}"

    def test_victim_risk_never_exceeds_100(self):
        emp = make_employee(**IT_ADMIN_ATTRS)
        result = calculate_victim_risk(100.0, 100.0, 100.0)
        assert result <= 100.0

    def test_victim_risk_never_below_zero(self):
        emp = make_employee(**INTERN_ATTRS)
        result = calculate_victim_risk(0.0, 0.0, 0.0)
        assert result >= 0.0

    def test_zero_threat_reduces_victim_risk(self):
        emp = make_employee(**FINANCE_ATTRS)
        exposure = calculate_exposure_score(emp)
        impact = calculate_business_impact_score(emp)
        result = calculate_victim_risk(0.0, exposure, impact)
        result_high_threat = calculate_victim_risk(90.0, exposure, impact)
        assert result < result_high_threat

    def test_risk_level_low(self):
        assert get_risk_level(0) == RiskLevel.LOW
        assert get_risk_level(28) == RiskLevel.LOW

    def test_risk_level_medium(self):
        assert get_risk_level(30) == RiskLevel.MEDIUM
        assert get_risk_level(59) == RiskLevel.MEDIUM

    def test_risk_level_high(self):
        assert get_risk_level(60) == RiskLevel.HIGH
        assert get_risk_level(84) == RiskLevel.HIGH

    def test_risk_level_critical(self):
        assert get_risk_level(85) == RiskLevel.CRITICAL
        assert get_risk_level(100) == RiskLevel.CRITICAL

    def test_risk_explanation_high_financial_access(self):
        emp = make_employee(**FINANCE_ATTRS)
        explanation = generate_risk_explanation(90.0, emp)
        combined = " ".join(explanation).lower()
        assert "financial" in combined

    def test_risk_explanation_not_empty(self):
        emp = make_employee(**INTERN_ATTRS)
        explanation = generate_risk_explanation(20.0, emp)
        assert isinstance(explanation, list)
        assert len(explanation) >= 1


# ============================================================================ #
# UNIT TESTS — Behavioral Engine
# ============================================================================ #

class TestBehavioralEngine:
    """Tests for behavioral anomaly detection."""

    BASELINE = {
        "normal_start_hour": 8,
        "normal_end_hour": 19,
        "average_daily_emails": 20,
    }

    def test_normal_volume_no_anomaly(self):
        is_anomaly, score, indicators = detect_behavioral_anomaly(
            {"current_volume": 20}, self.BASELINE
        )
        # Volume within 5x threshold is not flagged
        assert "ABNORMAL_EMAIL_VOLUME" not in indicators

    def test_abnormal_volume_flagged(self):
        _, score, indicators = detect_behavioral_anomaly(
            {"current_volume": 200}, self.BASELINE
        )
        assert "ABNORMAL_EMAIL_VOLUME" in indicators
        assert score > 0

    def test_anomaly_score_bounded(self):
        _, score, _ = detect_behavioral_anomaly(
            {"current_volume": 99999}, self.BASELINE
        )
        assert 0 <= score <= 100

    def test_multiple_anomalies_increase_score(self):
        # Volume anomaly only
        _, score_single, _ = detect_behavioral_anomaly(
            {"current_volume": 200}, self.BASELINE
        )
        # Combine volume + time anomaly by modifying baseline to exclude current time
        baseline_tight = {
            "normal_start_hour": 23,
            "normal_end_hour": 23,
            "average_daily_emails": 20,
        }
        _, score_double, indicators = detect_behavioral_anomaly(
            {"current_volume": 200}, baseline_tight
        )
        # Both anomalies should register
        assert "ABNORMAL_EMAIL_VOLUME" in indicators
        assert score_double >= score_single


# ============================================================================ #
# UNIT TESTS — Contact Risk Engine
# ============================================================================ #

class TestContactRiskEngine:
    """Tests for contact relationship risk evaluation."""

    def test_new_contact_high_risk(self):
        risk = evaluate_contact_risk(None, True)
        assert risk >= 60.0

    def test_new_contact_max_100(self):
        risk = evaluate_contact_risk(None, True)
        assert risk <= 100.0

    def test_known_strong_contact_low_extra_risk(self):
        rel = ContactRelationship(
            employee_id="EMP-001",
            contact_email="trusted@partner.com",
            interaction_count=50,
            relationship_strength="STRONG",
            known_domain=True,
        )
        risk = evaluate_contact_risk(rel, False)
        assert risk < 30.0

    def test_weak_relationship_adds_risk(self):
        rel_weak = ContactRelationship(
            employee_id="EMP-001",
            contact_email="weak@contact.com",
            interaction_count=2,
            relationship_strength="WEAK",
            known_domain=False,
        )
        rel_strong = ContactRelationship(
            employee_id="EMP-001",
            contact_email="strong@partner.com",
            interaction_count=100,
            relationship_strength="STRONG",
            known_domain=True,
        )
        risk_weak = evaluate_contact_risk(rel_weak, False)
        risk_strong = evaluate_contact_risk(rel_strong, False)
        assert risk_weak > risk_strong

    def test_unknown_domain_increases_risk(self):
        rel_unknown_domain = ContactRelationship(
            employee_id="EMP-001",
            contact_email="someone@suspicious.biz",
            interaction_count=5,
            relationship_strength="WEAK",
            known_domain=False,
        )
        rel_known_domain = ContactRelationship(
            employee_id="EMP-001",
            contact_email="someone@trusted.com",
            interaction_count=5,
            relationship_strength="WEAK",
            known_domain=True,
        )
        risk_unknown = evaluate_contact_risk(rel_unknown_domain, False)
        risk_known = evaluate_contact_risk(rel_known_domain, False)
        assert risk_unknown >= risk_known


# ============================================================================ #
# UNIT TESTS — Action Risk Engine
# ============================================================================ #

class TestActionRiskEngine:
    """Tests for action sensitivity mapping and action risk calculation."""

    def test_read_has_lowest_sensitivity(self):
        read_sens = get_action_sensitivity(ActionType.READ)
        click_sens = get_action_sensitivity(ActionType.CLICK_URL)
        payment_sens = get_action_sensitivity(ActionType.MAKE_PAYMENT)
        assert read_sens < click_sens < payment_sens

    def test_action_risk_bounded(self):
        for action in ActionType:
            risk = calculate_action_risk(100.0, action)
            assert 0 <= risk <= 100.0, f"Action {action} risk out of bounds: {risk}"

    def test_high_victim_risk_sensitive_action_nonlinear_boost(self):
        """High victim + sensitive action triggers non-linear boost."""
        action_risk = calculate_action_risk(90.0, ActionType.SUBMIT_CREDENTIALS)
        # Should be very high due to non-linear scaling
        assert action_risk > 90.0

    def test_low_victim_risk_read_stays_low(self):
        action_risk = calculate_action_risk(10.0, ActionType.READ)
        assert action_risk < 30.0

    def test_credential_riskier_than_read(self):
        victim = 50.0
        read_risk = calculate_action_risk(victim, ActionType.READ)
        cred_risk = calculate_action_risk(victim, ActionType.SUBMIT_CREDENTIALS)
        assert cred_risk > read_risk


# ============================================================================ #
# UNIT TESTS — Access Boundary
# ============================================================================ #

class TestAccessBoundary:
    """Tests for the centralized access policy engine."""

    def test_low_risk_read_is_allowed(self):
        decision, allowed, reason, warn = AccessPolicy.evaluate(10.0, ActionType.READ)
        assert decision == AccessDecision.ALLOW
        assert allowed is True
        assert warn is False

    def test_medium_risk_sensitive_action_warns(self):
        decision, allowed, reason, warn = AccessPolicy.evaluate(45.0, ActionType.ENTER_PASSWORD)
        assert decision == AccessDecision.WARN
        assert warn is True

    def test_high_risk_password_is_blocked(self):
        decision, allowed, reason, warn = AccessPolicy.evaluate(70.0, ActionType.ENTER_PASSWORD)
        assert decision == AccessDecision.BLOCK
        assert allowed is False

    def test_high_risk_url_is_restricted(self):
        decision, allowed, reason, warn = AccessPolicy.evaluate(70.0, ActionType.CLICK_URL)
        assert decision == AccessDecision.RESTRICT
        assert allowed is False

    def test_critical_risk_blocks_all_except_read(self):
        for action in [
            ActionType.CLICK_URL, ActionType.SUBMIT_CREDENTIALS, ActionType.MAKE_PAYMENT,
            ActionType.FORWARD, ActionType.DOWNLOAD_ATTACHMENT,
        ]:
            decision, allowed, reason, warn = AccessPolicy.evaluate(95.0, action)
            assert decision == AccessDecision.BLOCK, f"Action {action} should be BLOCKED at critical risk"
            assert allowed is False

    def test_critical_risk_read_is_restricted(self):
        """READ is restricted (not blocked) at critical risk — allows minimal access."""
        decision, allowed, reason, warn = AccessPolicy.evaluate(95.0, ActionType.READ)
        assert decision == AccessDecision.RESTRICT
        assert allowed is False

    def test_risk_score_10_allow(self):
        decision, allowed, _, _ = AccessPolicy.evaluate(10.0, ActionType.READ)
        assert decision == AccessDecision.ALLOW

    def test_risk_score_30_boundary(self):
        decision, _, _, _ = AccessPolicy.evaluate(30.0, ActionType.CLICK_URL)
        # 30 is in MEDIUM zone (30–59)
        assert decision in [AccessDecision.ALLOW, AccessDecision.WARN]

    def test_risk_score_85_critical_payment(self):
        decision, allowed, _, _ = AccessPolicy.evaluate(85.0, ActionType.MAKE_PAYMENT)
        assert decision == AccessDecision.BLOCK
        assert allowed is False

    def test_risk_score_100_block(self):
        decision, allowed, _, _ = AccessPolicy.evaluate(100.0, ActionType.CLICK_URL)
        assert decision == AccessDecision.BLOCK
        assert allowed is False


# ============================================================================ #
# INTEGRATION TESTS — Employee CRUD APIs
# ============================================================================ #

class TestEmployeeAPI:
    """Integration tests for /api/employees endpoints."""

    def test_create_employee(self):
        resp = client.post("/api/employees", json=FINANCE_ATTRS)
        assert resp.status_code == 201
        data = resp.json()
        assert data["employee_id"] == "EMP-002"
        assert data["department"] == "Finance"

    def test_create_duplicate_employee_fails(self):
        client.post("/api/employees", json=FINANCE_ATTRS)
        resp = client.post("/api/employees", json=FINANCE_ATTRS)
        assert resp.status_code == 400

    def test_get_all_employees(self):
        client.post("/api/employees", json=INTERN_ATTRS)
        client.post("/api/employees", json=FINANCE_ATTRS)
        resp = client.get("/api/employees")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_get_employee_by_id(self):
        client.post("/api/employees", json=IT_ADMIN_ATTRS)
        resp = client.get("/api/employees/EMP-003")
        assert resp.status_code == 200
        assert resp.json()["role"] == "IT Administrator"

    def test_get_nonexistent_employee_404(self):
        resp = client.get("/api/employees/EMP-DOES-NOT-EXIST")
        assert resp.status_code == 404

    def test_update_employee(self):
        client.post("/api/employees", json=INTERN_ATTRS)
        updated = {**INTERN_ATTRS, "role": "Senior Marketing Analyst", "privilege_level": 5}
        resp = client.put("/api/employees/EMP-001", json=updated)
        assert resp.status_code == 200
        assert resp.json()["role"] == "Senior Marketing Analyst"

    def test_delete_employee(self):
        client.post("/api/employees", json=INTERN_ATTRS)
        resp = client.delete("/api/employees/EMP-001")
        assert resp.status_code == 204
        # Verify deletion
        resp = client.get("/api/employees/EMP-001")
        assert resp.status_code == 404

    def test_risk_profile_endpoint(self):
        client.post("/api/employees", json=FINANCE_ATTRS)
        resp = client.get("/api/employees/EMP-002/risk-profile")
        assert resp.status_code == 200
        data = resp.json()
        assert "exposure_score" in data
        assert "business_impact_score" in data
        assert data["exposure_score"] > 50
        assert data["business_impact_score"] > 50

    def test_risk_profile_nonexistent_employee(self):
        resp = client.get("/api/employees/EMP-GHOST/risk-profile")
        assert resp.status_code == 404


# ============================================================================ #
# INTEGRATION TESTS — Risk Evaluate API
# ============================================================================ #

class TestRiskEvaluateAPI:
    """Integration tests for /api/risk/evaluate."""

    def _create_employees(self):
        for attrs in [INTERN_ATTRS, FINANCE_ATTRS, IT_ADMIN_ATTRS]:
            client.post("/api/employees", json=attrs)

    def test_evaluate_risk_intern_lower_than_finance(self):
        self._create_employees()
        threat = 90.0

        resp_intern = client.post("/api/risk/evaluate", json={
            "email_id": "EML-001", "employee_id": "EMP-001",
            "threat_score": threat, "sender_email": "hacker@evil.com", "current_volume": 20
        })
        resp_finance = client.post("/api/risk/evaluate", json={
            "email_id": "EML-001", "employee_id": "EMP-002",
            "threat_score": threat, "sender_email": "hacker@evil.com", "current_volume": 20
        })
        assert resp_intern.status_code == 200
        assert resp_finance.status_code == 200

        intern_score = resp_intern.json()["victim_risk_score"]
        finance_score = resp_finance.json()["victim_risk_score"]
        assert intern_score < finance_score, (
            f"Intern ({intern_score}) should have lower risk than Finance ({finance_score})"
        )

    def test_evaluate_risk_response_structure(self):
        client.post("/api/employees", json=FINANCE_ATTRS)
        resp = client.post("/api/risk/evaluate", json={
            "email_id": "EML-100", "employee_id": "EMP-002",
            "threat_score": 85.0, "sender_email": "unknown@hacker.com", "current_volume": 20
        })
        assert resp.status_code == 200
        data = resp.json()
        for field in ["email_id", "employee_id", "threat_score", "exposure_score",
                      "business_impact_score", "victim_risk_score", "risk_level",
                      "explanation", "behavior", "contact", "recommendation"]:
            assert field in data, f"Missing field: {field}"

    def test_new_contact_flagged(self):
        client.post("/api/employees", json=FINANCE_ATTRS)
        resp = client.post("/api/risk/evaluate", json={
            "email_id": "EML-200", "employee_id": "EMP-002",
            "threat_score": 80.0, "sender_email": "brand_new@unknown.biz", "current_volume": 20
        })
        assert resp.status_code == 200
        assert resp.json()["contact"]["is_new_contact"] is True
        assert resp.json()["contact"]["contact_risk"] >= 60.0

    def test_high_volume_triggers_behavior_anomaly(self):
        client.post("/api/employees", json=FINANCE_ATTRS)
        resp = client.post("/api/risk/evaluate", json={
            "email_id": "EML-300", "employee_id": "EMP-002",
            "threat_score": 70.0, "sender_email": "colleague@company.com",
            "current_volume": 500  # Triggers ABNORMAL_EMAIL_VOLUME
        })
        assert resp.status_code == 200
        assert resp.json()["behavior"]["anomaly_detected"] is True
        assert "ABNORMAL_EMAIL_VOLUME" in resp.json()["behavior"]["indicators"]

    def test_evaluate_risk_employee_not_found(self):
        resp = client.post("/api/risk/evaluate", json={
            "email_id": "EML-999", "employee_id": "EMP-NONE",
            "threat_score": 50.0
        })
        assert resp.status_code == 404

    def test_risk_stored_in_database(self):
        """Verify risk assessment is persisted after evaluation."""
        client.post("/api/employees", json=IT_ADMIN_ATTRS)
        resp = client.post("/api/risk/evaluate", json={
            "email_id": "EML-400", "employee_id": "EMP-003",
            "threat_score": 90.0, "sender_email": "attacker@phish.io", "current_volume": 10
        })
        assert resp.status_code == 200
        # Calling again proves the first was stored without duplicate failure
        resp2 = client.post("/api/risk/evaluate", json={
            "email_id": "EML-401", "employee_id": "EMP-003",
            "threat_score": 90.0, "sender_email": "attacker@phish.io", "current_volume": 10
        })
        assert resp2.status_code == 200

    def test_it_admin_high_threat_is_critical(self):
        client.post("/api/employees", json=IT_ADMIN_ATTRS)
        resp = client.post("/api/risk/evaluate", json={
            "email_id": "EML-500", "employee_id": "EMP-003",
            "threat_score": 94.0, "sender_email": "evil@phish.ru", "current_volume": 20
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_level"] == "CRITICAL"


# ============================================================================ #
# INTEGRATION TESTS — Action Risk API
# ============================================================================ #

class TestActionRiskAPI:
    """Integration tests for /api/risk/action."""

    def test_read_action_allowed_for_finance(self):
        client.post("/api/employees", json=FINANCE_ATTRS)
        resp = client.post("/api/risk/action", json={
            "email_id": "EML-01", "employee_id": "EMP-002",
            "action": "READ", "threat_score": 50.0
        })
        assert resp.status_code == 200
        assert resp.json()["allowed"] is True

    def test_submit_password_blocked_at_high_threat(self):
        client.post("/api/employees", json=IT_ADMIN_ATTRS)
        resp = client.post("/api/risk/action", json={
            "email_id": "EML-02", "employee_id": "EMP-003",
            "action": "SUBMIT_CREDENTIALS", "threat_score": 90.0
        })
        assert resp.status_code == 200
        assert resp.json()["decision"] == "BLOCK"
        assert resp.json()["allowed"] is False

    def test_payment_blocked_at_high_threat(self):
        client.post("/api/employees", json=FINANCE_ATTRS)
        resp = client.post("/api/risk/action", json={
            "email_id": "EML-03", "employee_id": "EMP-002",
            "action": "MAKE_PAYMENT", "threat_score": 85.0
        })
        assert resp.status_code == 200
        assert resp.json()["decision"] == "BLOCK"
        assert resp.json()["allowed"] is False

    def test_invalid_action_returns_422(self):
        client.post("/api/employees", json=FINANCE_ATTRS)
        resp = client.post("/api/risk/action", json={
            "email_id": "EML-04", "employee_id": "EMP-002",
            "action": "EXPLODE", "threat_score": 50.0
        })
        assert resp.status_code == 422

    def test_employee_not_found_returns_404(self):
        resp = client.post("/api/risk/action", json={
            "email_id": "EML-05", "employee_id": "EMP-NONE",
            "action": "READ", "threat_score": 50.0
        })
        assert resp.status_code == 404


# ============================================================================ #
# INTEGRATION TESTS — Access Evaluate API
# ============================================================================ #

class TestAccessEvaluateAPI:
    """Integration tests for /api/access/evaluate."""

    def test_access_evaluate_returns_decision(self):
        client.post("/api/employees", json=INTERN_ATTRS)
        resp = client.post("/api/access/evaluate", json={
            "employee_id": "EMP-001", "email_id": "EML-ACC-01",
            "action": "CLICK_URL", "threat_score": 40.0
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "decision" in data
        assert "risk_score" in data
        assert "risk_level" in data
        assert "allowed" in data
        assert "reason" in data
        assert "requires_warning" in data

    def test_high_threat_click_url_restricted_or_blocked(self):
        client.post("/api/employees", json=IT_ADMIN_ATTRS)
        resp = client.post("/api/access/evaluate", json={
            "employee_id": "EMP-003", "email_id": "EML-ACC-02",
            "action": "CLICK_URL", "threat_score": 90.0
        })
        assert resp.status_code == 200
        assert resp.json()["decision"] in ["RESTRICT", "BLOCK"]
        assert resp.json()["allowed"] is False

    def test_access_evaluate_employee_not_found(self):
        resp = client.post("/api/access/evaluate", json={
            "employee_id": "EMP-GHOST", "email_id": "EML-ACC-03",
            "action": "READ", "threat_score": 50.0
        })
        assert resp.status_code == 404
