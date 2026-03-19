import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [formData, setFormData] = useState({
    year: "",
    make: "",
    model: "",
    engine: "",
    vin: "",
    symptoms: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/diagnose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to get diagnosis.");
      }

      setResult(data.result);
    } catch (err) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const difficultyClass = (difficulty) => {
    const text = (difficulty || "").toLowerCase();

    if (text.includes("beginner")) return "badge beginner";
    if (text.includes("intermediate")) return "badge intermediate";
    return "badge advanced";
  };

  return (
    <div className="app-shell">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f4f7fb;
          color: #1f2937;
        }

        a {
          color: #1d4ed8;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        .app-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 30%),
            radial-gradient(circle at top right, rgba(14, 165, 233, 0.07), transparent 25%),
            #f4f7fb;
          padding: 32px 16px 60px;
        }

        .container {
          max-width: 1250px;
          margin: 0 auto;
        }

        .hero {
          background: linear-gradient(135deg, #111827, #1f2937);
          color: white;
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 18px 50px rgba(17, 24, 39, 0.18);
          margin-bottom: 24px;
        }

        .hero h1 {
          margin: 0 0 10px;
          font-size: 2rem;
          line-height: 1.2;
        }

        .hero p {
          margin: 0;
          color: #d1d5db;
          font-size: 1rem;
          line-height: 1.6;
          max-width: 900px;
        }

        .layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        @media (min-width: 980px) {
          .layout {
            grid-template-columns: 420px 1fr;
            align-items: start;
          }
        }

        .panel {
          background: white;
          border-radius: 22px;
          padding: 22px;
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
          border: 1px solid #e5e7eb;
        }

        .panel h2 {
          margin-top: 0;
          margin-bottom: 14px;
          font-size: 1.25rem;
        }

        .subtext {
          margin-top: 0;
          margin-bottom: 18px;
          color: #6b7280;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        .field {
          margin-bottom: 14px;
        }

        .field label {
          display: block;
          font-weight: 700;
          margin-bottom: 6px;
          font-size: 0.95rem;
        }

        .field input,
        .field textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #d1d5db;
          border-radius: 14px;
          font-size: 0.97rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #fff;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
        }

        .field textarea {
          min-height: 140px;
          resize: vertical;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .submit-btn {
          width: 100%;
          border: none;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border-radius: 16px;
          padding: 14px 18px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.22);
        }

        .submit-btn:hover {
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .error-box {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          padding: 14px;
          border-radius: 14px;
          margin-top: 14px;
        }

        .placeholder {
          background: white;
          border: 1px dashed #cbd5e1;
          border-radius: 22px;
          padding: 30px;
          text-align: center;
          color: #64748b;
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.04);
        }

        .result-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .top-summary {
          background: linear-gradient(135deg, #eff6ff, #f8fbff);
          border: 1px solid #dbeafe;
          border-radius: 20px;
          padding: 20px;
        }

        .top-summary h2 {
          margin: 0 0 10px;
          font-size: 1.45rem;
          color: #111827;
        }

        .top-summary p {
          margin: 0 0 12px;
          color: #374151;
          line-height: 1.7;
        }

        .mechanic-intro {
          font-size: 1.05rem;
          font-weight: 600;
          color: #1e3a8a;
          margin-bottom: 14px;
        }

        .mechanic-closing {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 16px;
          padding: 14px;
          color: #1e3a8a;
          font-weight: 600;
          line-height: 1.6;
        }

        .badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 12px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .confidence {
          background: #e0f2fe;
          color: #075985;
        }

        .beginner {
          background: #dcfce7;
          color: #166534;
        }

        .intermediate {
          background: #fef3c7;
          color: #92400e;
        }

        .advanced {
          background: #fee2e2;
          color: #991b1b;
        }

        .section-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 900px) {
          .section-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .info-card {
          background: white;
          border-radius: 20px;
          padding: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
        }

        .info-card h3 {
          margin-top: 0;
          margin-bottom: 12px;
          font-size: 1.05rem;
          color: #111827;
        }

        .info-card p {
          margin: 0;
          line-height: 1.7;
          color: #374151;
        }

        .warning-card {
          background: #fff7ed;
          border: 1px solid #fed7aa;
        }

        .stop-card {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .list {
          margin: 0;
          padding-left: 20px;
          color: #374151;
        }

        .list li {
          margin-bottom: 10px;
          line-height: 1.65;
        }

        .tool-list {
          display: grid;
          gap: 12px;
        }

        .tool-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 14px;
        }

        .tool-item strong {
          display: block;
          margin-bottom: 4px;
          color: #111827;
        }

        .tool-item span {
          color: #475569;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .resource-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 900px) {
          .resource-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .resource-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 14px;
        }

        .resource-item strong {
          display: block;
          margin-bottom: 8px;
        }

        .link-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 8px;
        }

        .chip-link {
          display: inline-block;
          padding: 8px 12px;
          border-radius: 999px;
          background: #e0ecff;
          color: #1d4ed8;
          font-size: 0.88rem;
          font-weight: 700;
        }

        .question-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 18px;
          padding: 18px;
        }

        .notes li {
          color: #475569;
        }

        .footer-note {
          margin-top: 18px;
          font-size: 0.9rem;
          color: #64748b;
          text-align: center;
        }
      `}</style>

      <div className="container">
        <div className="hero">
          <h1>Mechanic-Style Vehicle Diagnosis Assistant</h1>
          <p>
            Describe what your vehicle is doing, and I’ll help you think through
            the most likely issue, what to check first, the tools you may need,
            parts to look for, videos to watch, and when it is safer to stop and
            call a professional.
          </p>
        </div>

        <div className="layout">
          <div className="panel">
            <h2>Enter Vehicle Details</h2>
            <p className="subtext">
              The more detail you give, the better the diagnosis will be.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="year">Year</label>
                  <input
                    id="year"
                    name="year"
                    type="text"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="2019"
                  />
                </div>

                <div className="field">
                  <label htmlFor="make">Make</label>
                  <input
                    id="make"
                    name="make"
                    type="text"
                    value={formData.make}
                    onChange={handleChange}
                    placeholder="Ram"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="field">
                  <label htmlFor="model">Model</label>
                  <input
                    id="model"
                    name="model"
                    type="text"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="1500 Limited"
                  />
                </div>

                <div className="field">
                  <label htmlFor="engine">Engine</label>
                  <input
                    id="engine"
                    name="engine"
                    type="text"
                    value={formData.engine}
                    onChange={handleChange}
                    placeholder="5.7L V8"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="vin">VIN</label>
                <input
                  id="vin"
                  name="vin"
                  type="text"
                  value={formData.vin}
                  onChange={handleChange}
                  placeholder="Enter VIN if available"
                />
              </div>

              <div className="field">
                <label htmlFor="symptoms">Describe the Symptoms</label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Example: The truck struggles to start in the morning, I hear clicking, and the battery light came on yesterday."
                  required
                />
              </div>

              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? "Analyzing Vehicle Symptoms..." : "Get Diagnosis"}
              </button>
            </form>

            {error && <div className="error-box">{error}</div>}
          </div>

          <div>
            {!result ? (
              <div className="placeholder">
                <h2>No diagnosis yet</h2>
                <p>
                  Enter the vehicle details and symptoms, then click{" "}
                  <strong>Get Diagnosis</strong> to see a mechanic-style
                  breakdown.
                </p>
              </div>
            ) : (
              <div className="result-card">
                <div className="top-summary">
                  {result.mechanicIntro && (
                    <div className="mechanic-intro">{result.mechanicIntro}</div>
                  )}

                  <h2>{result.title}</h2>
                  <p>{result.summary}</p>

                  <div className="badge-row">
                    <span className="badge confidence">
                      Confidence: {result.confidence}
                    </span>
                    <span className={difficultyClass(result.difficulty)}>
                      Difficulty: {result.difficulty}
                    </span>
                  </div>
                </div>

                <div className="section-grid">
                  <div className="info-card">
                    <h3>Why This Might Be Happening</h3>
                    <p>{result.why}</p>
                  </div>

                  <div className="info-card">
                    <h3>What To Check First</h3>
                    <p>{result.firstCheck}</p>
                  </div>

                  <div className="info-card warning-card">
                    <h3>Safety Warning</h3>
                    <p>{result.safety}</p>
                  </div>

                  <div className="info-card stop-card">
                    <h3>When To Stop And Call A Mechanic</h3>
                    <p>{result.whenToStop}</p>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Tools You May Need</h3>
                  <div className="tool-list">
                    {result.tools?.map((tool, index) => (
                      <div className="tool-item" key={index}>
                        <strong>{tool.name}</strong>
                        <span>{tool.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="info-card">
                  <h3>Step-By-Step Beginner-Friendly Checks</h3>
                  <ol className="list">
                    {result.steps?.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="info-card">
                  <h3>Parts Lookup Links</h3>
                  <div className="resource-grid">
                    {result.partLinks?.map((part, index) => (
                      <div className="resource-item" key={index}>
                        <strong>{part.name}</strong>
                        <div className="link-row">
                          <a
                            className="chip-link"
                            href={part.google}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Google
                          </a>
                          <a
                            className="chip-link"
                            href={part.amazon}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Amazon
                          </a>
                          <a
                            className="chip-link"
                            href={part.autozone}
                            target="_blank"
                            rel="noreferrer"
                          >
                            AutoZone
                          </a>
                          <a
                            className="chip-link"
                            href={part.rockauto}
                            target="_blank"
                            rel="noreferrer"
                          >
                            RockAuto
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="info-card">
                  <h3>Helpful Videos</h3>
                  <div className="resource-grid">
                    {result.videoLinks?.map((video, index) => (
                      <div className="resource-item" key={index}>
                        <strong>{video.title}</strong>
                        <div className="link-row">
                          <a
                            className="chip-link"
                            href={video.youtube}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Watch on YouTube
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {result.followUpQuestions?.length > 0 && (
                  <div className="info-card question-box">
                    <h3>Questions I’d Ask Next Like A Mechanic Would</h3>
                    <ul className="list">
                      {result.followUpQuestions.map((question, index) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.extraNotes?.length > 0 && (
                  <div className="info-card">
                    <h3>Extra Notes</h3>
                    <ul className="list notes">
                      {result.extraNotes.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.mechanicClosing && (
                  <div className="mechanic-closing">
                    {result.mechanicClosing}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="footer-note">
          This tool gives guided repair advice, not a guaranteed repair answer.
          Always inspect safely before buying parts or replacing components.
        </div>
      </div>
    </div>
  );
}
