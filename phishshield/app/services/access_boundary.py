from app.schemas.member5_schemas import AccessDecision, ActionType

class AccessPolicy:
    LOW_THRESHOLD = 30
    WARN_THRESHOLD = 60
    RESTRICT_THRESHOLD = 85
    
    @classmethod
    def evaluate(cls, action_risk: float, action: ActionType) -> tuple[AccessDecision, bool, str, bool]:
        """
        Evaluate an action against the access policy.
        Returns:
            decision (AccessDecision)
            allowed (bool)
            reason (str)
            requires_warning (bool)
        """
        if action_risk < cls.LOW_THRESHOLD:
            return AccessDecision.ALLOW, True, "Action risk is low. Permitted.", False
            
        elif action_risk < cls.WARN_THRESHOLD:
            if action in [ActionType.ENTER_PASSWORD, ActionType.ENTER_OTP, ActionType.SUBMIT_CREDENTIALS, ActionType.MAKE_PAYMENT]:
                return AccessDecision.WARN, True, "Sensitive action. User warning required.", True
            return AccessDecision.ALLOW, True, "Action permitted but flagged for review.", False
            
        elif action_risk < cls.RESTRICT_THRESHOLD:
            if action in [ActionType.ENTER_PASSWORD, ActionType.ENTER_OTP, ActionType.SUBMIT_CREDENTIALS, ActionType.MAKE_PAYMENT]:
                return AccessDecision.BLOCK, False, "Sensitive actions are blocked at this risk level.", False
            if action in [ActionType.CLICK_URL, ActionType.DOWNLOAD_ATTACHMENT]:
                return AccessDecision.RESTRICT, False, "Action restricted due to high risk.", False
            return AccessDecision.WARN, True, "Action risk is high. Proceed with caution.", True
            
        else:
            if action == ActionType.READ:
                return AccessDecision.RESTRICT, False, "Email viewing restricted.", False
            return AccessDecision.BLOCK, False, "Action blocked due to critical risk.", False
