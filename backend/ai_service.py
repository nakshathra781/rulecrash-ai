import os
import json

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY was not found in backend/.env"
    )

client = genai.Client(api_key=api_key)


class PolicyAnalysis(BaseModel):
    refund_days: int = Field(
        description=(
            "Maximum number of days allowed for a refund. "
            "Use 30 when the policy does not specify it."
        )
    )

    invoice_required: bool = Field(
        description="Whether the policy requires an invoice."
    )

    photo_required: bool = Field(
        description=(
            "Whether damaged products require photographic proof."
        )
    )

    manager_threshold: int = Field(
        description=(
            "Refund amount above which manager approval is required. "
            "Use 0 when no threshold is specified."
        )
    )

    single_refund_rule: bool = Field(
        description=(
            "Whether only one refund request is allowed per order."
        )
    )

    alternative_proof_allowed: bool = Field(
        description=(
            "Whether payment proof or alternative purchase proof "
            "is accepted when an invoice is unavailable."
        )
    )

    cross_channel_protection: bool = Field(
        description=(
            "Whether duplicate refund requests are centrally blocked "
            "across the app, website, store and customer support."
        )
    )

    risk_summary: str = Field(
        description="A short summary of the policy's main weakness."
    )

    recommended_changes: list[str] = Field(
        description=(
            "Three practical changes that would make the policy "
            "safer and fairer."
        )
    )


def analyze_policy(policy: str) -> dict:
    prompt = f"""
You are the policy-analysis component of RuleCrash AI.

Read the refund policy and convert it into structured business rules.

Important instructions:
1. Do not invent rules that are not present.
2. Use 30 refund days when no refund period is specified.
3. Use manager threshold 0 when manager approval is not mentioned.
4. Cross-channel protection is true only when the policy clearly
   says duplicate requests are blocked centrally across all channels.
5. Give exactly three practical recommended changes.

REFUND POLICY:
{policy}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config={
    "response_mime_type": "application/json",
    "response_schema": PolicyAnalysis,
},
    )

    analysis = PolicyAnalysis.model_validate_json(response.text)

    return analysis.model_dump()


if __name__ == "__main__":
    sample_policy = """
    Refund requests are accepted within 7 days of delivery.
    The customer must provide a valid invoice.
    Damaged products require photographic proof.
    Refunds above ₹5,000 require manager approval.
    Only one refund request is allowed per order.
    Approved refunds are processed within 5 working days.
    """

    result = analyze_policy(sample_policy)

    print(json.dumps(result, indent=2))