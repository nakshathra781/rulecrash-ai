# RuleCrash AI

RuleCrash AI is an AI-powered business-rule stress-testing platform.

It creates virtual customers and sends them through a business workflow to identify loopholes, unfair customer rejections, fraud paths, and operational bottlenecks before real users are affected.

The current MVP tests an e-commerce refund policy.

---

## Problem

Business policies may appear correct on paper but can still contain hidden problems.

Examples:

- Genuine customers may be rejected because they lost an invoice.
- Fraudsters may request duplicate refunds through different support channels.
- High-value refunds may be delayed because every request needs manager approval.
- Confused customers may abandon the process after uploading an incorrect document.

Companies usually discover these problems only after customers complain or fraud occurs.

---

## Solution

RuleCrash AI acts like a crash-test laboratory for business rules.

The user:

1. Pastes a refund policy.
2. Selects virtual customer personas.
3. Chooses the number of simulations.
4. Runs the workflow test.
5. Reviews risks, evidence, and AI recommendations.
6. Compares the original policy with an improved policy.

---

## Virtual Customer Personas

RuleCrash currently supports four personas:

- **Genuine Customer** — follows the policy correctly.
- **Confused Customer** — uploads incorrect documents or misunderstands instructions.
- **Vulnerable Customer** — has a genuine complaint but faces accessibility or documentation problems.
- **Fraudulent Customer** — attempts duplicate refunds and cross-channel rule bypasses.

---

## How It Works

```text
Refund policy
      ↓
Gemini converts the policy into structured rules
      ↓
Python generates virtual customer journeys
      ↓
Deterministic simulation engine tests every journey
      ↓
RuleCrash detects risks and records evidence
      ↓
Gemini recommends improved policy rules
      ↓
The same virtual customers test the improved policy
      ↓
Before-versus-after results are displayed
```

Gemini is used for policy understanding and recommendations.

The deterministic Python engine executes the rules and calculates measurable results. This prevents the AI model from randomly deciding simulation outcomes.

---

## Key Features

- Natural-language refund-policy input
- Gemini-powered structured policy analysis
- 100, 250, or 500 virtual customer simulations
- Four customer personas
- Fraud-path detection
- Genuine-customer rejection detection
- Confused-user failure detection
- Manager-approval bottleneck detection
- Evidence IDs for failed cases
- AI-generated risk summary
- AI-generated policy recommendations
- Before-versus-after simulation comparison
- Local policy-parser fallback when Gemini is unavailable

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- Pydantic

### AI

- Gemini API
- Google Gen AI Python SDK

### Version Control

- Git
- GitHub

---

## Project Structure

```text
rulecrash-ai/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── ai_service.py
│   ├── simulation_engine.py
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/nakshathra781/rulecrash-ai.git
cd rulecrash-ai
```

### 2. Backend setup

Move into the backend folder:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```bash
python -m pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder:

```env
GEMINI_API_KEY=your_real_gemini_api_key
```

Start the FastAPI backend:

```bash
python -m fastapi dev main.py
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend setup

Open another terminal and move into the frontend folder:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## API Endpoint

### POST `/simulate`

Example request:

```json
{
  "policy": "Refund requests are accepted within 7 days. A valid invoice is required.",
  "personas": [
    "genuine",
    "confused",
    "vulnerable",
    "fraudster"
  ],
  "simulation_count": 100
}
```

The response includes:

- Original-policy simulation results
- Risk findings
- Evidence case IDs
- Gemini policy analysis
- Recommended policy changes
- Improved-policy simulation results
- Before-versus-after comparison

---

## Example Risks Detected

RuleCrash can detect risks such as:

- Duplicate refunds requested through different channels
- Genuine customers rejected because an invoice is missing
- Confused users failing because recovery instructions are unclear
- High-value refunds delayed by manager approval

Evidence is shown using simulated case IDs such as:

```text
CASE-0016
CASE-0056
CASE-0072
```

---

## Before-versus-After Comparison

RuleCrash tests the original and improved policies using the same virtual customers.

Example:

```text
Metric                     Before       After
Loopholes found               1            0
Genuine users rejected       22           10
Fraud success rate          27.3%          0%
Bottlenecks found             1            1
```

Using the same customers makes the comparison fair and repeatable.

---

## Reliability

RuleCrash includes a local keyword-based policy parser.

If Gemini is temporarily unavailable because of quota, network, or API problems, the application continues to run using the local fallback instead of crashing.

---

## Current MVP Scope

The current MVP focuses on e-commerce refund workflows.

The architecture can later be extended to:

- Insurance claims
- Loan-approval workflows
- Employee-leave policies
- Subscription cancellations
- Healthcare administration
- Government-benefit workflows

---

## Security

The real Gemini API key is stored only inside:

```text
backend/.env
```

The `.env` file is ignored by Git and must never be uploaded to GitHub.

The repository contains only this safe example:

```text
backend/.env.example
```

---

## Team

### Code Fellas

- **K. Nakshathra** — Frontend and AI workflow
- **K. Prince Dharmapala** — Backend and simulation logic

---

## Repository

```text
https://github.com/nakshathra781/rulecrash-ai
```