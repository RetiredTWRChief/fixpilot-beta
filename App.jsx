import React, { useState } from "react";

const API_BASE_URL = "https://fixpilot-beta.onrender.com";

function SectionCard({ title, children }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 20,
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)"
      }}
    >
      <h3 style={{ margin: "0 0 14px 0", fontSize: 20, color: "#0f172a" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Badge({ children, tone = "default" }) {
  const styles = {
    default: { background: "#e2e8f0", color: "#0f172a" },
    danger: { background: "#fee2e2", color: "#991b1b" },
    info: { background: "#dbeafe", color: "#1d4ed8" },
    success: { background: "#dcfce7", color: "#166534" }
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        ...styles[tone]
      }}
    >
      {children}
    </span>
  );
}

function BulletList({ items }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8, color: "#334155" }}>
      {items?.map((item, index) => (
        <li key={index} style={{ marginBottom: 8 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function StoreCard({ store }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 16,
        background: "#ffffff"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a" }}>
            {store.name}
          </div>
          <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
            {store.type} • {store.distance}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={store.productUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#0f172a",
              color: "white",
              textDecoration: "none",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 700
            }}
          >
            View Parts
          </a>

          <a
            href={store.mapUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#eef2ff",
              color: "#1e3a8a",
              textDecoration: "none",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: 700
            }}
          >
            Open Map
          </a>
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 16,
        background: "#ffffff"
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a" }}>
        {video.title}
      </div>
      <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
        {video.source}
      </div>
      <div style={{ marginTop: 14 }}>
        <a
          href={video.url}
          target="_blank"
          rel="noreferrer"
          style={{
            background: "#0f172a",
            color: "white",
            textDecoration: "none",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 700,
            display: "inline-block"
          }}
        >
          Watch / Search Video
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const [problem, setProblem] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function submitProblem() {
    setError("");
    setResult(null);

    if (!problem.trim()) {
      setError("Please describe the problem first.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/diagnose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          problem,
          year,
          make,
          model,
          vin
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data);

      if (data.decodedVIN) {
        if (!year) setYear(data.decodedVIN.year || "");
        if (!make) setMake(data.decodedVIN.make || "");
        if (!model) setModel(data.decodedVIN.model || "");
      }
    } catch (err) {
      setError("Could not connect to FixPilot backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        fontFamily: "Arial, sans-serif",
        color: "#0f172a"
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 20px 60px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "white",
            borderRadius: 24,
            padding: "32px 28px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 20, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 700 }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.12)",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  marginBottom: 14
                }}
              >
                FixPilot Beta
              </div>

              <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1.05 }}>FixPilot</h1>

              <p
                style={{
                  marginTop: 14,
                  marginBottom: 0,
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: "#cbd5e1"
                }}
              >
                AI repair copilot that helps you understand likely issues,
                next steps, tools, parts, nearby stores, and useful repair videos.
              </p>
            </div>

            <div
              style={{
                minWidth: 220,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 18,
                padding: 16
              }}
            >
              <div style={{ fontSize: 14, color: "#cbd5e1", marginBottom: 8 }}>
                Product status
              </div>
              <Badge tone="success">Live Beta</Badge>
              <p
                style={{
                  marginTop: 12,
                  marginBottom: 0,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#e2e8f0"
                }}
              >
                Add year, make, model, or VIN for better guidance.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 24, marginTop: 24 }}>
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 22,
              padding: 24,
              boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)"
            }}
          >
            <h2 style={{ margin: "0 0 10px 0", fontSize: 26 }}>
              Describe your repair problem
            </h2>

            <p style={{ margin: "0 0 18px 0", color: "#475569", lineHeight: 1.6 }}>
              Add your vehicle details first, then describe the issue as clearly as possible.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
                marginBottom: 16
              }}
            >
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Year"
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  fontSize: 15
                }}
              />
              <input
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Make"
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  fontSize: 15
                }}
              />
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Model"
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  fontSize: 15
                }}
              />
              <input
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                placeholder="VIN"
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  fontSize: 15
                }}
              />
            </div>

            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Example: My battery won't keep its charge and the truck struggles to start in the morning."
              style={{
                width: "100%",
                minHeight: 180,
                padding: 16,
                borderRadius: 16,
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                fontSize: 16,
                lineHeight: 1.6,
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box"
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                marginTop: 18
              }}
            >
              <div style={{ color: "#64748b", fontSize: 14 }}>
                VIN decoding can help auto-fill vehicle details and make results more relevant.
              </div>

              <button
                onClick={submitProblem}
                disabled={loading}
                style={{
                  background: loading ? "#475569" : "#0f172a",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 18px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 15,
                  minWidth: 210,
                  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.16)"
                }}
              >
                {loading ? "Analyzing..." : "Get FixPilot Guidance"}
              </button>
            </div>

            {error ? (
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  borderRadius: 14,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  fontWeight: 600
                }}
              >
                {error}
              </div>
            ) : null}
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            <SectionCard title="How FixPilot helps">
              <BulletList
                items={[
                  "Highlights the likely issue",
                  "Lists likely causes to inspect first",
                  "Suggests tools and parts that may be needed",
                  "Shows nearby parts store starting points",
                  "Recommends videos to keep learning"
                ]}
              />
            </SectionCard>

            <SectionCard title="Best results come from">
              <BulletList
                items={[
                  "Including exact warning messages",
                  "Describing sounds, smells, or vibrations",
                  "Explaining when the issue happens",
                  "Adding year, make, model, or VIN"
                ]}
              />
            </SectionCard>
          </div>
        </div>

        {result ? (
          <div style={{ marginTop: 26, display: "grid", gap: 20 }}>
            <div
              style={{
                background: "white",
                border: "1px solid #dbeafe",
                borderRadius: 22,
                padding: 24,
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 30 }}>{result.title}</h2>
                  <p style={{ margin: "10px 0 0 0", color: "#334155", fontSize: 17, lineHeight: 1.6 }}>
                    <strong>Vehicle:</strong> {result.vehicle}
                  </p>
                  {result.vin ? (
                    <p style={{ margin: "8px 0 0 0", color: "#334155", fontSize: 15, lineHeight: 1.6 }}>
                      <strong>VIN:</strong> {result.vin}
                    </p>
                  ) : null}
                  <p style={{ margin: "8px 0 0 0", color: "#334155", fontSize: 17, lineHeight: 1.6 }}>
                    <strong>Likely issue:</strong> {result.likelyIssue}
                  </p>
                </div>

                <Badge tone="info">Difficulty: {result.difficulty}</Badge>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <SectionCard title="Likely causes">
                <BulletList items={result.likelyCauses} />
              </SectionCard>

              <SectionCard title="Recommended steps">
                <BulletList items={result.steps} />
              </SectionCard>

              <SectionCard title="Parts that may be needed">
                <BulletList items={result.partsNeeded} />
              </SectionCard>

              <SectionCard title="Tools">
                <BulletList items={result.tools} />
              </SectionCard>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <SectionCard title="When to get professional help">
                <p style={{ margin: 0, color: "#334155", lineHeight: 1.8 }}>
                  {result.getHelpIf}
                </p>
              </SectionCard>

              <SectionCard title="Safety">
                <p style={{ margin: 0, color: "#334155", lineHeight: 1.8 }}>
                  {result.safety}
                </p>
              </SectionCard>
            </div>

            <SectionCard title="Nearby stores and parts links">
              <div style={{ display: "grid", gap: 14 }}>
                {result.stores?.map((store, index) => (
                  <StoreCard key={index} store={store} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Recommended videos">
              <div style={{ display: "grid", gap: 14 }}>
                {result.videos?.map((video, index) => (
                  <VideoCard key={index} video={video} />
                ))}
              </div>
            </SectionCard>
          </div>
        ) : null}
      </div>
    </div>
  );
}
