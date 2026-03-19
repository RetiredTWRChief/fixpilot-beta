const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function normalizeText(value) {
  return (value || "").toString().trim().toLowerCase();
}

function includesAny(text, keywords) {
  return keywords.some((word) => text.includes(word));
}

function buildResponse({
  title,
  confidence,
  summary,
  why,
  firstCheck,
  tools,
  difficulty,
  safety,
  steps,
  parts,
  videos,
  whenToStop,
  extraNotes = [],
}) {
  return {
    success: true,
    result: {
      title,
      confidence,
      summary,
      why,
      firstCheck,
      tools,
      difficulty,
      safety,
      steps,
      parts,
      videos,
      whenToStop,
      extraNotes,
    },
  };
}

function getDetailedDiagnosis(symptoms, vehicle) {
  const text = normalizeText(symptoms);
  const year = vehicle.year || "";
  const make = vehicle.make || "";
  const model = vehicle.model || "";
  const engine = vehicle.engine || "";
  const vin = vehicle.vin || "";

  const vehicleLine = [year, make, model, engine].filter(Boolean).join(" ").trim();

  // Battery / alternator / no start
  if (
    includesAny(text, [
      "won't start",
      "wont start",
      "no start",
      "clicking",
      "battery",
      "dead battery",
      "slow crank",
      "crank slow",
      "needs jump",
      "won't crank",
      "wont crank",
    ])
  ) {
    const likelyAlternator = includesAny(text, ["battery light", "dies while driving", "keeps needing jump", "after jump"]);

    return buildResponse({
      title: likelyAlternator
        ? "Most Likely Issue: Charging System Problem"
        : "Most Likely Issue: Weak Battery or Poor Battery Connection",
      confidence: likelyAlternator ? "High" : "Medium-High",
      summary: likelyAlternator
        ? `Alright, based on what you described${vehicleLine ? ` for your ${vehicleLine}` : ""}, the charging system is one of the most likely problems. That usually means the battery is not being charged correctly while the engine is running.`
        : `Alright, based on what you described${vehicleLine ? ` for your ${vehicleLine}` : ""}, the most likely issue is a weak battery, loose battery terminal, or corroded battery connection.`,
      why: likelyAlternator
        ? "When a vehicle starts after a jump but later dies again, or the battery light is on, that often points to the alternator, battery cables, or charging circuit."
        : "A clicking sound, slow cranking, or no crank at all usually happens when the battery voltage is too low or the battery terminals are dirty or loose.",
      firstCheck:
        "Start by checking both battery terminals. Make sure they are tight, clean, and free of white or green corrosion. Then check whether the battery is older than about 3 to 5 years.",
      tools: [
        {
          name: "10mm wrench or socket",
          description: "Common size used to loosen and tighten battery terminal clamps.",
        },
        {
          name: "Battery terminal cleaning brush",
          description: "Helps remove corrosion so the battery makes good contact.",
        },
        {
          name: "Flashlight",
          description: "Makes it easier to inspect cable ends, cracks, and corrosion.",
        },
        {
          name: "Gloves",
          description: "Protects your hands from corrosion and sharp edges.",
        },
        {
          name: "Multimeter",
          description: "Used to measure battery voltage and charging voltage.",
        },
      ],
      difficulty: "Beginner to Intermediate",
      safety:
        "Do not let metal tools touch both battery terminals at the same time. Wear eye protection if corrosion is present. If the battery is cracked, leaking, or swollen, do not continue.",
      steps: [
        "Turn the vehicle off and remove the key.",
        "Open the hood and locate the battery.",
        "Inspect both battery terminals for looseness, corrosion, or damaged cables.",
        "If corrosion is present, disconnect the negative terminal first, then the positive terminal.",
        "Clean the terminals and cable ends until the metal looks clean.",
        "Reconnect the positive terminal first, then the negative terminal, and tighten both securely.",
        "Use a multimeter to check battery voltage. Around 12.6V with engine off is a healthy fully charged battery.",
        "Start the engine and check charging voltage. Around 13.5V to 14.8V usually means the alternator is charging.",
        "If voltage stays low while the engine is running, the alternator or charging circuit may be failing.",
      ],
      parts: [
        "Battery",
        "Battery terminal ends",
        "Battery cables",
        "Alternator",
        "Serpentine belt",
      ],
      videos: [
        "How to clean battery terminals safely",
        "How to test a car battery with a multimeter",
        "How to test an alternator charging system",
      ],
      whenToStop:
        "Stop and call a mechanic if the battery is leaking, the cables are badly damaged, the vehicle dies while driving, or you are not comfortable working around electrical components.",
      extraNotes: [
        vin ? `VIN entered: ${vin}` : "No VIN entered.",
        "Before replacing the battery or alternator, always test voltage first. Guessing can waste money.",
      ],
    });
  }

  // Overheating / coolant
  if (
    includesAny(text, [
      "overheat",
      "overheating",
      "hot",
      "temperature",
      "coolant",
      "radiator",
      "steam",
      "thermostat",
      "engine temp",
      "running hot",
    ])
  ) {
    return buildResponse({
      title: "Most Likely Issue: Cooling System Problem",
      confidence: "High",
      summary: `Based on your description${vehicleLine ? ` for your ${vehicleLine}` : ""}, your vehicle may have a cooling system issue such as low coolant, a stuck thermostat, a radiator fan problem, or a leak.`,
      why: "An overheating engine usually means heat is not leaving the engine correctly. That can happen when coolant is low, coolant is not circulating, airflow is poor, or pressure is being lost.",
      firstCheck:
        "Let the engine cool completely before touching anything. Then check the coolant level in the overflow reservoir and look for obvious leaks under the vehicle.",
      tools: [
        {
          name: "Flashlight",
          description: "Helps inspect hoses, the radiator area, and leak spots.",
        },
        {
          name: "Gloves",
          description: "Protects hands from hot surfaces and coolant residue.",
        },
        {
          name: "Coolant funnel",
          description: "Makes it easier to add coolant without spilling.",
        },
        {
          name: "Pliers",
          description: "Useful for spring hose clamps if hoses need inspection.",
        },
        {
          name: "OBD2 scanner",
          description: "Can help verify engine temperature and cooling fan operation if supported.",
        },
      ],
      difficulty: "Beginner to Intermediate",
      safety:
        "Never remove the radiator cap while the engine is hot. Hot coolant can spray out and cause serious burns.",
      steps: [
        "Park the vehicle and let the engine cool fully.",
        "Check the coolant level in the overflow bottle.",
        "Inspect the ground under the vehicle for coolant leaks.",
        "Look at the upper and lower radiator hoses for swelling, cracking, or wet spots.",
        "Start the engine and watch the temperature gauge.",
        "When the engine warms up, see whether the radiator fan turns on.",
        "If the fan does not turn on, the fan motor, relay, sensor, or wiring may be the issue.",
        "If coolant is low, top it off with the correct coolant type and monitor for leaks.",
        "If the engine still overheats, the thermostat, water pump, radiator, or head gasket may need professional inspection.",
      ],
      parts: [
        "Coolant",
        "Thermostat",
        "Radiator hose",
        "Radiator cap",
        "Cooling fan relay",
        "Water pump",
      ],
      videos: [
        "How to check coolant level safely",
        "How to diagnose an overheating engine",
        "How to tell if a thermostat is stuck",
      ],
      whenToStop:
        "Stop immediately if you see steam, smell burning coolant, or the temperature gauge enters the red zone. Continuing to drive can severely damage the engine.",
      extraNotes: [
        "If overheating happens only at idle, check the radiator fan first.",
        "If overheating happens mostly at highway speed, coolant flow or restriction may be part of the problem.",
      ],
    });
  }

  // Brake issues
  if (
    includesAny(text, [
      "brake",
      "brakes",
      "squeak",
      "squealing",
      "grinding",
      "soft pedal",
      "brake pedal",
      "rotor",
      "stopping",
    ])
  ) {
    return buildResponse({
      title: "Most Likely Issue: Brake Wear or Brake Hardware Problem",
      confidence: "High",
      summary: `Based on your symptoms${vehicleLine ? ` on your ${vehicleLine}` : ""}, the issue may be worn brake pads, damaged rotors, low brake fluid, or sticking brake hardware.`,
      why: "Squealing often points to pad wear indicators. Grinding can mean the pads are completely worn down. A soft pedal can point to air in the system, low fluid, or a hydraulic leak.",
      firstCheck:
        "Start by checking brake fluid level and listening carefully to when the noise happens: light braking, hard braking, or all the time.",
      tools: [
        {
          name: "Lug wrench",
          description: "Used to remove the wheel if you inspect the brakes directly.",
        },
        {
          name: "Jack and jack stands",
          description: "Needed to safely raise and support the vehicle.",
        },
        {
          name: "Flashlight",
          description: "Helps inspect pad thickness and rotor condition.",
        },
        {
          name: "Brake cleaner",
          description: "Used to clean brake dust and parts during inspection.",
        },
        {
          name: "C-clamp or brake piston tool",
          description: "Used when compressing the caliper piston during brake work.",
        },
      ],
      difficulty: "Intermediate",
      safety:
        "Do not drive the vehicle if the brakes grind badly, the pedal feels unsafe, or the vehicle pulls hard while braking.",
      steps: [
        "Check brake fluid in the reservoir.",
        "Listen for whether the noise happens only while braking or also while driving.",
        "Inspect wheel areas for excessive brake dust or signs of leakage.",
        "If safe to do so, remove the wheel and inspect the brake pads.",
        "Look for thin pads, deep rotor grooves, uneven wear, or stuck hardware.",
        "If pads are thin or rotors are damaged, replace parts in axle pairs.",
        "If the pedal feels soft, inspect for leaks and consider bleeding the brake system.",
      ],
      parts: [
        "Brake pads",
        "Brake rotors",
        "Brake fluid",
        "Caliper slide pins",
        "Brake hardware kit",
      ],
      videos: [
        "How to inspect brake pads and rotors",
        "How to tell the difference between squeaking and grinding brakes",
        "How to check brake fluid safely",
      ],
      whenToStop:
        "Stop and get professional help if braking distance increases, the pedal sinks, fluid is leaking, or metal-on-metal grinding is present.",
      extraNotes: [
        "Brake noises should never be ignored. A small squeak can become an expensive repair if left too long.",
      ],
    });
  }

  // Engine misfire / rough idle / check engine
  if (
    includesAny(text, [
      "misfire",
      "rough idle",
      "rough",
      "check engine",
      "shaking",
      "hesitation",
      "stumble",
      "engine light",
      "jerking",
    ])
  ) {
    return buildResponse({
      title: "Most Likely Issue: Ignition or Air/Fuel Problem",
      confidence: "Medium-High",
      summary: `From what you described${vehicleLine ? ` on your ${vehicleLine}` : ""}, the engine may be misfiring due to worn spark plugs, a weak ignition coil, a vacuum leak, or a fuel delivery problem.`,
      why: "When an engine shakes, hesitates, or idles poorly, one or more cylinders may not be burning fuel correctly.",
      firstCheck:
        "Start by checking whether the check engine light is on. If it is, scan the vehicle for trouble codes before replacing parts.",
      tools: [
        {
          name: "OBD2 scanner",
          description: "Reads fault codes that can point toward the affected cylinder or system.",
        },
        {
          name: "Spark plug socket",
          description: "Used to remove and inspect spark plugs.",
        },
        {
          name: "Ratchet and extension",
          description: "Helps reach coils and spark plugs.",
        },
        {
          name: "Flashlight",
          description: "Useful for spotting cracked hoses or loose connectors.",
        },
        {
          name: "Mechanic gloves",
          description: "Protects your hands while working around a hot engine bay.",
        },
      ],
      difficulty: "Intermediate",
      safety:
        "Do not continue driving if the check engine light is flashing. That can mean an active misfire that may damage the catalytic converter.",
      steps: [
        "Check if the check engine light is on or flashing.",
        "Use an OBD2 scanner to read codes.",
        "Inspect ignition coil connectors and vacuum hoses for loose or cracked parts.",
        "Check spark plug service history if known.",
        "If a code points to a specific cylinder, inspect that coil and spark plug first.",
        "Look for signs of oil in spark plug wells or damaged intake hoses.",
        "If the problem remains unclear, fuel pressure or injector testing may be needed.",
      ],
      parts: [
        "Spark plugs",
        "Ignition coil",
        "Air filter",
        "Vacuum hose",
        "Fuel injector",
      ],
      videos: [
        "How to diagnose a rough idle",
        "How to read check engine codes with an OBD2 scanner",
        "How to inspect spark plugs and coils",
      ],
      whenToStop:
        "Stop and get help if the engine shakes violently, the light flashes, power drops severely, or the engine stalls repeatedly.",
      extraNotes: [
        "Reading codes first can save a lot of guesswork and unnecessary parts replacement.",
      ],
    });
  }

  // Suspension / steering noise
  if (
    includesAny(text, [
      "clunk",
      "knock",
      "suspension",
      "steering",
      "turning",
      "wheel bearing",
      "humming",
      "front end",
      "rattle",
    ])
  ) {
    return buildResponse({
      title: "Most Likely Issue: Suspension, Steering, or Wheel Bearing Problem",
      confidence: "Medium",
      summary: `Based on your description${vehicleLine ? ` for your ${vehicleLine}` : ""}, the noise may be coming from a worn suspension part, steering component, or wheel bearing.`,
      why: "Clunking over bumps can point to sway bar links, ball joints, or control arm bushings. A humming sound that changes with speed can point to a wheel bearing.",
      firstCheck:
        "Pay attention to when the sound happens: over bumps, while turning, while braking, or only at certain speeds.",
      tools: [
        {
          name: "Flashlight",
          description: "Useful for checking boots, bushings, and loose parts.",
        },
        {
          name: "Jack and jack stands",
          description: "Needed to safely inspect wheel play and suspension components.",
        },
        {
          name: "Pry bar",
          description: "Helps check for movement in worn suspension joints and bushings.",
        },
        {
          name: "Lug wrench",
          description: "Used to remove the wheel if deeper inspection is needed.",
        },
      ],
      difficulty: "Intermediate",
      safety:
        "Do not continue driving if steering feels loose, the vehicle wanders badly, or a wheel bearing is making loud grinding noises.",
      steps: [
        "Drive slowly in a safe area and notice exactly when the noise occurs.",
        "Inspect tires for uneven wear.",
        "Check under the vehicle for obviously loose or damaged parts.",
        "Raise the suspected corner safely and check for wheel play.",
        "Inspect sway bar links, ball joints, control arm bushings, and tie rod ends.",
        "If humming changes when turning left or right, inspect wheel bearings closely.",
      ],
      parts: [
        "Sway bar link",
        "Ball joint",
        "Tie rod end",
        "Control arm",
        "Wheel bearing hub assembly",
      ],
      videos: [
        "How to find a front end clunk",
        "How to check wheel bearing play",
        "How to inspect suspension components safely",
      ],
      whenToStop:
        "Stop and get professional help if steering becomes unpredictable, a wheel has excessive play, or metal parts appear cracked or separated.",
      extraNotes: [
        "A small suspension noise can turn into a major safety issue if ignored for too long.",
      ],
    });
  }

  // Fallback
  return buildResponse({
    title: "Possible Issue: More Information Needed",
    confidence: "Low to Medium",
    summary: `I can help, but the symptom description is still too broad${vehicleLine ? ` for your ${vehicleLine}` : ""} to give a strong diagnosis yet.`,
    why: "Vehicle problems are much easier to narrow down when we know exactly what the car is doing, when it happens, and whether any warning lights are on.",
    firstCheck:
      "Try describing the symptom with more detail, such as noise type, warning lights, smell, whether the engine starts, when it happens, and whether the issue is getting worse.",
    tools: [
      {
        name: "Flashlight",
        description: "Useful for a basic visual inspection.",
      },
      {
        name: "Phone camera",
        description: "A short video or sound recording can help identify a noise more accurately.",
      },
      {
        name: "OBD2 scanner",
        description: "Helpful if a warning light is on.",
      },
    ],
    difficulty: "Beginner",
    safety:
      "If you smell fuel, see smoke, hear grinding, notice overheating, or the brakes feel unsafe, do not keep driving the vehicle.",
    steps: [
      "Describe what the vehicle is doing.",
      "Say when it happens: cold start, idle, driving, braking, turning, or accelerating.",
      "Mention any warning lights on the dashboard.",
      "Mention any smells, leaks, smoke, or recent repairs.",
      "Add whether the problem happened suddenly or got worse over time.",
    ],
    parts: ["Unknown until symptom is narrowed down"],
    videos: [
      "How to describe car symptoms clearly",
      "How to use an OBD2 scanner for beginners",
    ],
    whenToStop:
      "If the issue affects braking, steering, overheating, or severe engine performance, have the vehicle inspected before driving further.",
    extraNotes: [
      vin ? `VIN entered: ${vin}` : "No VIN entered.",
      "The more detail the user gives, the more accurate the diagnosis can become.",
    ],
  });
}

app.post("/diagnose", (req, res) => {
  try {
    const {
      symptoms = "",
      year = "",
      make = "",
      model = "",
      engine = "",
      vin = "",
    } = req.body || {};

    const diagnosis = getDetailedDiagnosis(symptoms, {
      year,
      make,
      model,
      engine,
      vin,
    });

    return res.status(200).json(diagnosis);
  } catch (error) {
    console.error("Diagnosis error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while analyzing the symptoms.",
    });
  }
});

app.get("/", (req, res) => {
  res.send("Mechanic diagnosis API is running.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
