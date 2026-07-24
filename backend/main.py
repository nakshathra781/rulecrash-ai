from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from simulation_engine import run_simulation


app = FastAPI(
    title="RuleCrash AI API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationRequest(BaseModel):
    policy: str = Field(min_length=20)
    personas: list[str] = Field(min_length=1)
    simulation_count: int = Field(default=100, ge=10, le=1000)


@app.get("/")
def home():
    return {
        "message": "RuleCrash AI backend is running",
        "status": "success",
    }


@app.post("/simulate")
def simulate_workflow(request: SimulationRequest):
    valid_personas = {
        "genuine",
        "confused",
        "vulnerable",
        "fraudster",
    }

    invalid_personas = [
        persona
        for persona in request.personas
        if persona not in valid_personas
    ]

    if invalid_personas:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid personas: {invalid_personas}",
        )

    return run_simulation(
        policy=request.policy,
        personas=request.personas,
        simulation_count=request.simulation_count,
    )