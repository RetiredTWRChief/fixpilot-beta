import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "FixPilot backend running" });
});

app.post("/diagnose", (req, res) => {
  const { problem } = req.body ?? {};

  if (!problem || typeof problem !== "string") {
    return res.status(400).json({ error: "Problem description is required." });
  }

  const lower = problem.toLowerCase();

  let result = {
    title: "Initial FixPilot Guidance",
    likelyIssue: "The issue needs a closer inspection.",
    steps: [
      "Confirm the exact symptoms.",
      "Check for obvious loose, damaged, or leaking components.",
      "Verify battery power, fluid levels, and warning lights."
    ],
    tools: ["Flashlight", "Basic hand tools"],
    safety: "Use caution and verify the vehicle is cool and secure before working on it."
  };

  if (lower.includes("won't start") || lower.includes("wont start") || lower.includes("no start")) {
    result = {
      title: "No-Start Check",
      likelyIssue: "Possible weak battery, starter issue, or fuel/ignition problem.",
      steps: [
        "Check battery voltage and terminal tightness.",
        "Listen for clicking or starter engagement.",
        "Confirm fuel level and watch for warning lights."
      ],
      tools: ["Battery tester", "Wrench set", "Flashlight"],
      safety: "Keep the vehicle in park and away from moving parts while testing."
    };
  } else if (lower.includes("brake")) {
    result = {
      title: "Brake Issue Check",
      likelyIssue: "Possible worn pads, rotor wear, or low brake fluid.",
      steps: [
        "Inspect brake fluid level.",
        "Listen for grinding or squealing.",
        "Check pad thickness if visible."
      ],
      tools: ["Flashlight", "Jack and stands", "Lug wrench"],
      safety: "Never work under a vehicle unless it is properly supported."
    };
  } else if (lower.includes("overheat") || lower.includes("hot") || lower.includes("coolant")) {
    result = {
      title: "Cooling System Check",
      likelyIssue: "Possible coolant leak, bad hose, thermostat issue, or fan problem.",
      steps: [
        "Do not open the cooling system while hot.",
        "Check coolant level after the engine cools.",
        "Inspect hoses and radiator area for leaks."
      ],
      tools: ["Flashlight", "Coolant funnel", "Pliers"],
      safety: "A hot cooling system can cause serious burns."
    };
  }

  res.json(result);
});

app.listen(PORT, () => {
  console.log("FixPilot backend running on port", PORT);
});
