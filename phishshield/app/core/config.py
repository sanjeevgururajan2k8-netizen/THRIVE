from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./phishshield.db"
    THREAT_INTEL_API_KEY: str = "mock_key"
    STORE_RAW_EMAIL: bool = False
    RETENTION_DAYS: int = 90
    CAMPAIGN_THRESHOLD: int = 70
    CAMPAIGN_DNA_THRESHOLD: int = 80
    MIN_CAMPAIGN_SIZE: int = 3

    class Config:
        env_file = ".env"

settings = Settings()
