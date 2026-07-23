from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(
    title="RuleCrash AI API",
    version="1.0.0",
)


# Allow the React frontend to communicate with this backend.
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

    selected_personas = [
        persona
        for persona in request.personas
        if persona in valid_personas
    ]

    if not selected_personas:
        raise HTTPException(
            status_code=400,
            detail="Select at least one valid persona.",
        )

    policy_text = request.policy.lower()

    simulations_per_persona = max(
        1,
        request.simulation_count // len(selected_personas),
    )

    genuine_users_rejected = 0
    fraud_attempts_succeeded = 0
    bottlenecks_found = 0
    findings = []

    # Test confused customers.
    if "confused" in selected_personas:
        genuine_users_rejected += round(
            simulations_per_persona * 0.10
        )

        findings.append(
            {
                "severity": "Medium",
                "category": "Usability failure",
                "title": "Confused users may abandon the workflow",
                "description": (
                    "Users who upload the wrong document receive no "
                    "clear recovery instructions."
                ),
            }
        )

    # Test vulnerable customers.
    if "vulnerable" in selected_personas:
        invoice_is_required = "invoice" in policy_text
        alternative_proof_exists = (
            "alternative proof" in policy_text
            or "payment proof" in policy_text
        )

        if invoice_is_required and not alternative_proof_exists:
            genuine_users_rejected += round(
                simulations_per_persona * 0.25
            )

            findings.append(
                {
                    "severity": "High",
                    "category": "Unfair rejection",
                    "title": "Genuine customers can be rejected",
                    "description": (
                        "The policy requires an invoice but does not "
                        "accept alternative proof of purchase."
                    ),
                }
            )

    # Test fraudulent customers.
    if "fraudster" in selected_personas:
        has_cross_channel_protection = (
            "across all channels" in policy_text
            or "central refund status" in policy_text
        )

        if not has_cross_channel_protection:
            fraud_attempts_succeeded = round(
                simulations_per_persona * 0.12
            )

            findings.append(
                {
                    "severity": "Critical",
                    "category": "Loophole",
                    "title": "Possible duplicate refund path",
                    "description": (
                        "A customer may request refunds through the app "
                        "and customer-support channel before either "
                        "request is completed."
                    ),
                }
            )

    # Check for approval bottlenecks.
    if "manager approval" in policy_text:
        bottlenecks_found += 1

        findings.append(
            {
                "severity": "Medium",
                "category": "Bottleneck",
                "title": "Manager approval may create delays",
                "description": (
                    "Every high-value refund depends on manager "
                    "availability, creating a single approval bottleneck."
                ),
            }
        )

    loopholes_found = sum(
        1
        for finding in findings
        if finding["category"] == "Loophole"
    )

    fraud_success_rate = round(
        (
            fraud_attempts_succeeded
            / request.simulation_count
        )
        * 100,
        1,
    )

    return {
        "totalSimulations": request.simulation_count,
        "loopholesFound": loopholes_found,
        "genuineUsersRejected": genuine_users_rejected,
        "fraudSuccessRate": fraud_success_rate,
        "bottlenecksFound": bottlenecks_found,
        "findings": findings,
    }