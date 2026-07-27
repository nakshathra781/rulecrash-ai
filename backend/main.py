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
        "https://rulecrash-ai.vercel.app"

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


def normalize_rules(rules: dict) -> dict:
    """Convert Gemini rules into the format used by the simulator."""

    manager_threshold = rules.get("manager_threshold", 0)

    return {
        "refund_days": rules.get("refund_days", 30),
        "invoice_required": rules.get("invoice_required", False),
        "photo_required": rules.get("photo_required", False),
        "manager_threshold": (
            manager_threshold
            if manager_threshold > 0
            else None
        ),
        "single_refund_rule": rules.get(
            "single_refund_rule",
            False,
        ),
        "alternative_proof_allowed": rules.get(
            "alternative_proof_allowed",
            False,
        ),
        "cross_channel_protection": rules.get(
            "cross_channel_protection",
            False,
        ),
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

        current_policy_settings = normalize_rules(
            ai_analysis
        )

        improved_policy_settings = normalize_rules(
            ai_analysis["improved_rules"]
        )

    except Exception as error:
        print(f"Gemini analysis failed: {error}")

        analysis_source = "keyword_fallback"

        current_policy_settings = read_policy(
            request.policy
        )

        # Safe local improvements when Gemini is unavailable.
        improved_policy_settings = {
            **current_policy_settings,
            "refund_days": max(
                current_policy_settings["refund_days"],
                14,
            ),
            "single_refund_rule": True,
            "alternative_proof_allowed": True,
            "cross_channel_protection": True,
        }

        ai_analysis = {
            "risk_summary": (
                "Gemini was temporarily unavailable, so RuleCrash "
                "used its local policy parser."
            ),
            "recommended_changes": [
                "Accept verified alternative proof of purchase.",
                (
                    "Block duplicate refund requests across "
                    "all channels."
                ),
                (
                    "Use a fairer refund period of at least "
                    "14 days."
                ),
            ],
        }

    # Test the original policy.
    before_results = run_simulation(
        policy=request.policy,
        personas=request.personas,
        simulation_count=request.simulation_count,
        seed=42,
        policy_settings=current_policy_settings,
    )

    # Test the improved policy using the same customers.
    after_results = run_simulation(
        policy=request.policy,
        personas=request.personas,
        simulation_count=request.simulation_count,
        seed=42,
        policy_settings=improved_policy_settings,
    )

    before_results["analysisSource"] = analysis_source

    before_results["policyAnalysis"] = {
        "rules": current_policy_settings,
        "riskSummary": ai_analysis["risk_summary"],
        "recommendedChanges": ai_analysis[
            "recommended_changes"
        ],
    }

    before_results["comparison"] = {
        "before": {
            "loopholesFound": before_results[
                "loopholesFound"
            ],
            "genuineUsersRejected": before_results[
                "genuineUsersRejected"
            ],
            "fraudSuccessRate": before_results[
                "fraudSuccessRate"
            ],
            "bottlenecksFound": before_results[
                "bottlenecksFound"
            ],
        },
        "after": {
            "loopholesFound": after_results[
                "loopholesFound"
            ],
            "genuineUsersRejected": after_results[
                "genuineUsersRejected"
            ],
            "fraudSuccessRate": after_results[
                "fraudSuccessRate"
            ],
            "bottlenecksFound": after_results[
                "bottlenecksFound"
            ],
        },
        "improvements": {
            "loopholesReducedBy": max(
                0,
                before_results["loopholesFound"]
                - after_results["loopholesFound"],
            ),
            "genuineRejectionsReducedBy": max(
                0,
                before_results["genuineUsersRejected"]
                - after_results["genuineUsersRejected"],
            ),
            "fraudRateReducedBy": round(
                max(
                    0,
                    before_results["fraudSuccessRate"]
                    - after_results["fraudSuccessRate"],
                ),
                1,
            ),
            "bottlenecksReducedBy": max(
                0,
                before_results["bottlenecksFound"]
                - after_results["bottlenecksFound"],
            ),
        },
        "improvedRules": improved_policy_settings,
        "afterFindings": after_results["findings"],
    }

    return before_results