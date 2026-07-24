from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ai_service import analyze_policy
from simulation_engine import read_policy, run_simulation


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

    analysis_source = "gemini"

    try:
        ai_analysis = analyze_policy(request.policy)

        policy_settings = {
            "refund_days": ai_analysis["refund_days"],
            "invoice_required": ai_analysis["invoice_required"],
            "photo_required": ai_analysis["photo_required"],

            # Gemini returns 0 when there is no manager threshold.
            # The simulation engine expects None in that situation.
            "manager_threshold": (
                ai_analysis["manager_threshold"]
                if ai_analysis["manager_threshold"] > 0
                else None
            ),

            "single_refund_rule": ai_analysis[
                "single_refund_rule"
            ],
            "alternative_proof_allowed": ai_analysis[
                "alternative_proof_allowed"
            ],
            "cross_channel_protection": ai_analysis[
                "cross_channel_protection"
            ],
        }

    except Exception as error:
        print(f"Gemini analysis failed: {error}")

        analysis_source = "keyword_fallback"
        policy_settings = read_policy(request.policy)

        ai_analysis = {
            "risk_summary": (
                "Gemini was temporarily unavailable, so RuleCrash "
                "used its local policy parser."
            ),
            "recommended_changes": [],
        }

    results = run_simulation(
        policy=request.policy,
        personas=request.personas,
        simulation_count=request.simulation_count,
        policy_settings=policy_settings,
    )

    results["analysisSource"] = analysis_source

    results["policyAnalysis"] = {
        "rules": policy_settings,
        "riskSummary": ai_analysis["risk_summary"],
        "recommendedChanges": ai_analysis["recommended_changes"],
    }

    return results