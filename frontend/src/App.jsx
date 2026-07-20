 import { useState } from "react";
import "./App.css";

const samplePolicy = `1. Refund requests are accepted within 7 days of delivery.
2. The customer must provide a valid invoice.
3. Damaged products require photographic proof.
4. Refunds above ₹5,000 require manager approval.
5. Only one refund request is allowed per order.
6. Approved refunds are processed within 5 working days.`;

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [policy, setPolicy] = useState(samplePolicy);
  const [isSaved, setIsSaved] = useState(false);

  const savePolicy = () => {
    if (!policy.trim()) {
      alert("Please enter a refund policy.");
      return;
    }

    setIsSaved(true);
  };

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

              <span className="draft-status">Draft</span>
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

              <button className="primary-button" onClick={savePolicy}>
                Save Policy
              </button>
            </div>

            {isSaved && (
              <div className="success-message">
                Policy saved successfully. Next, we will create virtual users.
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