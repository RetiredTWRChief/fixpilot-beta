import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: [
    "https://www.tryfixpilot.com",
    "https://tryfixpilot.com",
    "https://fixpilot-frontend.vercel.app"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "FixPilot backend running" });
});

function makeStoreResults(searchTerm) {
  return [
    {
      name: "AutoZone",
      distance: "2.4 mi",
      type: "Nearby store",
      mapUrl: `https://www.google.com/maps/search/${encodeURIComponent("AutoZone near me")}`,
      productUrl: `https://www.autozone.com/searchresult?searchText=${encodeURIComponent(searchTerm)}`
    },
    {
      name: "Advance Auto Parts",
      distance: "3.1 mi",
      type: "Nearby store",
      mapUrl: `https://www.google.com/maps/search/${encodeURIComponent("Advance Auto Parts near me")}`,
      productUrl: `https://shop.advanceautoparts.com/search?searchTerm=${encodeURIComponent(searchTerm)}`
    },
    {
      name: "O'Reilly Auto Parts",
      distance: "4.0 mi",
      type: "Nearby store",
      mapUrl: `https://www.google.com/maps/search/${encodeURIComponent("O'Reilly Auto Parts near me")}`,
      productUrl: `https://www.oreillyauto.com/search?q=${encodeURIComponent(searchTerm)}`
    }
  ];
}

app.post("/diagnose", (req, res) => {
  const { problem } = req.body ?? {};

  if (!problem || typeof problem !== "string") {
    return res.status(400).json({ error: "Problem description is required." });
  }

  const lower = problem.toLowerCase();

  let result = {
    title: "Initial FixPilot Guidance",
    likelyIssue: "The issue needs a closer inspection.",
    likelyCauses: [
      "A loose, worn, or damaged component",
      "A maintenance-related issue",
      "An electrical or fluid-level problem"
    ],
    steps: [
      "Confirm the exact symptoms and when they happen.",
      "Check for obvious loose, damaged, or leaking components.",
      "Verify battery power, fluid levels, and warning lights."
    ],
    partsNeeded: [
      "No exact parts identified yet",
      "Basic diagnostic supplies may be needed"
    ],
    tools: ["Flashlight", "Basic hand tools"],
    difficulty: "Moderate",
    getHelpIf: "Stop and get professional help if you see major leaks, smoke, severe noises, or warning lights that indicate immediate risk.",
    safety: "Use caution and verify the vehicle is cool and secure before working on it.",
    stores: makeStoreResults("vehicle diagnostic tools")
  };

  if (lower.includes("won't start") || lower.includes("wont start") || lower.includes("no start")) {
    result = {
      title: "No-Start Check",
      likelyIssue: "Possible weak battery, starter issue, or fuel/ignition problem.",
      likelyCauses: [
        "Weak or discharged battery",
        "Loose or corroded battery terminals",
        "Starter or starter relay issue",
        "Fuel or ignition system fault"
      ],
      steps: [
        "Check battery voltage and terminal tightness.",
        "Listen for clicking or starter engagement.",
        "Confirm fuel level and watch for warning lights.",
        "Try jump-starting only if battery condition is suspected and connections are safe."
      ],
      partsNeeded: [
        "Battery terminals or cleaning kit",
        "Battery if failed load test",
        "Starter relay or starter if diagnosed bad"
      ],
      tools: ["Battery tester", "Wrench set", "Flashlight"],
      difficulty: "Moderate",
      getHelpIf: "Get professional help if the vehicle repeatedly fails to start after confirmed battery support, or if starter wiring appears damaged.",
      safety: "Keep the vehicle in park and away from moving parts while testing.",
      stores: makeStoreResults("car battery starter relay battery terminals")
    };
  } else if (lower.includes("brake")) {
    result = {
      title: "Brake Issue Check",
      likelyIssue: "Possible worn pads, rotor wear, or low brake fluid.",
      likelyCauses: [
        "Worn brake pads",
        "Scored or warped rotors",
        "Low brake fluid",
        "Sticking caliper hardware"
      ],
      steps: [
        "Inspect brake fluid level.",
        "Listen for grinding or squealing.",
        "Check pad thickness if visible.",
        "Inspect rotor surface condition and wheel area for leaks."
      ],
      partsNeeded: [
        "Brake pads",
        "Brake rotors if worn or damaged",
        "Brake fluid if low and leak source is resolved"
      ],
      tools: ["Flashlight", "Jack and stands", "Lug wrench"],
      difficulty: "Moderate",
      getHelpIf: "Get professional help immediately if the brake pedal feels unsafe, sinks, or braking is severely reduced.",
      safety: "Never work under a vehicle unless it is properly supported.",
      stores: makeStoreResults("brake pads brake rotors brake fluid")
    };
  } else if (lower.includes("overheat") || lower.includes("hot") || lower.includes("coolant")) {
    result = {
      title: "Cooling System Check",
      likelyIssue: "Possible coolant leak, bad hose, thermostat issue, or fan problem.",
      likelyCauses: [
        "Coolant leak from hose or radiator",
        "Stuck thermostat",
        "Cooling fan problem",
        "Low coolant level"
      ],
      steps: [
        "Do not open the cooling system while hot.",
        "Check coolant level after the engine cools.",
        "Inspect hoses and radiator area for leaks.",
        "Watch for cooling fan operation when appropriate."
      ],
      partsNeeded: [
        "Coolant",
        "Upper or lower hose if leaking",
        "Thermostat if confirmed faulty"
      ],
      tools: ["Flashlight", "Coolant funnel", "Pliers"],
      difficulty: "Moderate",
      getHelpIf: "Stop driving and get help if temperature continues rising rapidly or coolant is pouring out.",
      safety: "A hot cooling system can cause serious burns.",
      stores: makeStoreResults("coolant radiator hose thermostat")
    };
  } else if (lower.includes("battery") || lower.includes("charge") || lower.includes("charging")) {
    result = {
      title: "Battery / Charging System Check",
      likelyIssue: "Possible weak battery, charging system issue, parasitic draw, or poor cable connection.",
      likelyCauses: [
        "Battery no longer holding charge",
        "Alternator not charging properly",
        "Loose or corroded battery connections",
        "Electrical draw while vehicle is off"
      ],
      steps: [
        "Inspect battery terminals for corrosion or looseness.",
        "Test battery voltage with engine off and engine running.",
        "Check for warning lights related to charging.",
        "Confirm whether the battery goes dead after sitting or while driving."
      ],
      partsNeeded: [
        "Battery if failed test",
        "Terminal cleaning supplies",
        "Alternator if charging output is confirmed low"
      ],
      tools: ["Battery tester", "Multimeter", "Wrench set"],
      difficulty: "Moderate",
      getHelpIf: "Get professional help if charging voltage is unstable, wiring is damaged, or repeated dead-battery events continue after battery replacement.",
      safety: "Keep metal tools away from both battery terminals at the same time.",
      stores: makeStoreResults("car battery alternator battery terminal cleaner")
    };
  } else if (lower.includes("air suspension") || lower.includes("suspension")) {
    result = {
      title: "Air Suspension Warning Check",
      likelyIssue: "Possible air leak, ride-height sensor issue, compressor issue, or control fault.",
      likelyCauses: [
        "Air spring or line leak",
        "Ride-height sensor fault",
        "Weak or failed compressor",
        "Electrical or module-related issue"
      ],
      steps: [
        "Note whether one corner sits lower than the others.",
        "Listen for compressor operation and how often it runs.",
        "Inspect for obvious air line damage if safely accessible.",
        "Check for warning messages and whether ride height changes while parked."
      ],
      partsNeeded: [
        "Air line or fitting if leaking",
        "Ride-height sensor if faulty",
        "Compressor assembly if confirmed failed"
      ],
      tools: ["Flashlight", "Soapy water spray", "Basic hand tools"],
      difficulty: "Advanced",
      getHelpIf: "Get professional help if the vehicle sags severely, compressor runs constantly, or warning messages persist after restart.",
      safety: "Do not place yourself under a vehicle with unstable ride height unless it is properly supported.",
      stores: makeStoreResults("air suspension compressor ride height sensor air line fitting")
    };
  }

  res.json(result);
});

app.listen(PORT, () => {
  console.log("FixPilot backend running on port", PORT);
});
