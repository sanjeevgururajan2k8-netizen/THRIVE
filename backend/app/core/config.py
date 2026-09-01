from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PhishShield API"
    API_V1_STR: str = "/api"

settings = Settings()
