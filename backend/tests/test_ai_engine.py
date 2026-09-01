import pytest
from app.ai.analyzer import EmailThreatAnalyzer
from app.ai.models import AIAnalysisRequest, URLAnalysis, AttachmentAnalysis

@pytest.fixture
def analyzer():
    return EmailThreatAnalyzer()

def test_normal_email(analyzer):
    request = AIAnalysisRequest(
        subject="Meeting Tomorrow",
        body="Hi team, Let's meet at 10 AM tomorrow to discuss the project update. Thanks, HR"
    )
    response = analyzer.analyze(request)
    assert response.classification == "LOW_RISK"
    assert response.intent.label == "UNKNOWN"

def test_urgent_password_request(analyzer):
    request = AIAnalysisRequest(
        subject="URGENT: Verify your account",
        body="Your account will be suspended in 24 hours. Click here to verify your password immediately."
    )
    response = analyzer.analyze(request)
    assert response.classification in ["HIGH_RISK", "CRITICAL_RISK"]
    assert response.intent.label == "CREDENTIAL_THEFT"
    assert response.psychology.urgency > 50

def test_fake_bank_payment_request(analyzer):
    request = AIAnalysisRequest(
        subject="Invoice Overdue",
        body="Please pay this invoice via wire transfer immediately to avoid late fees. Thank you."
    )
    response = analyzer.analyze(request)
    assert response.intent.label == "FINANCIAL_FRAUD"

def test_ceo_urgent_money_transfer(analyzer):
    request = AIAnalysisRequest(
        subject="Urgent Transfer needed",
        body="I need you to process a wire transfer immediately. I'm in a meeting, so act fast.",
        sender="ceo@company.com"
    )
    response = analyzer.analyze(request)
    assert response.intent.label == "BUSINESS_EMAIL_COMPROMISE"

def test_demo_scenario(analyzer):
    request = AIAnalysisRequest(
        subject="URGENT: Your PayPal account will be suspended",
        body="""Dear customer,
Your account has been flagged for suspicious activity.
You must verify your account within 10 minutes or your account will be permanently suspended.
Click the link below and enter your password and OTP to continue."""
    )
    response = analyzer.analyze(request)
    assert response.phishing_probability > 90
    assert response.classification == "CRITICAL_RISK"
    assert response.intent.label == "CREDENTIAL_THEFT"
    assert response.psychology.urgency > 85
    assert response.psychology.fear > 70
