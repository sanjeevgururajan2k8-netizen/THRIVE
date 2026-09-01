from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import Member 5 Routers
from .api import employees, risk, access
# Import Member 5 Models so they are created
from .models import member5

from .core.database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup on shutdown if needed

app = FastAPI(
    title="PhishShield - Member 5 Module",
    description="Victim-Aware Risk Scoring, Employee Risk Profiles, Behavioral Analysis, and Adaptive Email Access Boundary",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Member 5 Routers
app.include_router(employees.router)
app.include_router(risk.router)
app.include_router(access.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "PhishShield API (Member 5) is running."}
