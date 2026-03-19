const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

function normalizeText(value) {
  return (value || "").toString().trim().toLowerCase();
}

function includesAny(text, keywords) {
  return keywords.some((word) => text.includes(word));
}

function makeGoogleSearchLink(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function makeYouTubeSearchLink(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function buildPartLinks(parts, vehicleLine = "") {
  return parts.map((part) => {
    const searchTerm = vehicleLine ? `${vehicleLine} ${part}` : part;

    return {
      name: part,
      google: makeGoogleSearchLink(searchTerm),
      amazon: makeGoogleSearchLink(`${searchTerm} site:amazon.com`),
      autozone: makeGoogleSearchLink(`${searchTerm} site:autozone.com`),
      rockauto: makeGoogleSearchLink(`${searchTerm} site:rockauto.com`),
    };
  });
}

function buildVideoLinks(videoTopics, vehicleLine = "") {
  return videoTopics.map((topic) => {
    const searchTerm = vehicleLine ? `${vehicleLine} ${topic}` : topic;

    return {
      title: topic,
      youtube: makeYouTubeSearchLink(searchTerm),
    };
  });
}

function buildFollowUpQuestions(category) {
  const map = {
    battery: [
      "When you turn the key, do you hear rapid clicking, one click, or nothing at all?",
      "Do the headlights look dim or normal before you try to start it?",
      "Has the battery needed a jump recently?",
      "Did the battery warning light come on while driving?",
    ],
    cooling: [
      "Does it overheat more at idle, in traffic, or at highway speed?",
      "Do you see coolant on the ground or smell coolant after driving?",
      "Does the radiator fan come on when the engine gets hot?",
      "Have you had to add coolant recently?",
    ],
    brakes: [
      "Is the noise a squeak, grind, scrape, or thump?",
      "Does it happen only when braking, or also while driving normally?",
      "Does the brake pedal feel soft, low, or normal?",
      "Does the vehicle pull to one side when braking?",
    ],
    misfire: [
      "Is the check engine light on or flashing?",
      "Does the shaking happen mostly at idle, during acceleration, or all the time?",
      "Has fuel mileage gotten worse recently?",
      "Did this start suddenly or get worse over time?",
    ],
    suspension: [
      "Does the noise happen over bumps, while turning, or while braking?",
      "Is the sound more of a clunk, hum, grind, or rattle?",
      "Does the steering feel loose or normal?",
      "Does the sound change with speed?",
    ],
    general: [
      "When exactly does the problem happen: at startup, idle, driving, braking, or turning?",
      "Are any warning lights on?",
      "Did the problem begin suddenly or slowly get worse?",
      "Have any parts been replaced recently?",
    ],
  };

  return map[category] || map.general;
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
  mechanicIntro,
  mechanicClosing,
  followUpQuestions = [],
  vehicleLine = "",
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
      partLinks: buildPartLinks(parts, vehicleLine),
      videos,
      videoLinks: buildVideoLinks(videos, vehicleLine),
      whenToStop,
      extraNotes,
      mechanicIntro,
      mechanicClosing,
      followUpQuestions,
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
  const vehicleLabel = vehicleLine ? ` on your ${vehicleLine}` : "";

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
    const likelyAlternator = includesAny(text, [
      "battery light",
      "dies while driving",
      "keeps needing jump",
      "after jump",
    ]);

    return buildResponse({
      title: likelyAlternator
        ? "Most Likely Issue: Charging System Problem"
        : "Most Likely Issue: Weak Battery or Poor Battery Connection",
      confidence: likelyAlternator ? "High" : "Medium-High",
      mechanicIntro: `Alright, let’s check this together${vehicleLabel}. Based on what you described, this sounds most like a battery or charging-system problem.`,
      summary: likelyAlternator
        ? `The charging system is one of the strongest suspects here. That usually means the battery is not being charged correctly while the engine is running.`
        : `The most likely issue is a weak battery, loose battery terminal, or corroded battery connection.`,
      why: likelyAlternator
        ? "When a vehicle starts after a jump but later dies again, or the battery light comes on, that often points toward the alternator, battery cables, or charging circuit."
        : "A clicking sound, slow cranking, or no crank at all usually happens when battery voltage is too low or the battery terminals are dirty or loose.",
      firstCheck:
        "First, check both battery terminals. Make sure they are tight, clean, and free of white or green corrosion. After that, think about the age of the battery. If it is several years old, it may simply be worn out.",
      tools: [
        {
          name: "10mm wrench or socket",
          description: "This is commonly used to loosen and tighten battery terminal clamps.",
        },
        {
          name: "Battery terminal cleaning brush",
          description: "Use this to clean corrosion off the terminals and cable ends.",
        },
        {
          name: "Flashlight",
          description: "Helps you clearly see corrosion, loose cables, cracks, or swelling.",
        },
        {
          name: "Gloves",
          description: "Good protection for your hands while handling dirty or corroded parts.",
        },
        {
          name: "Multimeter",
          description: "Best tool for checking battery voltage and alternator charging voltage.",
        },
      ],
      difficulty: "Beginner to Intermediate",
      safety:
        "Do not let a metal tool touch both battery terminals at the same time. If the battery is swollen, leaking, or cracked, stop and do not continue.",
      steps: [
        "Turn the vehicle off completely and remove the key.",
        "Open the hood and find the battery.",
        "Look closely at both terminals for corrosion, looseness, or damaged cables.",
        "If you see corrosion, disconnect the negative terminal first, then the positive terminal.",
        "Clean the terminals and cable ends until the metal contact surfaces are clean.",
        "Reconnect the positive terminal first, then the negative terminal, and tighten them securely.",
        "If you have a multimeter, check battery voltage with the engine off. Around 12.6 volts usually means a fully charged battery.",
        "Start the engine and check charging voltage. Around 13.5 to 14.8 volts usually means the alternator is charging correctly.",
        "If the battery keeps dying or charging voltage stays low, the alternator, battery, or cables may need replacement.",
      ],
      parts: [
        "Battery",
        "Battery terminal ends",
        "Battery cables",
        "Alternator",
        "Serpentine belt",
      ],
      videos: [
        "how to clean battery terminals safely",
        "how to test a car battery with a multimeter",
        "how to test an alternator charging system",
      ],
      whenToStop:
        "Stop and call a mechanic if the battery is leaking, the cables are badly damaged, the vehicle dies while driving, or you are not comfortable working around electrical components.",
      extraNotes: [
        vin ? `VIN entered: ${vin}` : "No VIN entered.",
        "Before buying parts, test voltage first. That can save you from replacing the wrong part.",
      ],
      mechanicClosing:
        "If you want the fastest path, start with the battery terminals and a voltage test before spending money on parts.",
      followUpQuestions: buildFollowUpQuestions("battery"),
      vehicleLine,
    });
  }

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
      mechanicIntro: `Alright, let’s slow this down and check it safely${vehicleLabel}. This sounds like a cooling-system issue.`,
      summary:
        "This may be caused by low coolant, a stuck thermostat, a radiator fan problem, a bad cap, or a leak somewhere in the cooling system.",
      why: "An overheating engine usually means heat is not leaving the engine correctly. That can happen when coolant is low, circulation is poor, airflow is weak, or the system cannot hold pressure.",
      firstCheck:
        "Let the engine cool completely before touching anything. Then check the coolant level in the overflow reservoir and look underneath for signs of a leak.",
      tools: [
        {
          name: "Flashlight",
          description: "Useful for checking hoses, clamps, the radiator area, and leak spots.",
        },
        {
          name: "Gloves",
          description: "Protects your hands from hot surfaces and coolant residue.",
        },
        {
          name: "Coolant funnel",
          description: "Makes it easier to add coolant cleanly and safely.",
        },
        {
          name: "Pliers",
          description: "Helpful for certain hose clamps if inspection is needed.",
        },
        {
          name: "OBD2 scanner",
          description: "Can help verify engine temperature and fan operation if supported.",
        },
      ],
      difficulty: "Beginner to Intermediate",
      safety:
        "Never remove the radiator cap while the engine is hot. Hot coolant can spray out and cause serious burns.",
      steps: [
        "Park the vehicle and let the engine cool fully.",
        "Check the coolant level in the overflow bottle.",
        "Inspect the ground under the vehicle for coolant leaks.",
        "Look at radiator hoses for cracks, swelling, or wet spots.",
        "Start the engine and watch the temperature gauge.",
        "When the engine warms up, see whether the radiator fan turns on.",
        "If the fan does not come on, the fan motor, relay, temperature sensor, or wiring may be the issue.",
        "If coolant is low, add the correct coolant and keep watching for a leak.",
        "If the engine still overheats, the thermostat, water pump, radiator, or a more serious engine problem may need professional inspection.",
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
        "how to check coolant level safely",
        "how to diagnose an overheating engine",
        "how to test if a thermostat is stuck",
      ],
      whenToStop:
        "Stop immediately if you see steam, the gauge reaches the red zone, or coolant is spraying or pouring out.",
      extraNotes: [
        "If it overheats mainly at idle, the radiator fan becomes a stronger suspect.",
        "If it overheats more at highway speed, coolant flow or restriction becomes more likely.",
      ],
      mechanicClosing:
        "The safest first move here is always: let it cool, check coolant level, and look for leaks before driving farther.",
      followUpQuestions: buildFollowUpQuestions("cooling"),
      vehicleLine,
    });
  }

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
      mechanicIntro: `Alright, let’s be careful with this one${vehicleLabel}. Brake problems should always be treated seriously.`,
      summary:
        "This may be worn brake pads, damaged rotors, low brake fluid, or sticking caliper hardware.",
      why: "Squealing often points to wear indicators. Grinding can mean the pads are worn down too far. A soft pedal can point to low fluid, air in the system, or a hydraulic leak.",
      firstCheck:
        "Start by checking brake fluid level, and pay attention to when the noise happens: only while braking, or also while driving.",
      tools: [
        {
          name: "Lug wrench",
          description: "Used to remove the wheel if you inspect the brakes directly.",
        },
        {
          name: "Jack and jack stands",
          description: "Needed to raise and support the vehicle safely.",
        },
        {
          name: "Flashlight",
          description: "Helps you inspect pad thickness, leaks, and rotor condition.",
        },
        {
          name: "Brake cleaner",
          description: "Useful for cleaning brake dust during inspection.",
        },
        {
          name: "C-clamp or brake piston tool",
          description: "Used if you are compressing the caliper piston during brake work.",
        },
      ],
      difficulty: "Intermediate",
      safety:
        "Do not drive the vehicle if the brakes grind badly, the pedal feels unsafe, or stopping distance has increased.",
      steps: [
        "Check brake fluid level in the reservoir.",
        "Notice whether the sound happens only while braking or even when coasting.",
        "Inspect the wheel area for heavy brake dust or signs of fluid leakage.",
        "If safe and if you know how, remove the wheel and inspect pad thickness.",
        "Check for thin pads, deep rotor grooves, uneven wear, or sticking hardware.",
        "Replace brake parts in pairs on the same axle whenever needed.",
        "If the pedal feels soft, inspect for leaks and consider brake bleeding if appropriate.",
      ],
      parts: [
        "Brake pads",
        "Brake rotors",
        "Brake fluid",
        "Caliper slide pins",
        "Brake hardware kit",
      ],
      videos: [
        "how to inspect brake pads and rotors",
        "difference between squeaking and grinding brakes",
        "how to check brake fluid safely",
      ],
      whenToStop:
        "Stop and get professional help if the pedal sinks, fluid is leaking, the vehicle pulls hard, or you hear metal-on-metal grinding.",
      extraNotes: [
        "Brake noises often get more expensive if ignored. Early inspection matters.",
      ],
      mechanicClosing:
        "With brakes, the smartest move is to inspect early. Waiting usually turns a small repair into a bigger one.",
      followUpQuestions: buildFollowUpQuestions("brakes"),
      vehicleLine,
    });
  }

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
      mechanicIntro: `Alright, let’s narrow this down${vehicleLabel}. This sounds like a misfire or fuel-and-air delivery issue.`,
      summary:
        "The engine may be misfiring because of worn spark plugs, a weak ignition coil, a vacuum leak, or a fuel delivery problem.",
      why: "When the engine shakes, hesitates, or idles rough, one or more cylinders may not be burning fuel correctly.",
      firstCheck:
        "Start by checking whether the check engine light is on. If it is, read the trouble codes before replacing any parts.",
      tools: [
        {
          name: "OBD2 scanner",
          description: "This is the best first tool if the check engine light is on.",
        },
        {
          name: "Spark plug socket",
          description: "Used to remove and inspect spark plugs.",
        },
        {
          name: "Ratchet and extension",
          description: "Helps you reach ignition coils and plugs.",
        },
        {
          name: "Flashlight",
          description: "Useful for spotting cracked hoses or unplugged connectors.",
        },
        {
          name: "Mechanic gloves",
          description: "Protects your hands while working around a warm engine bay.",
        },
      ],
      difficulty: "Intermediate",
      safety:
        "Do not continue driving if the check engine light is flashing. That can mean an active misfire that may damage the catalytic converter.",
      steps: [
        "Check whether the check engine light is on or flashing.",
        "Use an OBD2 scanner to read codes if available.",
        "Inspect ignition coil connectors and vacuum hoses for damage or looseness.",
        "Think about when spark plugs were last replaced.",
        "If a code points to a specific cylinder, inspect that coil and spark plug first.",
        "Look for signs of oil around plug wells or intake hose damage.",
        "If the issue remains unclear, fuel pressure or injector testing may be needed.",
      ],
      parts: [
        "Spark plugs",
        "Ignition coil",
        "Air filter",
        "Vacuum hose",
        "Fuel injector",
      ],
      videos: [
        "how to diagnose a rough idle",
        "how to read check engine codes with an OBD2 scanner",
        "how to inspect spark plugs and ignition coils",
      ],
      whenToStop:
        "Stop and get help if the engine shakes violently, stalls repeatedly, loses major power, or the warning light flashes.",
      extraNotes: [
        "Reading codes first can save time and prevent buying parts you do not need.",
      ],
      mechanicClosing:
        "The smartest first move here is not guessing. Pull the codes first, then let the symptoms and code point you in the right direction.",
      followUpQuestions: buildFollowUpQuestions("misfire"),
      vehicleLine,
    });
  }

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
      mechanicIntro: `Alright, let’s listen closely to when the noise happens${vehicleLabel}. That usually tells us where to look first.`,
      summary:
        "The noise may be coming from a worn suspension part, steering component, or wheel bearing.",
      why: "Clunking over bumps can point to sway bar links, ball joints, or bushings. A humming noise that changes with speed can point to a wheel bearing.",
      firstCheck:
        "Pay attention to exactly when the sound happens: over bumps, while turning, while braking, or only at certain speeds.",
      tools: [
        {
          name: "Flashlight",
          description: "Useful for inspecting boots, bushings, and visibly loose parts.",
        },
        {
          name: "Jack and jack stands",
          description: "Needed for safely checking wheel play and suspension parts.",
        },
        {
          name: "Pry bar",
          description: "Helps check for looseness in joints and bushings.",
        },
        {
          name: "Lug wrench",
          description: "Used to remove the wheel if deeper inspection is needed.",
        },
      ],
      difficulty: "Intermediate",
      safety:
        "Do not continue driving if steering feels loose, the vehicle wanders, or a wheel bearing is making loud grinding noise.",
      steps: [
        "Drive slowly in a safe area and pay attention to when the sound appears.",
        "Inspect tires for uneven wear.",
        "Look under the vehicle for visibly loose or damaged parts.",
        "Raise the suspected corner safely and check for wheel play.",
        "Inspect sway bar links, ball joints, tie rod ends, and control arm bushings.",
        "If the humming changes while turning left or right, inspect the wheel bearings closely.",
      ],
      parts: [
        "Sway bar link",
        "Ball joint",
        "Tie rod end",
        "Control arm",
        "Wheel bearing hub assembly",
      ],
      videos: [
        "how to diagnose a front end clunk",
        "how to check wheel bearing play",
        "how to inspect suspension components safely",
      ],
      whenToStop:
        "Stop and get professional help if steering becomes unpredictable, a wheel has major play, or you see a cracked or separated suspension part.",
      extraNotes: [
        "Small suspension noises can turn into safety problems if ignored too long.",
      ],
      mechanicClosing:
        "The key with noises like this is not just what it sounds like, but exactly when it happens.",
      followUpQuestions: buildFollowUpQuestions("suspension"),
      vehicleLine,
    });
  }

  return buildResponse({
    title: "Possible Issue: More Information Needed",
    confidence: "Low to Medium",
    mechanicIntro: `Alright, I can help, but I need a little more detail${vehicleLabel} before I can narrow this down properly.`,
    summary:
      "The symptom description is still a little too broad to give you a strong diagnosis yet.",
    why: "Vehicle problems are much easier to narrow down when we know what the vehicle is doing, when it happens, and whether any warning lights or leaks are involved.",
    firstCheck:
      "Try describing the symptom in more detail: sound, smell, warning lights, whether it starts, and when it happens.",
    tools: [
      {
        name: "Flashlight",
        description: "Useful for a basic under-hood or under-vehicle inspection.",
      },
      {
        name: "Phone camera",
        description: "A short video or sound clip can help identify a problem more accurately.",
      },
      {
        name: "OBD2 scanner",
        description: "Very helpful if any warning light is on.",
      },
    ],
    difficulty: "Beginner",
    safety:
      "If you smell fuel, see smoke, notice overheating, hear grinding, or the brakes feel unsafe, do not keep driving.",
    steps: [
      "Describe exactly what the vehicle is doing.",
      "Say when it happens: startup, idle, driving, braking, turning, or accelerating.",
      "Mention any dashboard warning lights.",
      "Mention any smoke, smells, leaks, or recent repairs.",
      "Say whether the problem started suddenly or got worse over time.",
    ],
    parts: ["Unknown until the symptom is narrowed down"],
    videos: [
      "how to describe car symptoms clearly",
      "how to use an OBD2 scanner for beginners",
    ],
    whenToStop:
      "If the issue affects braking, steering, overheating, or severe engine performance, have the vehicle checked before driving farther.",
    extraNotes: [
      vin ? `VIN entered: ${vin}` : "No VIN entered.",
      "The more detail you give, the more accurate the diagnosis becomes.",
    ],
    mechanicClosing:
      "Give me a little more detail and I can help narrow this down much better.",
    followUpQuestions: buildFollowUpQuestions("general"),
    vehicleLine,
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
