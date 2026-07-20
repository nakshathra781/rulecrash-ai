import { useState } from "react";
import "./App.css";

const samplePolicy = `1. Refund requests are accepted within 7 days of delivery.
2. The customer must provide a valid invoice.
3. Damaged products require photographic proof.
4. Refunds above ₹5,000 require manager approval.
5. Only one refund request is allowed per order.
6. Approved refunds are processed within 5 working days.`;

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

function App() {
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
  const [simulationResults, setSimulationResults] = useState(null);

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
  function runSimulation() {
  const hasFraudster = selectedPersonas.includes("fraudster");
  const hasConfused = selectedPersonas.includes("confused");
  const hasVulnerable = selectedPersonas.includes("vulnerable");

  const results = {
    totalSimulations: simulationCount,
    loopholesFound: hasFraudster ? 3 : 1,
    genuineUsersRejected: hasVulnerable
      ? Math.round(simulationCount * 0.14)
      : Math.round(simulationCount * 0.04),
    fraudSuccessRate: hasFraudster ? 12 : 0,
    bottlenecksFound: hasConfused ? 2 : 1,
  };

  setSimulationResults(results);
  setCurrentPage("results");
}
if (currentPage === "results" && simulationResults) {
  return (
    <div className="app">
      <header className="navbar">
        <button
          className="logo logo-button"
          onClick={() => setCurrentPage("home")}
        >
          RuleCrash AI
        </button>

        <button
          className="back-button"
          onClick={() => setCurrentPage("simulation")}
        >
          ← Back to Simulation
        </button>
      </header>

      <main className="workflow-page">
        <div className="workflow-heading">
          <p className="badge">Step 4 of 4</p>

          <h1>Simulation results</h1>

          <p>
            RuleCrash tested the refund workflow using the selected virtual
            users and identified possible risks.
          </p>
        </div>

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

            <div className="issue-item">
              <span className="issue-level critical">Critical</span>

              <div>
                <h3>Possible duplicate refund path</h3>
                <p>
                  A customer may submit refund requests through the app and
                  customer-support channel before either request is completed.
                </p>
              </div>
            </div>

            <div className="issue-item">
              <span className="issue-level high">High</span>

              <div>
                <h3>Genuine customers can be rejected</h3>
                <p>
                  The current policy rejects every customer without an invoice,
                  even when other valid proof of purchase is available.
                </p>
              </div>
            </div>

            <div className="issue-item">
              <span className="issue-level medium">Medium</span>

              <div>
                <h3>Manager approval creates a bottleneck</h3>
                <p>
                  Every refund above ₹5,000 requires manager approval, which
                  may create delays during high-volume periods.
                </p>
              </div>
            </div>
          </div>

          <div className="results-actions">
            <button
              className="secondary-button"
              onClick={() => setCurrentPage("personas")}
            >
              Change Personas
            </button>

            <button
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
            className="logo logo-button"
            onClick={() => setCurrentPage("home")}
          >
            RuleCrash AI
          </button>

          <button
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
              Select the customer types that should test your refund workflow.
              Each persona behaves differently.
            </p>
          </div>

          <section className="persona-panel">
            <div className="persona-grid">
              {personas.map((persona) => {
                const isSelected = selectedPersonas.includes(persona.id);

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
                <strong>{selectedPersonas.length}</strong> personas selected
              </p>

              <button
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
          className="logo logo-button"
          onClick={() => setCurrentPage("home")}
        >
          RuleCrash AI
        </button>

        <button
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
            Choose how many virtual-user journeys RuleCrash should run through
            the refund workflow.
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
                journeys across {selectedPersonas.length} persona types
              </p>
            </div>

            <button className="primary-button" onClick={runSimulation}>
              Run Simulation
            </button>
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
            className="logo logo-button"
            onClick={() => setCurrentPage("home")}
          >
            RuleCrash AI
          </button>

          <button
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
              Paste the business policy that RuleCrash should stress-test.
              We are starting with an e-commerce refund workflow.
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
                  className="secondary-button"
                  onClick={savePolicy}
                >
                  Save Policy
                </button>

                <button
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

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">RuleCrash AI</div>

        <nav>
          <a href="#overview">Overview</a>
          <a href="#workflows">Workflows</a>
          <a href="#reports">Reports</a>
        </nav>

        <button
          className="new-workflow-button"
          onClick={() => setCurrentPage("create")}
        >
          + New Workflow
        </button>
      </header>

      <main className="hero" id="overview">
        <p className="badge">AI Workflow Stress Testing</p>

        <h1>
          Find workflow failures
          <span> before real users do.</span>
        </h1>

        <p className="hero-description">
          RuleCrash AI creates virtual users and tests business workflows to
          uncover hidden loopholes, unfair rejections, fraud paths and
          operational bottlenecks.
        </p>

        <div className="hero-buttons">
          <button
            className="primary-button"
            onClick={() => setCurrentPage("create")}
          >
            Create Your First Test
          </button>

          <button className="secondary-button">View Demo</button>
        </div>

        <section className="stats">
          <div className="stat-card">
            <h2>100+</h2>
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