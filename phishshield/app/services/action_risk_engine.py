from app.schemas.member5_schemas import ActionType

def get_action_sensitivity(action: ActionType) -> float:
    mapping = {
        ActionType.READ: 10.0,
        ActionType.REPLY: 30.0,
        ActionType.FORWARD: 40.0,
        ActionType.CLICK_URL: 70.0,
        ActionType.DOWNLOAD_ATTACHMENT: 75.0,
        ActionType.ENTER_PASSWORD: 95.0,
        ActionType.ENTER_OTP: 95.0,
        ActionType.SUBMIT_CREDENTIALS: 95.0,
        ActionType.MAKE_PAYMENT: 100.0,
    }
    return mapping.get(action, 50.0)

def calculate_action_risk(victim_risk: float, action: ActionType) -> float:
    """
    Calculates the risk of a specific action based on the underlying victim risk score.
    """
    sensitivity = get_action_sensitivity(action)
    
    # Weight the action sensitivity higher than the base victim risk
    risk = (victim_risk * 0.4) + (sensitivity * 0.6)
    
    # Non-linear scaling if both are high
    if victim_risk >= 60 and sensitivity >= 70:
        risk += 15
        
    return min(round(risk, 2), 100.0)
