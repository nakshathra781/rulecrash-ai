import { useState } from "react";
import "./App.css";

const samplePolicy = `1. Refund requests are accepted within 7 days of delivery.
2. The customer must provide a valid invoice.
3. Damaged products require photographic proof.
4. Refunds above ₹5,000 require manager approval.
5. Only one refund request is allowed per order.
6. Approved refunds are processed within 5 working days.`;

const STORAGE_KEY = "rulecrash-latest-report";
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

const personas = [
  {
    id: "genuine",
    shortName: "G",
    name: "Genuine Customer",
    description:
      "Has a valid invoice and follows the refund rules correctly.",
  },
  {
    id: "confused",
    shortName: "C",
    name: "Confused Customer",
    description:
      "Uploads the wrong document, retries steps or misunderstands instructions.",
  },
  {
    id: "vulnerable",
    shortName: "V",
    name: "Vulnerable Customer",
    description:
      "Has a genuine complaint but faces accessibility or documentation problems.",
  },
  {
    id: "fraudster",
    shortName: "F",
    name: "Fraudulent Customer",
    description:
      "Attempts duplicate refunds, rule bypasses or multi-channel claims.",
  },
];

const demoResults = {
  totalSimulations: 250,
  loopholesFound: 1,
  genuineUsersRejected: 57,
  fraudSuccessRate: 25.7,
  bottlenecksFound: 1,
  findings: [
    {
      severity: "Critical",
      title: "Possible duplicate refund path",
      description:
        "Fraudulent duplicate requests can pass through different refund channels because the policy does not define cross-channel protection.",
      evidence: ["CASE-0016", "CASE-0056", "CASE-0072"],
    },
    {
      severity: "High",
      title: "Genuine customers can be rejected",
      description:
        "Customers with a valid claim but no original invoice can be rejected even when alternative proof of purchase exists.",
      evidence: ["CASE-0003", "CASE-0037", "CASE-0041"],
    },
    {
      severity: "Medium",
      title: "Confused users may abandon the workflow",
      description:
        "The policy does not explain how customers should recover after uploading an incorrect document.",
      evidence: ["CASE-0002", "CASE-0006", "CASE-0010"],
    },
    {
      severity: "Medium",
      title: "Manager approval may create delays",
      description:
        "High-value refunds can remain blocked while waiting for manual approval.",
      evidence: ["CASE-0004", "CASE-0008", "CASE-0024"],
    },
  ],
  analysisSource: "demo",
  policyAnalysis: {
    riskSummary:
      "The policy uses a strict seven-day window and invoice-only verification while lacking cross-channel duplicate-claim protection.",
    recommendedChanges: [
      "Extend the refund window to at least 14 days for genuine customer difficulties.",
      "Allow verified alternative proof of purchase when the original invoice is unavailable.",
      "Use centralized cross-channel checks to stop duplicate refund claims.",
    ],
  },
  comparison: {
    before: {
      loopholesFound: 1,
      genuineUsersRejected: 57,
      fraudSuccessRate: 25.7,
      bottlenecksFound: 1,
    },
    after: {
      loopholesFound: 0,
      genuineUsersRejected: 10,
      fraudSuccessRate: 0,
      bottlenecksFound: 1,
    },
  },
};

function loadLatestReport() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

function formatReportTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString();
}

function MainNavbar({
  activePage,
  onNavigate,
  onNewWorkflow,
}) {
  return (
    <header className="navbar">
      <button
        type="button"
        className="logo logo-button"
        onClick={() => onNavigate("home")}
      >
        RuleCrash AI
      </button>

      <nav aria-label="Main navigation">
        <button
          type="button"
          className={`nav-link ${
            activePage === "home" ? "active" : ""
          }`}
          onClick={() => onNavigate("home")}
        >
          Overview
        </button>

        <button
          type="button"
          className={`nav-link ${
            activePage === "workflows" ? "active" : ""
          }`}
          onClick={() => onNavigate("workflows")}
        >
          Workflows
        </button>

        <button
          type="button"
          className={`nav-link ${
            activePage === "reports" ? "active" : ""
          }`}
          onClick={() => onNavigate("reports")}
        >
          Reports
        </button>
      </nav>

      <button
        type="button"
        className="new-workflow-button"
        onClick={onNewWorkflow}
      >
        + New Workflow
      </button>
    </header>
  );
}

function App() {
  const [initialReport] = useState(() => loadLatestReport());
  const [currentPage, setCurrentPage] = useState("home");
  const [policy, setPolicy] = useState(samplePolicy);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedPersonas, setSelectedPersonas] = useState([
    "genuine",
    "confused",
    "vulnerable",
    "fraudster",
  ]);
  const [simulationCount, setSimulationCount] = useState(100);
  const [simulationResults, setSimulationResults] = useState(
    initialReport?.results ?? null
  );
  const [reportType, setReportType] = useState(
    initialReport?.reportType ?? "live"
  );
  const [reportSavedAt, setReportSavedAt] = useState(
    initialReport?.savedAt ?? ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [simulationError, setSimulationError] = useState("");

  function saveLatestReport(results, type) {
    const savedAt = new Date().toISOString();

    setSimulationResults(results);
    setReportType(type);
    setReportSavedAt(savedAt);

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          results,
          reportType: type,
          savedAt,
        })
      );
    } catch {
      // The report still works in the current session if storage is blocked.
    }
  }

  function navigateMain(page) {
    if (page === "reports") {
      setCurrentPage(simulationResults ? "results" : "reports");
      return;
    }

    setCurrentPage(page);
  }

  function startNewWorkflow() {
    setSimulationError("");
    setCurrentPage("create");
  }

  function openDemo() {
    setPolicy(samplePolicy);
    setSelectedPersonas([
      "genuine",
      "confused",
      "vulnerable",
      "fraudster",
    ]);
    setSimulationCount(250);
    setIsSaved(true);
    setSimulationError("");
    saveLatestReport(demoResults, "demo");
    setCurrentPage("results");
  }

  function savePolicy() {
    if (!policy.trim()) {
      alert("Please enter a refund policy.");
      return;
    }

    setIsSaved(true);
  }

  function continueToPersonas() {
    if (!policy.trim()) {
      alert("Please enter a refund policy.");
      return;
    }

    setIsSaved(true);
    setCurrentPage("personas");
  }

  function togglePersona(personaId) {
    setSelectedPersonas((currentPersonas) => {
      if (currentPersonas.includes(personaId)) {
        return currentPersonas.filter((id) => id !== personaId);
      }

      return [...currentPersonas, personaId];
    });
  }

  async function runSimulation() {
    if (!policy.trim()) {
      setSimulationError("Please enter a refund policy before running.");
      return;
    }

    if (selectedPersonas.length === 0) {
      setSimulationError("Select at least one virtual customer.");
      return;
    }

    setIsLoading(true);
    setSimulationError("");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(`${API_BASE_URL}/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          policy,
          personas: selectedPersonas,
          simulation_count: simulationCount,
        }),
      });

      if (!response.ok) {
        let errorMessage =
          "The simulation could not be completed.";

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // Keep the default message if the backend did not return JSON.
        }

        throw new Error(errorMessage);
      }

      const results = await response.json();

      saveLatestReport(results, "live");
      setCurrentPage("results");
    } catch (error) {
      if (error.name === "AbortError") {
        setSimulationError(
          "The simulation took too long. Check the backend and try again."
        );
      } else {
        setSimulationError(
          error.message ||
            "Could not connect to the RuleCrash backend."
        );
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }

  if (currentPage === "results" && simulationResults) {
    const findings = simulationResults.findings ?? [];
    const recommendations =
      simulationResults.policyAnalysis?.recommendedChanges ?? [];
    const isDemo = reportType === "demo";

    return (
      <div className="app">
        <header className="navbar">
          <button
            type="button"
            className="logo logo-button"
            onClick={() => setCurrentPage("home")}
          >
            RuleCrash AI
          </button>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              setCurrentPage(isDemo ? "home" : "simulation")
            }
          >
            {isDemo ? "← Back to Home" : "← Back to Simulation"}
          </button>
        </header>

        <main className="workflow-page">
          <div className="workflow-heading">
            <p className="badge">
              {isDemo ? "Guided demo report" : "Step 4 of 4"}
            </p>

            <h1>Simulation results</h1>

            <p>
              {isDemo
                ? "This instant demo shows how RuleCrash presents risks, evidence and policy improvements."
                : "RuleCrash tested the refund workflow using the selected virtual users and identified possible risks."}
            </p>

            {reportSavedAt && (
              <p className="report-meta">
                Latest report saved {formatReportTime(reportSavedAt)}
              </p>
            )}
          </div>

          {isDemo && (
            <div className="demo-notice">
              <div>
                <strong>You are viewing a prepared demo.</strong>
                <p>
                  No backend call was needed. Create your own test to
                  analyse a policy with Gemini and the simulation engine.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={startNewWorkflow}
              >
                Create My Test
              </button>
            </div>
          )}

          <section className="results-panel">
            <div className="result-grid">
              <article className="result-card">
                <p>Total simulations</p>
                <h2>{simulationResults.totalSimulations}</h2>
              </article>

              <article className="result-card danger-card">
                <p>Loopholes found</p>
                <h2>{simulationResults.loopholesFound}</h2>
              </article>

              <article className="result-card warning-card">
                <p>Genuine users rejected</p>
                <h2>{simulationResults.genuineUsersRejected}</h2>
              </article>

              <article className="result-card danger-card">
                <p>Fraud success rate</p>
                <h2>{simulationResults.fraudSuccessRate}%</h2>
              </article>

              <article className="result-card warning-card">
                <p>Bottlenecks found</p>
                <h2>{simulationResults.bottlenecksFound}</h2>
              </article>
            </div>

            <div className="issues-section">
              <p className="section-label">Important findings</p>

              {findings.length === 0 ? (
                <p>No major risks were found.</p>
              ) : (
                findings.map((finding, index) => (
                  <div
                    className="issue-item"
                    key={`${finding.title}-${index}`}
                  >
                    <span
                      className={`issue-level ${String(
                        finding.severity || "medium"
                      ).toLowerCase()}`}
                    >
                      {finding.severity || "Medium"}
                    </span>

                    <div>
                      <h3>{finding.title}</h3>
                      <p>{finding.description}</p>

                      {finding.evidence?.length > 0 && (
                        <div className="evidence-list">
                          <span>Evidence:</span>

                          {finding.evidence.map((caseId) => (
                            <code key={caseId}>{caseId}</code>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {simulationResults.comparison && (
              <section className="comparison-panel">
                <div className="comparison-header">
                  <div>
                    <p className="section-label">Before vs after</p>
                    <h3>Policy improvement impact</h3>
                  </div>

                  <span className="comparison-badge">
                    Same virtual customers
                  </span>
                </div>

                <p className="comparison-description">
                  RuleCrash tested the original and improved policies using
                  the same {simulationResults.totalSimulations} customer
                  journeys.
                </p>

                <div className="comparison-grid">
                  <div className="comparison-column comparison-labels">
                    <strong>Risk metric</strong>
                    <span>Loopholes found</span>
                    <span>Genuine users rejected</span>
                    <span>Fraud success rate</span>
                    <span>Bottlenecks found</span>
                  </div>

                  <div className="comparison-column before-column">
                    <strong>Before</strong>
                    <span>
                      {
                        simulationResults.comparison.before
                          .loopholesFound
                      }
                    </span>
                    <span>
                      {
                        simulationResults.comparison.before
                          .genuineUsersRejected
                      }
                    </span>
                    <span>
                      {
                        simulationResults.comparison.before
                          .fraudSuccessRate
                      }
                      %
                    </span>
                    <span>
                      {
                        simulationResults.comparison.before
                          .bottlenecksFound
                      }
                    </span>
                  </div>

                  <div className="comparison-arrow-column">
                    <strong>→</strong>
                    <span>→</span>
                    <span>→</span>
                    <span>→</span>
                    <span>→</span>
                  </div>

                  <div className="comparison-column after-column">
                    <strong>After</strong>
                    <span>
                      {
                        simulationResults.comparison.after
                          .loopholesFound
                      }
                    </span>
                    <span>
                      {
                        simulationResults.comparison.after
                          .genuineUsersRejected
                      }
                    </span>
                    <span>
                      {
                        simulationResults.comparison.after
                          .fraudSuccessRate
                      }
                      %
                    </span>
                    <span>
                      {
                        simulationResults.comparison.after
                          .bottlenecksFound
                      }
                    </span>
                  </div>
                </div>
              </section>
            )}

            {simulationResults.policyAnalysis && (
              <section className="ai-analysis-panel">
                <div className="ai-analysis-header">
                  <p className="section-label">AI policy analysis</p>

                  <span className="ai-source-badge">
                    {isDemo
                      ? "Prepared demo"
                      : simulationResults.analysisSource === "gemini"
                        ? "Analysed by Gemini"
                        : "Local fallback"}
                  </span>
                </div>

                <div className="risk-summary">
                  <h3>Main policy risk</h3>
                  <p>
                    {
                      simulationResults.policyAnalysis
                        .riskSummary
                    }
                  </p>
                </div>

                <div className="recommendations-section">
                  <h3>Recommended changes</h3>

                  <ol className="recommendation-list">
                    {recommendations.map((change, index) => (
                      <li key={`${change}-${index}`}>{change}</li>
                    ))}
                  </ol>
                </div>
              </section>
            )}

            <div className="results-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setCurrentPage("home")}
              >
                Overview
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setCurrentPage("personas")}
              >
                Change Personas
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() => setCurrentPage("simulation")}
              >
                Run Again
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (currentPage === "personas") {
    return (
      <div className="app">
        <header className="navbar">
          <button
            type="button"
            className="logo logo-button"
            onClick={() => setCurrentPage("home")}
          >
            RuleCrash AI
          </button>

          <button
            type="button"
            className="back-button"
            onClick={() => setCurrentPage("create")}
          >
            ← Back to Policy
          </button>
        </header>

        <main className="workflow-page">
          <div className="workflow-heading">
            <p className="badge">Step 2 of 4</p>
            <h1>Choose virtual users</h1>
            <p>
              Select the customer types that should test your refund
              workflow. Each persona behaves differently.
            </p>
          </div>

          <section className="persona-panel">
            <div className="persona-grid">
              {personas.map((persona) => {
                const isSelected = selectedPersonas.includes(
                  persona.id
                );

                return (
                  <button
                    type="button"
                    key={persona.id}
                    className={`persona-card ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => togglePersona(persona.id)}
                  >
                    <div className="persona-avatar">
                      {persona.shortName}
                    </div>

                    <div className="persona-content">
                      <h3>{persona.name}</h3>
                      <p>{persona.description}</p>
                    </div>

                    <span className="persona-check">
                      {isSelected ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="persona-actions">
              <p>
                <strong>{selectedPersonas.length}</strong> personas
                selected
              </p>

              <button
                type="button"
                className="primary-button"
                disabled={selectedPersonas.length === 0}
                onClick={() => setCurrentPage("simulation")}
              >
                Continue to Simulation
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (currentPage === "simulation") {
    return (
      <div className="app">
        <header className="navbar">
          <button
            type="button"
            className="logo logo-button"
            onClick={() => setCurrentPage("home")}
          >
            RuleCrash AI
          </button>

          <button
            type="button"
            className="back-button"
            onClick={() => setCurrentPage("personas")}
          >
            ← Back to Personas
          </button>
        </header>

        <main className="workflow-page">
          <div className="workflow-heading">
            <p className="badge">Step 3 of 4</p>
            <h1>Configure simulation</h1>
            <p>
              Choose how many virtual-user journeys RuleCrash should run
              through the refund workflow.
            </p>
          </div>

          <section className="simulation-panel">
            <div>
              <p className="section-label">Simulation volume</p>

              <div className="count-options">
                {[100, 250, 500].map((count) => (
                  <button
                    type="button"
                    key={count}
                    className={`count-option ${
                      simulationCount === count ? "selected" : ""
                    }`}
                    onClick={() => setSimulationCount(count)}
                  >
                    <strong>{count}</strong>
                    <span>test journeys</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="simulation-summary">
              <p className="section-label">Selected virtual users</p>

              <div className="selected-persona-list">
                {personas
                  .filter((persona) =>
                    selectedPersonas.includes(persona.id)
                  )
                  .map((persona) => (
                    <span key={persona.id}>{persona.name}</span>
                  ))}
              </div>
            </div>

            <div className="simulation-footer">
              <div>
                <strong>{simulationCount}</strong>
                <p>
                  journeys across {selectedPersonas.length} persona
                  types
                </p>
              </div>

              <div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={runSimulation}
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Running Simulation..."
                    : "Run Simulation"}
                </button>

                {simulationError && (
                  <p className="simulation-error">
                    {simulationError}
                  </p>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (currentPage === "create") {
    return (
      <div className="app">
        <header className="navbar">
          <button
            type="button"
            className="logo logo-button"
            onClick={() => setCurrentPage("home")}
          >
            RuleCrash AI
          </button>

          <button
            type="button"
            className="back-button"
            onClick={() => setCurrentPage("home")}
          >
            ← Back to Home
          </button>
        </header>

        <main className="workflow-page">
          <div className="workflow-heading">
            <p className="badge">Step 1 of 4</p>
            <h1>Create a workflow test</h1>
            <p>
              Paste the business policy that RuleCrash should
              stress-test. We are starting with an e-commerce refund
              workflow.
            </p>
          </div>

          <section className="policy-panel">
            <div className="policy-panel-header">
              <div>
                <p className="section-label">Workflow name</p>
                <h2>E-commerce Refund Policy</h2>
              </div>

              <span className="draft-status">
                {isSaved ? "Saved" : "Draft"}
              </span>
            </div>

            <label htmlFor="policy">Refund policy rules</label>

            <textarea
              id="policy"
              value={policy}
              onChange={(event) => {
                setPolicy(event.target.value);
                setIsSaved(false);
              }}
              placeholder="Enter your refund policy..."
              rows="12"
            />

            <div className="policy-footer">
              <p>{policy.length} characters</p>

              <div className="policy-buttons">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={savePolicy}
                >
                  Save Policy
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={continueToPersonas}
                >
                  Save & Continue
                </button>
              </div>
            </div>

            {isSaved && (
              <div className="success-message">
                Policy saved successfully.
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  if (currentPage === "workflows") {
    return (
      <div className="app">
        <MainNavbar
          activePage="workflows"
          onNavigate={navigateMain}
          onNewWorkflow={startNewWorkflow}
        />

        <main className="dashboard-page">
          <div className="page-heading">
            <p className="badge">Workflow library</p>
            <h1>Your stress-test workflows</h1>
            <p>
              Start from the refund workflow, edit its policy and run it
              against virtual customers.
            </p>
          </div>

          <section className="workflow-library">
            <article className="workflow-card">
              <div className="workflow-card-header">
                <div>
                  <p className="section-label">Active workflow</p>
                  <h2>E-commerce Refund Policy</h2>
                </div>

                <span className="workflow-status">Ready</span>
              </div>

              <p className="workflow-card-description">
                Tests refund rules for genuine, confused, vulnerable and
                fraudulent customer behaviour.
              </p>

              <div className="workflow-meta">
                <span>6 policy rules</span>
                <span>4 personas</span>
                <span>100 / 250 / 500 runs</span>
              </div>

              <div className="workflow-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigateMain("reports")}
                >
                  View Latest Report
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={startNewWorkflow}
                >
                  Run This Workflow
                </button>
              </div>
            </article>
          </section>
        </main>
      </div>
    );
  }

  if (currentPage === "reports") {
    return (
      <div className="app">
        <MainNavbar
          activePage="reports"
          onNavigate={navigateMain}
          onNewWorkflow={startNewWorkflow}
        />

        <main className="dashboard-page">
          <div className="page-heading">
            <p className="badge">Reports</p>
            <h1>No simulation report yet</h1>
            <p>
              Run your first workflow test or open the guided demo to
              see how a RuleCrash report looks.
            </p>
          </div>

          <section className="empty-report-panel">
            <div className="empty-report-icon">R</div>
            <h2>Your latest report will appear here</h2>
            <p>
              Reports are saved in this browser, so your latest result
              remains available after refreshing the page.
            </p>

            <div className="empty-report-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={openDemo}
              >
                View Demo Report
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={startNewWorkflow}
              >
                Create Workflow Test
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <MainNavbar
        activePage="home"
        onNavigate={navigateMain}
        onNewWorkflow={startNewWorkflow}
      />

      <main className="hero" id="overview">
        <p className="badge">AI Workflow Stress Testing</p>

        <h1>
          Find workflow failures
          <span> before real users do.</span>
        </h1>

        <p className="hero-description">
          RuleCrash AI creates virtual users and tests business
          workflows to uncover hidden loopholes, unfair rejections,
          fraud paths and operational bottlenecks.
        </p>

        <div className="hero-buttons">
          <button
            type="button"
            className="primary-button"
            onClick={startNewWorkflow}
          >
            Create Your First Test
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={openDemo}
          >
            View Demo
          </button>
        </div>

        <section className="stats">
          <div className="stat-card">
            <h2>100–500</h2>
            <p>Virtual simulations</p>
          </div>

          <div className="stat-card">
            <h2>4</h2>
            <p>User personas</p>
          </div>

          <div className="stat-card">
            <h2>3</h2>
            <p>Risk categories</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
