import random
import re


def read_policy(policy: str) -> dict:
    """Convert important policy sentences into settings."""

    policy_text = policy.lower()

    days_match = re.search(
        r"within\s+(\d+)\s+days",
        policy_text,
    )

    amount_match = re.search(
        r"(?:above|over)\s*[₹rs.\s]*([\d,]+)",
        policy_text,
    )

    refund_days = (
        int(days_match.group(1))
        if days_match
        else 30
    )

    manager_threshold = (
        int(amount_match.group(1).replace(",", ""))
        if amount_match
        else None
    )

    return {
        "refund_days": refund_days,
        "invoice_required": "invoice" in policy_text,
        "photo_required": (
            "photographic proof" in policy_text
            or "photo proof" in policy_text
        ),
        "manager_threshold": manager_threshold,
        "single_refund_rule": (
            "one refund request" in policy_text
            or "only one refund" in policy_text
        ),
        "alternative_proof_allowed": (
            "alternative proof" in policy_text
            or "payment proof" in policy_text
        ),
        "cross_channel_protection": (
            "across all channels" in policy_text
            or "central refund status" in policy_text
            or "idempotency" in policy_text
        ),
    }


def create_customer(
    persona: str,
    case_number: int,
    random_generator: random.Random,
) -> dict:
    """Create one virtual customer journey."""

    if persona == "genuine":
        customer = {
            "days_since_delivery": random_generator.randint(0, 8),
            "has_invoice": random_generator.random() < 0.90,
            "has_alternative_proof": True,
            "damaged_product": random_generator.random() < 0.25,
            "has_photo": random_generator.random() < 0.90,
            "refund_amount": random_generator.randint(500, 9000),
            "previous_refund": False,
            "second_channel": False,
        }

    elif persona == "confused":
        customer = {
            "days_since_delivery": random_generator.randint(0, 12),
            "has_invoice": random_generator.random() < 0.60,
            "has_alternative_proof": random_generator.random() < 0.70,
            "damaged_product": random_generator.random() < 0.30,
            "has_photo": random_generator.random() < 0.50,
            "refund_amount": random_generator.randint(500, 9000),
            "previous_refund": random_generator.random() < 0.15,
            "second_channel": random_generator.random() < 0.25,
        }

    elif persona == "vulnerable":
        customer = {
            "days_since_delivery": random_generator.randint(0, 10),
            "has_invoice": random_generator.random() < 0.50,
            "has_alternative_proof": random_generator.random() < 0.90,
            "damaged_product": random_generator.random() < 0.35,
            "has_photo": random_generator.random() < 0.45,
            "refund_amount": random_generator.randint(500, 9000),
            "previous_refund": False,
            "second_channel": False,
        }

    else:
        customer = {
            "days_since_delivery": random_generator.randint(0, 14),
            "has_invoice": random_generator.random() < 0.65,
            "has_alternative_proof": random_generator.random() < 0.60,
            "damaged_product": random_generator.random() < 0.35,
            "has_photo": random_generator.random() < 0.60,
            "refund_amount": random_generator.randint(500, 12000),
            "previous_refund": random_generator.random() < 0.75,
            "second_channel": random_generator.random() < 0.80,
        }

    customer["id"] = f"CASE-{case_number:04d}"
    customer["persona"] = persona

    return customer


def run_simulation(
    policy: str,
    personas: list[str],
    simulation_count: int,
    seed: int = 42,
) -> dict:
    """Run multiple customer journeys through the policy."""

    settings = read_policy(policy)
    random_generator = random.Random(seed)

    genuine_rejections = 0
    fraud_attempts = 0
    fraud_successes = 0
    confused_failures = 0
    manager_delays = 0

    rejection_samples = []
    fraud_samples = []
    confused_samples = []
    delay_samples = []

    for index in range(simulation_count):
        persona = personas[index % len(personas)]

        customer = create_customer(
            persona,
            index + 1,
            random_generator,
        )

        approved = True
        rejection_reasons = []

        if customer["days_since_delivery"] > settings["refund_days"]:
            approved = False
            rejection_reasons.append("Refund window expired")

        if settings["invoice_required"] and not customer["has_invoice"]:
            alternative_is_valid = (
                settings["alternative_proof_allowed"]
                and customer["has_alternative_proof"]
            )

            if not alternative_is_valid:
                approved = False
                rejection_reasons.append("Invoice missing")

        if (
            settings["photo_required"]
            and customer["damaged_product"]
            and not customer["has_photo"]
        ):
            approved = False
            rejection_reasons.append("Damage photo missing")

        manager_threshold = settings["manager_threshold"]

        if (
            manager_threshold is not None
            and customer["refund_amount"] > manager_threshold
        ):
            if random_generator.random() < 0.35:
                manager_delays += 1

                if len(delay_samples) < 3:
                    delay_samples.append(customer["id"])

        fraud_attempt = (
            persona == "fraudster"
            and customer["previous_refund"]
            and customer["second_channel"]
        )

        if fraud_attempt:
            fraud_attempts += 1

            duplicate_is_blocked = (
                settings["single_refund_rule"]
                and settings["cross_channel_protection"]
            )

            if duplicate_is_blocked:
                approved = False
                rejection_reasons.append("Duplicate refund blocked")
            elif approved:
                fraud_successes += 1

                if len(fraud_samples) < 3:
                    fraud_samples.append(customer["id"])

        if (
            persona in {"genuine", "vulnerable"}
            and not approved
        ):
            genuine_rejections += 1

            if len(rejection_samples) < 3:
                rejection_samples.append(customer["id"])

        if persona == "confused" and not approved:
            confused_failures += 1

            if len(confused_samples) < 3:
                confused_samples.append(customer["id"])

    findings = []

    if fraud_successes > 0:
        findings.append(
            {
                "severity": "Critical",
                "category": "Loophole",
                "title": "Possible duplicate refund path",
                "description": (
                    f"{fraud_successes} fraudulent duplicate requests "
                    "passed through different refund channels."
                ),
                "evidence": fraud_samples,
            }
        )

    if genuine_rejections > 0:
        findings.append(
            {
                "severity": "High",
                "category": "Unfair rejection",
                "title": "Genuine customers can be rejected",
                "description": (
                    f"{genuine_rejections} genuine or vulnerable customers "
                    "were rejected by the current rules."
                ),
                "evidence": rejection_samples,
            }
        )

    if confused_failures > 0:
        findings.append(
            {
                "severity": "Medium",
                "category": "Usability failure",
                "title": "Confused users may abandon the workflow",
                "description": (
                    f"{confused_failures} confused users failed because "
                    "the workflow did not help them recover from mistakes."
                ),
                "evidence": confused_samples,
            }
        )

    if manager_delays > 0:
        findings.append(
            {
                "severity": "Medium",
                "category": "Bottleneck",
                "title": "Manager approval may create delays",
                "description": (
                    f"{manager_delays} high-value refund journeys were "
                    "delayed while waiting for manager approval."
                ),
                "evidence": delay_samples,
            }
        )

    fraud_success_rate = (
        round((fraud_successes / fraud_attempts) * 100, 1)
        if fraud_attempts > 0
        else 0
    )

    return {
        "totalSimulations": simulation_count,
        "loopholesFound": 1 if fraud_successes > 0 else 0,
        "genuineUsersRejected": genuine_rejections,
        "fraudSuccessRate": fraud_success_rate,
        "bottlenecksFound": 1 if manager_delays > 0 else 0,
        "findings": findings,
    }