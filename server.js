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

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "FixPilot backend running" });
});

async function decodeVIN(vin) {
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${encodeURIComponent(vin)}?format=json`
    );
    const data = await response.json();
    return data?.Results?.[0] || null;
  } catch (error) {
    return null;
  }
}

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

function makeVideoResults(searchTerm) {
  return [
    {
      title: `YouTube results for ${searchTerm}`,
      source: "YouTube Search",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`
    },
    {
      title: `${searchTerm} repair walkthrough`,
      source: "YouTube Search",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm + " repair walkthrough")}`
    },
    {
      title: `${searchTerm} DIY fix`,
      source: "YouTube Search",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm + " DIY fix")}`
    }
  ];
}

function buildDefaultResult(vehicleLabel, vin, decoded) {
  return {
    vehicle: vehicleLabel,
    vin: vin || "",
    decodedVIN: decoded
      ? {
          year: decoded?.ModelYear || "",
          make: decoded?.Make || "",
          model: decoded?.Model || "",
          engine: decoded?.EngineModel || decoded?.DisplacementL || "",
          trim: decoded?.Trim || "",
          bodyClass: decoded?.BodyClass || ""
        }
      : null,
    title: "Let’s take a look together",
    mechanicIntro: `Alright — let’s walk through this step by step on ${vehicleLabel}. I’ll keep it simple and we’ll check the easy things first.`,
    likelyIssue: `The problem on ${vehicleLabel} needs a closer look before we can be more certain.`,
    likelyCauses: [
      "A loose, worn, or damaged part",
      "A fluid, battery, or electrical issue",
      "A maintenance problem that has gotten worse over time"
    ],
    steps: [
      {
        title: "Step 1: Start with a quick visual check",
        instruction: "Open the hood or look around the problem area and just look carefully before touching anything.",
        whatToLookFor: "Loose wires, broken plastic, wet spots, smoke, strong smells, or anything hanging where it should not be.",
        whatItMeans: "If you see obvious damage right away, that gives us a better starting point and may explain the problem quickly."
      },
      {
        title: "Step 2: Think about when the problem happens",
        instruction: "Ask yourself when this issue shows up.",
        whatToLookFor: "Does it happen only when starting, only while driving, only when braking, or only after the engine warms up?",
        whatItMeans: "When the problem happens often points us toward the correct system."
      },
      {
        title: "Step 3: Check the easy basics",
        instruction: "Check battery condition, fluid levels, and warning lights before replacing anything.",
        whatToLookFor: "Low fluids, warning messages, dim lights, or weak cranking.",
        whatItMeans: "Simple checks often explain the issue without extra work or expense."
      }
    ],
    partsNeeded: [
      "No exact parts identified yet",
      "Basic diagnostic supplies may still be needed"
    ],
    tools: [
      {
        name: "Flashlight",
        desc: "Helps you see dark areas under the hood or around the vehicle."
      },
      {
        name: "Socket and wrench set",
        desc: "Used for loosening or tightening common bolts, terminals, and brackets."
      },
      {
        name: "Multimeter",
        desc: "Helps check battery voltage and basic electrical problems."
      }
    ],
    difficulty: "Moderate",
    getHelpIf: "Stop and get professional help if you see smoke, fuel leaks, major coolant leaks, strong burning smells, or anything that feels unsafe.",
    safety: "Make sure the vehicle is off, in park, and cooled down before touching parts. Never crawl under a vehicle unless it is properly supported.",
    stores: makeStoreResults(`${vehicleLabel} vehicle diagnostic tools`),
    videos: makeVideoResults(`${vehicleLabel} vehicle diagnostic basics`)
  };
}

app.post("/diagnose", async (req, res) => {
  const { problem, year, make, model, vin } = req.body ?? {};

  if (!problem || typeof problem !== "string") {
    return res.status(400).json({ error: "Please describe the problem first." });
  }

  const lower = problem.toLowerCase();

  let decoded = null;
  if (vin && typeof vin === "string" && vin.trim().length >= 10) {
    decoded = await decodeVIN(vin.trim());
  }

  const decodedYear = decoded?.ModelYear || "";
  const decodedMake = decoded?.Make || "";
  const decodedModel = decoded?.Model || "";
  const decodedEngine = decoded?.EngineModel || decoded?.DisplacementL || "";

  const vehicleLabel =
    decoded && (decodedYear || decodedMake || decodedModel)
      ? `${decodedYear} ${decodedMake} ${decodedModel}${decodedEngine ? ` (${decodedEngine})` : ""}`.trim()
      : [year, make, model].filter(Boolean).join(" ").trim() || "your vehicle";

  let result = buildDefaultResult(vehicleLabel, vin, decoded);

  if (lower.includes("won't start") || lower.includes("wont start") || lower.includes("no start")) {
    result = {
      ...result,
      title: "Let’s figure out why it won’t start",
      mechanicIntro: `Okay — if ${vehicleLabel} will not start, don’t panic. We’re going to check the easy things first, one step at a time.`,
      likelyIssue: `The most likely causes on ${vehicleLabel} are a weak battery, bad battery connection, starter problem, or a fuel/ignition issue.`,
      likelyCauses: [
        "Weak or discharged battery",
        "Loose or corroded battery terminals",
        "Starter motor or starter relay problem",
        "Fuel delivery or ignition problem"
      ],
      steps: [
        {
          title: "Step 1: Look at the battery first",
          instruction: "Open the hood and find the battery. Do not remove anything yet. Just look closely.",
          whatToLookFor: "White or blue crust on the terminals, loose cable ends, cracked battery case, or anything wet around the battery.",
          whatItMeans: "Dirty or loose battery connections can stop the vehicle from starting even if the battery itself is still okay."
        },
        {
          title: "Step 2: Try starting it and listen carefully",
          instruction: "Sit in the driver seat and try to start the vehicle while listening closely.",
          whatToLookFor: "A single click, many rapid clicks, slow cranking, or no sound at all.",
          whatItMeans: "Rapid clicking usually points to a weak battery. One click may point to the starter. No sound at all can mean a connection, relay, or electrical issue."
        },
        {
          title: "Step 3: Check battery strength",
          instruction: "Use a battery tester or a multimeter if you have one. If not, try a safe jump start.",
          whatToLookFor: "If the vehicle starts with a jump, or if voltage is very low, that is important.",
          whatItMeans: "If it starts with a jump, the battery is weak, discharged, or not being charged correctly."
        },
        {
          title: "Step 4: Check what happens after it starts",
          instruction: "If it starts, let it idle and watch the dash.",
          whatToLookFor: "Battery light on the dash, dim lights, or rough electrical behavior.",
          whatItMeans: "That can mean the charging system is not keeping the battery charged."
        }
      ],
      partsNeeded: [
        "Battery terminal cleaning supplies",
        "Replacement battery if testing shows the battery is bad",
        "Starter relay or starter if confirmed faulty"
      ],
      tools: [
        {
          name: "Flashlight",
          desc: "Helps you clearly see the battery, cables, and starter connections."
        },
        {
          name: "Wrench or socket set",
          desc: "Used to tighten or remove battery terminal connections safely."
        },
        {
          name: "Battery tester or multimeter",
          desc: "Checks if the battery has enough voltage and helps confirm whether it is weak."
        },
        {
          name: "Wire brush or battery terminal cleaner",
          desc: "Removes corrosion from the battery terminals so the connection is cleaner and stronger."
        }
      ],
      difficulty: "Moderate",
      getHelpIf: "Get professional help if the vehicle still will not start after battery support, if cables get hot, or if wiring looks burned or damaged.",
      safety: "Keep the vehicle in park, keep hands away from moving belts and fans, and never let tools touch both battery terminals at the same time.",
      stores: makeStoreResults(`${vehicleLabel} battery starter relay battery terminals`),
      videos: makeVideoResults(`${vehicleLabel} wont start battery starter diagnosis`)
    };
  } else if (lower.includes("brake")) {
    result = {
      ...result,
      title: "Let’s check your brakes",
      mechanicIntro: `Alright — brake problems matter, so we’ll go slowly and keep this safe while we figure out what ${vehicleLabel} is trying to tell us.`,
      likelyIssue: `The most likely causes on ${vehicleLabel} are worn brake pads, rotor wear, or low brake fluid.`,
      likelyCauses: [
        "Worn brake pads",
        "Scored or warped rotors",
        "Low brake fluid",
        "Brake hardware or caliper problem"
      ],
      steps: [
        {
          title: "Step 1: Pay attention to the sound",
          instruction: "Drive very slowly in a safe place and press the brakes gently.",
          whatToLookFor: "Squealing, grinding, scraping, or a weak brake pedal.",
          whatItMeans: "Squealing often means worn pads. Grinding can mean the pads are very worn and metal may be contacting the rotor."
        },
        {
          title: "Step 2: Check the brake fluid under the hood",
          instruction: "Open the hood and find the brake fluid reservoir. It is usually near the back of the engine bay on the driver side.",
          whatToLookFor: "Fluid level below the minimum line.",
          whatItMeans: "Low fluid can happen when pads are worn, or it may point to a leak if it is very low."
        },
        {
          title: "Step 3: Look through the wheel if possible",
          instruction: "Use a flashlight and look through the wheel openings toward the brakes.",
          whatToLookFor: "Very thin brake pad material, deep grooves on the rotor, or wetness around the brake assembly.",
          whatItMeans: "Thin pads mean replacement is near. Wetness can mean a leak, which is more serious."
        },
        {
          title: "Step 4: Decide if it is safe to keep driving",
          instruction: "Think about how the pedal feels and how well the vehicle stops.",
          whatToLookFor: "Soft pedal, long stopping distance, or strong pulling to one side.",
          whatItMeans: "Those are signs you should stop and get professional help sooner rather than later."
        }
      ],
      partsNeeded: [
        "Brake pads",
        "Brake rotors if badly worn or damaged",
        "Brake fluid if low and no major leak is found"
      ],
      tools: [
        {
          name: "Flashlight",
          desc: "Helps you inspect the brake area through the wheel and look for leaks or wear."
        },
        {
          name: "Lug wrench",
          desc: "Used to loosen and remove the wheel if you need a closer inspection."
        },
        {
          name: "Floor jack",
          desc: "Lifts the vehicle so the wheel can be removed."
        },
        {
          name: "Jack stands",
          desc: "Safely support the vehicle after lifting. Never rely on the jack alone."
        },
        {
          name: "C-clamp or brake piston tool",
          desc: "Used later if brake pads are replaced and the caliper piston needs to be pushed back in."
        }
      ],
      difficulty: "Moderate",
      getHelpIf: "Get professional help immediately if the brake pedal feels unsafe, goes toward the floor, or the vehicle does not stop normally.",
      safety: "Never work under a vehicle unless it is properly supported, and never drive if braking feels unsafe.",
      stores: makeStoreResults(`${vehicleLabel} brake pads brake rotors brake fluid`),
      videos: makeVideoResults(`${vehicleLabel} brake pad rotor replacement`)
    };
  } else if (lower.includes("overheat") || lower.includes("hot") || lower.includes("coolant")) {
    result = {
      ...result,
      title: "Let’s check why it’s overheating",
      mechanicIntro: `Okay — overheating can damage an engine fast, so let’s keep this simple and safe while we check ${vehicleLabel}.`,
      likelyIssue: `The most likely causes on ${vehicleLabel} are low coolant, a hose leak, thermostat trouble, or a cooling fan issue.`,
      likelyCauses: [
        "Coolant leak from a hose, radiator, or fitting",
        "Stuck thermostat",
        "Cooling fan not working correctly",
        "Coolant level too low"
      ],
      steps: [
        {
          title: "Step 1: Let it cool down completely",
          instruction: "Turn the vehicle off and wait before opening anything in the cooling system.",
          whatToLookFor: "Do not remove the radiator cap while the engine is hot.",
          whatItMeans: "Opening it hot can cause serious burns from hot coolant and pressure."
        },
        {
          title: "Step 2: Check coolant level",
          instruction: "Once the engine is cool, look at the coolant reservoir.",
          whatToLookFor: "A level below the minimum line or an empty tank.",
          whatItMeans: "Low coolant often means there is a leak somewhere, even if you do not see it right away."
        },
        {
          title: "Step 3: Look for signs of leaking",
          instruction: "Use a flashlight and inspect the radiator, hose connections, and the ground under the vehicle.",
          whatToLookFor: "Wet spots, dried coolant residue, or colored fluid under the vehicle.",
          whatItMeans: "Those signs help show where coolant is escaping."
        },
        {
          title: "Step 4: Think about what happened before it got hot",
          instruction: "Ask yourself whether it overheats while idling, while driving, or all the time.",
          whatToLookFor: "Only overheating at idle can point toward the fan. Overheating all the time can point to low coolant or thermostat trouble.",
          whatItMeans: "When it overheats helps narrow down the real cause."
        }
      ],
      partsNeeded: [
        "Coolant",
        "Radiator hose if leaking",
        "Thermostat if confirmed faulty"
      ],
      tools: [
        {
          name: "Flashlight",
          desc: "Helps find coolant leaks around hoses, the radiator, and the engine bay."
        },
        {
          name: "Gloves",
          desc: "Protects your hands while checking hoses and coolant areas."
        },
        {
          name: "Coolant funnel",
          desc: "Helps refill coolant more cleanly and with less mess."
        },
        {
          name: "Pliers",
          desc: "Useful for some hose clamps if you need to inspect or replace a hose."
        }
      ],
      difficulty: "Moderate",
      getHelpIf: "Stop driving and get help if the temperature keeps climbing, steam is coming out, or coolant is pouring out quickly.",
      safety: "A hot cooling system can burn you badly. Let it cool before touching anything.",
      stores: makeStoreResults(`${vehicleLabel} coolant radiator hose thermostat`),
      videos: makeVideoResults(`${vehicleLabel} overheating coolant hose thermostat diagnosis`)
    };
  } else if (lower.includes("battery") || lower.includes("charge") || lower.includes("charging")) {
    result = {
      ...result,
      title: "Let’s check the battery and charging system",
      mechanicIntro: `Alright — if the battery on ${vehicleLabel} will not hold a charge, we need to figure out whether the battery is bad, the alternator is weak, or something is draining power.`,
      likelyIssue: `The most likely causes on ${vehicleLabel} are a weak battery, bad cable connection, charging problem, or electrical draw while parked.`,
      likelyCauses: [
        "Battery no longer holds a charge",
        "Alternator not charging properly",
        "Loose or corroded battery connections",
        "Electrical draw while the vehicle is off"
      ],
      steps: [
        {
          title: "Step 1: Look at the battery terminals",
          instruction: "Open the hood and inspect the battery connections first.",
          whatToLookFor: "Loose cable ends, white or blue corrosion, damaged cables, or cracked battery case.",
          whatItMeans: "A bad connection can prevent charging and starting even if the battery itself is still usable."
        },
        {
          title: "Step 2: Think about when the battery goes dead",
          instruction: "Ask yourself whether it dies after sitting, or while driving.",
          whatToLookFor: "Dead after sitting overnight, or battery light while driving.",
          whatItMeans: "Dead after sitting can mean battery age or an electrical draw. Trouble while driving can point to the alternator."
        },
        {
          title: "Step 3: Test battery voltage",
          instruction: "Use a multimeter or battery tester if you have one.",
          whatToLookFor: "Low voltage with engine off, or weak charging voltage with engine running.",
          whatItMeans: "Low voltage at rest can mean a weak battery. Low voltage while running can mean poor charging."
        },
        {
          title: "Step 4: Check for warning lights",
          instruction: "Start the vehicle if possible and look at the dash.",
          whatToLookFor: "Battery light, flickering lights, or dim headlights.",
          whatItMeans: "Those signs often suggest charging system trouble."
        }
      ],
      partsNeeded: [
        "Battery if testing shows it is bad",
        "Battery terminal cleaner",
        "Alternator if charging output is confirmed low"
      ],
      tools: [
        {
          name: "Multimeter",
          desc: "Measures battery voltage and helps check whether the alternator is charging."
        },
        {
          name: "Battery tester",
          desc: "Checks battery condition under load more clearly than a simple voltage reading."
        },
        {
          name: "Wrench set",
          desc: "Used to remove or tighten battery terminals and hold-down hardware."
        },
        {
          name: "Terminal cleaner or wire brush",
          desc: "Cleans corrosion off the battery posts and cable ends."
        }
      ],
      difficulty: "Moderate",
      getHelpIf: "Get professional help if charging voltage is unstable, cables are damaged, or the battery keeps dying after a confirmed good battery is installed.",
      safety: "Keep metal tools from touching both battery terminals at the same time.",
      stores: makeStoreResults(`${vehicleLabel} battery alternator battery terminal cleaner`),
      videos: makeVideoResults(`${vehicleLabel} battery alternator charging system diagnosis`)
    };
  } else if (lower.includes("air suspension") || lower.includes("suspension")) {
    result = {
      ...result,
      title: "Let’s check the suspension warning",
      mechanicIntro: `Okay — if ${vehicleLabel} has an air suspension warning or sits low, we want to check it carefully and safely.`,
      likelyIssue: `The most likely causes on ${vehicleLabel} are an air leak, ride-height sensor problem, weak compressor, or control fault.`,
      likelyCauses: [
        "Air spring or air line leak",
        "Ride-height sensor fault",
        "Weak or failed compressor",
        "Electrical or control module problem"
      ],
      steps: [
        {
          title: "Step 1: Look at the way the vehicle is sitting",
          instruction: "Park on a flat surface and stand back so you can see the whole vehicle.",
          whatToLookFor: "One corner lower than the others or the whole vehicle sitting unevenly.",
          whatItMeans: "That often points toward a leak or problem in that corner of the suspension."
        },
        {
          title: "Step 2: Listen for the compressor",
          instruction: "With the vehicle on, listen carefully near the air suspension compressor area.",
          whatToLookFor: "Compressor running a lot, running too long, or not running at all.",
          whatItMeans: "Running too much can mean an air leak. Not running at all can mean electrical or compressor trouble."
        },
        {
          title: "Step 3: Check for obvious air leaks",
          instruction: "If safely accessible, inspect lines and fittings with a flashlight.",
          whatToLookFor: "Broken air lines, loose fittings, or bubbling if you use soapy water on suspected leak points.",
          whatItMeans: "Bubbles usually show escaping air."
        },
        {
          title: "Step 4: Watch what happens over time",
          instruction: "Notice if the vehicle sinks while parked for a while.",
          whatToLookFor: "Vehicle lowering after sitting overnight.",
          whatItMeans: "That strongly suggests an air leak somewhere in the system."
        }
      ],
      partsNeeded: [
        "Air line or fitting if leaking",
        "Ride-height sensor if faulty",
        "Air compressor assembly if confirmed bad"
      ],
      tools: [
        {
          name: "Flashlight",
          desc: "Helps inspect lines, fittings, and suspension components."
        },
        {
          name: "Spray bottle with soapy water",
          desc: "Helps reveal air leaks by making bubbles where air escapes."
        },
        {
          name: "Basic socket and wrench set",
          desc: "Useful for removing covers and accessing components if needed."
        }
      ],
      difficulty: "Advanced",
      getHelpIf: "Get professional help if the vehicle sags badly, compressor runs constantly, or the suspension feels unsafe.",
      safety: "Never place yourself under a vehicle with unstable ride height unless it is properly supported.",
      stores: makeStoreResults(`${vehicleLabel} air suspension compressor ride height sensor air line fitting`),
      videos: makeVideoResults(`${vehicleLabel} air suspension compressor ride height sensor diagnosis`)
    };
  }

  res.json(result);
}
