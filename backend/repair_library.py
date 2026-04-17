import urllib.parse
import re


def _yt(query):
    return f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"


def _vendor_url(store, query):
    q = urllib.parse.quote(query)
    m = {
        "amazon": f"https://www.amazon.com/s?k={q}",
        "walmart": f"https://www.walmart.com/search?q={q}",
        "autozone": f"https://www.autozone.com/searchresult?searchText={q}",
        "advance": f"https://shop.advanceautoparts.com/find?searchTerm={q}",
        "oreilly": f"https://www.oreillyauto.com/search?q={q}",
        "rockauto": f"https://www.rockauto.com/en/partsearch/?partnum={q}",
    }
    return m.get(store.lower(), f"https://www.amazon.com/s?k={q}")


def _vendors(query, preferred=None):
    all_stores = ["Amazon", "Walmart", "AutoZone", "Advance Auto Parts", "O'Reilly Auto Parts", "RockAuto"]
    stores = preferred or all_stores
    return [{"name": s, "url": _vendor_url(s.lower().split()[0], query)} for s in stores]


def _tool(title, search_term=None, desc=""):
    st = search_term or title
    return {"title": title, "description": desc or "Recommended tool", "search_term": st,
            "url": _vendor_url("amazon", st), "vendors": _vendors(st, ["Amazon", "Walmart"])}


def _part(title, search_term=None, desc="", stores=None):
    st = search_term or title
    return {"title": title, "description": desc or "Recommended part", "search_term": st,
            "url": _vendor_url((stores or ["autozone"])[0].lower().split()[0], st),
            "vendors": _vendors(st, stores)}


def _video(title, query, desc=""):
    return {"title": title, "description": desc, "url": _yt(query)}


REPAIR_LIBRARY = [
    {
        "key": "radiator-leak", "title": "Radiator leak",
        "summary": "Coolant odor from the front of the vehicle, visible coolant loss, or dampness near the radiator usually points to a radiator leak, tank seam failure, or cracked cooling component.",
        "difficulty": "Moderate", "experience": "Intermediate",
        "keywords": ["radiator leak", "radiator leaking", "coolant leak", "smells like coolant", "coolant smell",
                      "front coolant leak", "coolant in front", "radiator is leaking", "radiator", "cooling system leak"],
        "aliases": ["leaking radiator", "radiator cracked", "radiator seam leak", "coolant dripping front"],
        "symptoms": ["smell of coolant", "coolant puddle under front", "temperature warning", "coolant level drops"],
        "inspection_steps": [
            "With the engine completely cool, inspect the radiator core, side tanks, and upper hose connections for wet spots or white residue.",
            "Pressure test the cooling system if available to confirm whether the radiator itself is leaking or if the leak is coming from a hose or fitting.",
            "Check for coolant collecting on the splash shield, front crossmember, or lower corners of the radiator.",
            "Confirm the leak source before buying parts because a hose leak, water pump leak, or reservoir leak can mimic a radiator failure.",
        ],
        "inspection_tools": [
            _tool("Cooling system pressure tester", "cooling system pressure tester kit", "Best way to verify the leak source before replacing parts"),
            _tool("Flashlight", "led inspection flashlight"),
            _tool("Mechanic gloves", "nitrile mechanic gloves", "Useful for safe visual inspection around coolant residue"),
            _tool("Drain pan", "automotive coolant drain pan", "Needed if coolant must be drained"),
        ],
        "related_videos": [
            _video("How to diagnose a radiator leak", "how to diagnose radiator leak cooling system", "Inspection-focused videos for confirming radiator failure"),
            _video("Cooling system pressure test walkthrough", "cooling system pressure test tutorial", "Learn how to confirm the leak source before replacing parts"),
        ],
        "diy": {
            "estimated_cost": {"min": 180, "max": 420},
            "tools": [
                _tool("Socket set", "mechanic socket set SAE metric"),
                _tool("Pliers", "hose clamp pliers"),
                _tool("Coolant funnel kit", "spill free coolant funnel kit", "Helpful for refilling and bleeding the cooling system"),
                _tool("Drain pan", "automotive coolant drain pan"),
            ],
            "parts": [
                _part("Replacement radiator", "replacement radiator exact fit vehicle radiator", "Main replacement part after confirming radiator failure", ["RockAuto", "AutoZone"]),
                _part("Coolant / antifreeze", "vehicle specific coolant antifreeze", "Use the correct coolant type for the vehicle", ["Walmart", "AutoZone", "O'Reilly Auto Parts"]),
                _part("Upper and lower radiator hose set", "radiator hose kit upper lower", "Recommended if hoses are old, swollen, or brittle", ["AutoZone", "Advance Auto Parts", "O'Reilly Auto Parts"]),
                _part("Radiator cap", "radiator cap replacement", "Low-cost upgrade if pressure retention is questionable", ["AutoZone", "Amazon"]),
            ],
            "repair_videos": [
                _video("Radiator replacement walkthrough", "radiator replacement step by step", "DIY replacement process"),
                _video("How to refill and bleed coolant", "how to bleed cooling system after radiator replacement", "Helpful after the repair is complete"),
            ],
        },
        "mechanic": {"estimated_cost": {"min": 350, "max": 900}},
    },
    {
        "key": "radiator-hose-leak", "title": "Radiator hose leak",
        "summary": "If coolant is leaking near the hose connections or along a swollen, split, or soft hose, the radiator hose or clamp may be the actual failure rather than the radiator itself.",
        "difficulty": "Easy to Moderate", "experience": "Beginner to Intermediate",
        "keywords": ["radiator hose leak", "leaking radiator hose", "coolant hose leak", "upper radiator hose leak", "lower radiator hose leak", "hose leaking coolant"],
        "aliases": ["coolant hose leaking", "bad hose clamp", "radiator hose split"],
        "symptoms": ["coolant leak near hose", "wet hose connection", "steam from hose area"],
        "inspection_steps": [
            "Inspect the upper and lower radiator hoses for swelling, cracking, or coolant tracks near the clamps.",
            "Check whether the hose itself is leaking or if the clamp has loosened.",
            "Look for seepage around thermostat housing and radiator neck connections.",
        ],
        "inspection_tools": [
            _tool("Flashlight", "led inspection flashlight"),
            _tool("Hose clamp pliers", "hose clamp pliers"),
            _tool("Mechanic gloves", "nitrile mechanic gloves"),
        ],
        "related_videos": [_video("How to find a radiator hose leak", "how to diagnose radiator hose leak", "Inspection videos focused on hose failures")],
        "diy": {
            "estimated_cost": {"min": 40, "max": 140},
            "tools": [_tool("Hose clamp pliers", "hose clamp pliers"), _tool("Drain pan", "automotive coolant drain pan"), _tool("Socket set", "mechanic socket set SAE metric")],
            "parts": [
                _part("Upper radiator hose", "upper radiator hose exact fit", "Replace if cracked, soft, or oil-soaked", ["AutoZone", "O'Reilly Auto Parts", "RockAuto"]),
                _part("Lower radiator hose", "lower radiator hose exact fit", "Replace if leaking or collapsing under load", ["AutoZone", "Advance Auto Parts", "RockAuto"]),
                _part("Replacement hose clamps", "radiator hose clamps", "Use fresh clamps if originals are weak or rusted", ["Amazon", "AutoZone"]),
                _part("Coolant / antifreeze", "vehicle specific coolant antifreeze", "Needed after hose replacement", ["Walmart", "AutoZone"]),
            ],
            "repair_videos": [_video("Radiator hose replacement", "radiator hose replacement tutorial", "DIY hose replacement guide")],
        },
        "mechanic": {"estimated_cost": {"min": 120, "max": 280}},
    },
    {
        "key": "thermostat-stuck", "title": "Faulty thermostat",
        "summary": "A stuck thermostat can cause overheating, poor heater performance, slow warm-up, or unstable temperature behavior depending on whether it is stuck closed or open.",
        "difficulty": "Moderate", "experience": "Intermediate",
        "keywords": ["thermostat", "bad thermostat", "stuck thermostat", "thermostat stuck open", "thermostat stuck closed", "overheating thermostat", "heater cold overheating", "p0300"],
        "aliases": ["faulty thermostat housing", "coolant thermostat issue"],
        "symptoms": ["overheating after startup", "temperature fluctuates", "poor heater output"],
        "inspection_steps": [
            "Watch coolant temperature behavior from cold start and confirm whether the upper radiator hose warms too early or not at all.",
            "Scan for temperature-related diagnostic codes if the vehicle supports it.",
            "Inspect the thermostat housing area for leaks before deciding whether the thermostat, housing, or another cooling component is the problem.",
        ],
        "inspection_tools": [_tool("OBD2 scanner", "obd2 scanner live data"), _tool("Infrared thermometer", "infrared thermometer automotive"), _tool("Flashlight", "led inspection flashlight")],
        "related_videos": [_video("How to test a thermostat", "how to test car thermostat", "Helps verify thermostat behavior before replacement")],
        "diy": {
            "estimated_cost": {"min": 45, "max": 180},
            "tools": [_tool("Socket set", "mechanic socket set SAE metric"), _tool("Torque wrench", "inch pound torque wrench"), _tool("Drain pan", "automotive coolant drain pan")],
            "parts": [
                _part("Thermostat", "engine thermostat exact fit", "Primary replacement part", ["RockAuto", "O'Reilly Auto Parts", "AutoZone"]),
                _part("Thermostat housing / gasket", "thermostat housing gasket exact fit", "Needed if housing must be resealed or replaced", ["AutoZone", "Advance Auto Parts", "RockAuto"]),
                _part("Coolant / antifreeze", "vehicle specific coolant antifreeze", "Needed after replacement", ["Walmart", "AutoZone"]),
            ],
            "repair_videos": [_video("Thermostat replacement guide", "thermostat replacement step by step", "DIY thermostat replacement walkthrough")],
        },
        "mechanic": {"estimated_cost": {"min": 180, "max": 420}},
    },
    {
        "key": "water-pump-failure", "title": "Water pump failure",
        "summary": "Coolant leakage near the pump area, noise from the front of the engine, wobble in the pulley, or repeated overheating can indicate a failing water pump.",
        "difficulty": "Advanced", "experience": "Intermediate to Advanced",
        "keywords": ["water pump", "bad water pump", "water pump leak", "water pump failing", "coolant leaking from water pump", "water pump noise"],
        "aliases": ["failing coolant pump", "pump bearing noise"],
        "symptoms": ["coolant leak front engine", "whining noise front engine", "overheats while driving"],
        "inspection_steps": [
            "Inspect the water pump area for coolant residue around the weep hole or mounting surface.",
            "Check for pulley wobble or bearing noise with the engine off and belt removed if appropriate.",
            "Rule out radiator, hose, and thermostat issues before replacing the water pump.",
        ],
        "inspection_tools": [_tool("Flashlight", "led inspection flashlight"), _tool("Mirror inspection tool", "telescoping inspection mirror"), _tool("OBD2 scanner", "obd2 scanner live data")],
        "related_videos": [_video("How to diagnose a bad water pump", "how to diagnose bad water pump", "Inspection guide before replacement")],
        "diy": {
            "estimated_cost": {"min": 95, "max": 320},
            "tools": [_tool("Socket set", "mechanic socket set SAE metric"), _tool("Torque wrench", "torque wrench"), _tool("Belt tool", "serpentine belt tool"), _tool("Drain pan", "automotive coolant drain pan")],
            "parts": [
                _part("Water pump", "water pump exact fit", "Primary replacement part", ["RockAuto", "AutoZone", "O'Reilly Auto Parts"]),
                _part("Water pump gasket / seal", "water pump gasket exact fit", "Replace seals during installation", ["AutoZone", "RockAuto"]),
                _part("Coolant / antifreeze", "vehicle specific coolant antifreeze", "Needed for refill", ["Walmart", "AutoZone"]),
            ],
            "repair_videos": [_video("Water pump replacement", "water pump replacement tutorial", "DIY water pump repair guide")],
        },
        "mechanic": {"estimated_cost": {"min": 350, "max": 900}},
    },
    {
        "key": "battery-or-charging-system", "title": "Battery or charging system issue",
        "summary": "Slow crank, clicking, electrical instability, battery warning lights, or repeated dead battery events usually point to a battery, alternator, connection, or charging system issue.",
        "difficulty": "Easy to Moderate", "experience": "Beginner to Intermediate",
        "keywords": ["battery issue", "bad battery", "alternator", "charging system", "battery light", "car wont start battery", "slow crank", "dead battery", "clicking no start"],
        "aliases": ["bad alternator", "charging fault", "weak battery"],
        "symptoms": ["vehicle does not start", "battery warning light", "flickering lights"],
        "inspection_steps": [
            "Check battery terminal tightness and look for corrosion or loose ground connections.",
            "Measure resting battery voltage and charging voltage if a multimeter is available.",
            "Confirm whether the issue is a weak battery, poor connection, or alternator output problem before replacing parts.",
        ],
        "inspection_tools": [_tool("Digital multimeter", "digital multimeter automotive"), _tool("Battery terminal brush", "battery terminal cleaning brush"), _tool("OBD2 scanner", "obd2 scanner")],
        "related_videos": [_video("How to test a battery and alternator", "how to test battery and alternator with multimeter", "Verification videos for charging system issues")],
        "diy": {
            "estimated_cost": {"min": 20, "max": 320},
            "tools": [_tool("Digital multimeter", "digital multimeter automotive"), _tool("Socket set", "mechanic socket set SAE metric"), _tool("Battery terminal cleaner", "battery terminal cleaner kit")],
            "parts": [
                _part("Replacement battery", "car battery exact fit group size", "Only replace after confirming battery failure", ["Walmart", "AutoZone", "Advance Auto Parts"]),
                _part("Battery terminal kit", "battery terminal kit", "Useful if terminals are damaged or corroded", ["Amazon", "AutoZone"]),
                _part("Alternator", "alternator exact fit", "For charging-system confirmed failures", ["RockAuto", "AutoZone", "O'Reilly Auto Parts"]),
            ],
            "repair_videos": [
                _video("Battery replacement guide", "car battery replacement tutorial", "DIY battery replacement guide"),
                _video("Alternator replacement guide", "alternator replacement tutorial", "DIY alternator replacement guide"),
            ],
        },
        "mechanic": {"estimated_cost": {"min": 90, "max": 650}},
    },
    {
        "key": "brake-pad-and-rotor-wear", "title": "Brake pad and rotor wear",
        "summary": "Squealing, grinding, vibration during braking, or poor stopping performance often means the pads are worn, the rotors are damaged, or both need service.",
        "difficulty": "Moderate", "experience": "Intermediate",
        "keywords": ["brakes squealing", "brakes grinding", "brake pads", "rotors", "brake vibration", "bad brakes", "front brakes", "rear brakes"],
        "aliases": ["worn brake pads", "warped rotors", "brake noise"],
        "symptoms": ["squealing brakes", "grinding noise", "brake shudder"],
        "inspection_steps": [
            "Inspect pad thickness through the caliper window if visible.",
            "Check rotor surfaces for grooves, hot spots, or a pronounced outer lip.",
            "Confirm whether the issue is pad wear only or if the rotors also need replacement.",
        ],
        "inspection_tools": [_tool("Flashlight", "led inspection flashlight"), _tool("Tire iron", "lug wrench"), _tool("Jack and jack stands", "3 ton jack and 6 ton jack stands")],
        "related_videos": [_video("How to inspect brake pads and rotors", "how to inspect brake pads and rotors", "Inspection-focused brake videos")],
        "diy": {
            "estimated_cost": {"min": 120, "max": 420},
            "tools": [_tool("Socket set", "mechanic socket set SAE metric"), _tool("Brake caliper tool", "brake caliper compression tool"), _tool("Torque wrench", "torque wrench"), _tool("Floor jack and jack stands", "3 ton floor jack and 6 ton jack stands")],
            "parts": [
                _part("Brake pad set", "ceramic brake pad set exact fit", "Replace worn pads with exact-fit set", ["RockAuto", "AutoZone", "O'Reilly Auto Parts"]),
                _part("Brake rotor set", "brake rotor exact fit", "Replace if rotors are worn, grooved, or warped", ["RockAuto", "AutoZone"]),
                _part("Brake cleaner", "brake cleaner spray", "Useful during installation", ["Amazon", "Walmart", "AutoZone"]),
            ],
            "repair_videos": [_video("Brake pad and rotor replacement", "brake pad and rotor replacement tutorial", "DIY brake service guide")],
        },
        "mechanic": {"estimated_cost": {"min": 280, "max": 850}},
    },
    {
        "key": "spark-plugs-and-ignition-misfire", "title": "Spark plug or ignition misfire",
        "summary": "Rough idle, engine shaking, misfire codes, reduced power, or flashing check-engine behavior can point to worn spark plugs, ignition coils, or a related ignition issue.",
        "difficulty": "Easy to Moderate", "experience": "Beginner to Intermediate",
        "keywords": ["misfire", "rough idle", "spark plugs", "coil pack", "ignition coil", "engine shaking", "check engine misfire", "p0300"],
        "aliases": ["bad spark plugs", "bad ignition coil", "engine misfire"],
        "symptoms": ["rough engine", "hesitation", "loss of power"],
        "inspection_steps": [
            "Scan for misfire codes and identify affected cylinders if possible.",
            "Inspect spark plug condition and coil connector security.",
            "Confirm whether the fault is from spark plugs, ignition coils, or another engine issue before replacing parts.",
        ],
        "inspection_tools": [_tool("OBD2 scanner", "obd2 scanner"), _tool("Spark plug socket", "spark plug socket set"), _tool("Flashlight", "led inspection flashlight")],
        "related_videos": [_video("How to diagnose an engine misfire", "how to diagnose engine misfire", "Verification and code-reading videos")],
        "diy": {
            "estimated_cost": {"min": 35, "max": 260},
            "tools": [_tool("Socket set", "mechanic socket set SAE metric"), _tool("Spark plug socket", "spark plug socket set"), _tool("Torque wrench", "inch pound torque wrench")],
            "parts": [
                _part("Spark plug set", "spark plugs exact fit iridium", "Replace worn or fouled plugs", ["RockAuto", "O'Reilly Auto Parts", "AutoZone"]),
                _part("Ignition coil", "ignition coil exact fit", "Replace only if confirmed faulty", ["RockAuto", "AutoZone", "Amazon"]),
            ],
            "repair_videos": [
                _video("Spark plug replacement", "spark plug replacement tutorial", "DIY spark plug service"),
                _video("Ignition coil replacement", "ignition coil replacement tutorial", "DIY coil replacement"),
            ],
        },
        "mechanic": {"estimated_cost": {"min": 140, "max": 520}},
    },
    {
        "key": "air-suspension-front-dropping", "title": "Front air suspension leak or valve issue",
        "summary": "If the front of the truck drops as a unit overnight, the likely causes include a leaking front air spring assembly, airline leak, valve block issue, or control problem affecting the front circuit.",
        "difficulty": "Advanced", "experience": "Intermediate to Advanced",
        "keywords": ["air suspension", "front lowers overnight", "front drops as a unit", "air suspension leak", "front air bag leak", "valve block", "ram air suspension", "suspension lowering overnight", "heard air escaping"],
        "aliases": ["front suspension leaking down", "front air springs leaking", "valve block leak"],
        "symptoms": ["front drops overnight", "vehicle lowers in garage", "air escaping sound"],
        "inspection_steps": [
            "Measure ride height before parking and again in the morning to confirm both front corners are dropping together.",
            "Spray soapy water around the front air spring assemblies, airlines, and valve block fittings to look for bubbling.",
            "If the front lowers as a unit, suspect a shared control issue such as the valve block or front circuit rather than only one individual spring.",
            "Scan the suspension system for codes if a suitable scan tool is available.",
        ],
        "inspection_tools": [
            _tool("Spray bottle", "spray bottle"),
            _tool("Soapy water leak solution", "soap spray leak detection", "Useful for finding air leaks"),
            _tool("OBD2 scanner with suspension functions", "advanced obd2 scanner suspension air ride"),
            _tool("Flashlight", "led inspection flashlight"),
        ],
        "related_videos": [
            _video("How to diagnose air suspension leaks", "how to diagnose air suspension leak", "Helpful for isolating air leak location"),
            _video("Air suspension valve block diagnosis", "air suspension valve block diagnosis", "Useful if the front drops as a pair"),
        ],
        "diy": {
            "estimated_cost": {"min": 80, "max": 950},
            "tools": [_tool("Socket set", "mechanic socket set SAE metric"), _tool("Trim tools", "automotive trim removal tools"), _tool("Floor jack", "3 ton floor jack"), _tool("Jack stands", "6 ton jack stands")],
            "parts": [
                _part("Front air strut / air spring assembly", "front air suspension strut exact fit", "Main replacement part if a front air spring is leaking", ["RockAuto", "Amazon"]),
                _part("Air suspension valve block", "air suspension valve block exact fit", "Consider if both front corners lower together", ["Amazon", "RockAuto"]),
                _part("Air line repair kit", "air suspension line repair kit", "Useful if leakage is in the airline or fitting", ["Amazon", "AutoZone"]),
            ],
            "repair_videos": [
                _video("Air suspension strut replacement", "front air suspension strut replacement tutorial", "DIY replacement videos"),
                _video("Valve block replacement and diagnosis", "air suspension valve block replacement", "Useful for shared-circuit failures"),
            ],
        },
        "mechanic": {"estimated_cost": {"min": 350, "max": 1600}},
    },
    {
        "key": "general-cooling-system-issue", "title": "General cooling system issue",
        "summary": "The symptoms point to a cooling system problem, but the exact failed component still needs to be confirmed before parts are purchased.",
        "difficulty": "Moderate", "experience": "Intermediate",
        "keywords": ["cooling issue", "coolant problem", "running hot", "overheating", "coolant smell", "coolant loss"],
        "aliases": ["general overheating issue", "cooling system fault"],
        "symptoms": ["temperature issues", "coolant smell", "coolant loss"],
        "inspection_steps": [
            "Inspect radiator, hoses, thermostat housing, reservoir, and water pump area for visible leakage.",
            "Pressure test the cooling system if possible to isolate the exact source.",
            "Do not buy parts until the failed component is confirmed.",
        ],
        "inspection_tools": [_tool("Cooling system pressure tester", "cooling system pressure tester"), _tool("Flashlight", "led inspection flashlight"), _tool("Mechanic gloves", "nitrile mechanic gloves")],
        "related_videos": [_video("Cooling system leak diagnosis", "cooling system leak diagnosis tutorial", "General cooling system troubleshooting")],
        "diy": {
            "estimated_cost": {"min": 60, "max": 350},
            "tools": [_tool("Cooling system pressure tester", "cooling system pressure tester"), _tool("Drain pan", "automotive coolant drain pan")],
            "parts": [_part("Cooling system replacement part", "cooling system replacement part exact fit", "Choose exact part after confirming the failure", ["RockAuto", "AutoZone", "O'Reilly Auto Parts"])],
            "repair_videos": [_video("General cooling system repair", "general cooling system repair tutorial", "Broad repair walkthroughs")],
        },
        "mechanic": {"estimated_cost": {"min": 180, "max": 750}},
    },
    {
        "key": "transmission-issue", "title": "Transmission slipping or hard shifting",
        "summary": "Delayed engagement, slipping between gears, hard or jerky shifts, or transmission warning lights can indicate low fluid, worn clutch packs, solenoid issues, or internal failure.",
        "difficulty": "Advanced", "experience": "Intermediate to Advanced",
        "keywords": ["transmission", "slipping", "hard shifting", "delayed engagement", "transmission fluid", "won't shift", "jerky shifting", "transmission light", "gear slipping"],
        "aliases": ["bad transmission", "transmission failure", "shift flare"],
        "symptoms": ["slipping gears", "delayed response", "transmission warning light", "jerky acceleration"],
        "inspection_steps": ["Check transmission fluid level and condition on the dipstick if accessible.", "Scan for transmission-related diagnostic codes.", "Note when symptoms occur: cold start, under load, at specific speeds.", "Check for fluid leaks under the vehicle near the transmission pan."],
        "inspection_tools": [_tool("OBD2 scanner", "obd2 scanner transmission codes"), _tool("Flashlight", "led inspection flashlight"), _tool("Drain pan", "automotive fluid drain pan")],
        "related_videos": [_video("How to check transmission fluid", "how to check transmission fluid level and condition"), _video("Transmission problems diagnosis", "transmission slipping diagnosis")],
        "diy": {
            "estimated_cost": {"min": 30, "max": 250},
            "tools": [_tool("Socket set", "mechanic socket set SAE metric"), _tool("Drain pan", "automotive fluid drain pan"), _tool("Funnel", "long neck transmission funnel")],
            "parts": [_part("Transmission fluid", "transmission fluid ATF exact fit", "Use manufacturer-specified fluid type", ["Walmart", "AutoZone", "O'Reilly Auto Parts"]), _part("Transmission filter kit", "transmission filter kit exact fit", "Replace during fluid service", ["RockAuto", "AutoZone"])],
            "repair_videos": [_video("Transmission fluid change", "transmission fluid change tutorial", "DIY fluid service guide")],
        },
        "mechanic": {"estimated_cost": {"min": 150, "max": 3500}},
    },
    {
        "key": "exhaust-catalytic-converter", "title": "Exhaust leak or catalytic converter issue",
        "summary": "Loud exhaust noise, rotten egg smell, reduced power, or P0420/P0430 codes can indicate an exhaust leak, failing catalytic converter, or damaged exhaust component.",
        "difficulty": "Moderate to Advanced", "experience": "Intermediate",
        "keywords": ["exhaust leak", "catalytic converter", "rotten egg smell", "loud exhaust", "P0420", "P0430", "exhaust noise", "muffler", "exhaust pipe"],
        "aliases": ["bad catalytic converter", "exhaust rattle", "muffler leak"],
        "symptoms": ["loud exhaust noise", "sulfur smell", "reduced power", "check engine light"],
        "inspection_steps": ["Listen for exhaust leaks with the engine running — focus on manifold, flex pipe, and connections.", "Check for rust, holes, or loose clamps along the exhaust system.", "Scan for catalytic converter efficiency codes (P0420, P0430).", "Inspect heat shields for rattling or loose mounting."],
        "inspection_tools": [_tool("OBD2 scanner", "obd2 scanner"), _tool("Flashlight", "led inspection flashlight"), _tool("Jack and jack stands", "3 ton jack and 6 ton jack stands")],
        "related_videos": [_video("Exhaust leak diagnosis", "how to find exhaust leak"), _video("Catalytic converter testing", "catalytic converter P0420 diagnosis")],
        "diy": {
            "estimated_cost": {"min": 50, "max": 800},
            "tools": [_tool("Socket set", "mechanic socket set SAE metric"), _tool("Penetrating oil", "penetrating oil PB blaster"), _tool("Jack and jack stands", "3 ton floor jack and 6 ton jack stands")],
            "parts": [_part("Exhaust clamp kit", "exhaust clamp repair kit", "For sealing small leaks at connections", ["Amazon", "AutoZone"]), _part("Catalytic converter", "catalytic converter exact fit", "Replace if efficiency codes confirmed", ["RockAuto", "Amazon"])],
            "repair_videos": [_video("Exhaust repair guide", "exhaust leak repair tutorial"), _video("Catalytic converter replacement", "catalytic converter replacement DIY")],
        },
        "mechanic": {"estimated_cost": {"min": 200, "max": 2500}},
    },
    {
        "key": "power-steering-issue", "title": "Power steering problem",
        "summary": "Whining noise when turning, stiff steering, fluid leaks near the pump or rack, or difficulty turning at low speeds can indicate a power steering pump, rack, or fluid issue.",
        "difficulty": "Moderate to Advanced", "experience": "Intermediate",
        "keywords": ["power steering", "steering whine", "hard to turn", "steering pump", "steering fluid leak", "steering rack", "steering noise"],
        "aliases": ["bad power steering pump", "steering rack leak", "steering stiff"],
        "symptoms": ["whining when turning", "stiff steering wheel", "steering fluid leak", "groaning noise"],
        "inspection_steps": ["Check power steering fluid level and condition.", "Listen for whining that changes with steering wheel movement.", "Inspect the pump, hoses, and rack for leaks.", "Check the serpentine belt that drives the pump for wear or slipping."],
        "inspection_tools": [_tool("Flashlight", "led inspection flashlight"), _tool("Mechanic gloves", "nitrile mechanic gloves"), _tool("Drain pan", "automotive fluid drain pan")],
        "related_videos": [_video("Power steering diagnosis", "power steering pump noise diagnosis"), _video("Steering fluid check", "how to check power steering fluid")],
        "diy": {
            "estimated_cost": {"min": 20, "max": 400},
            "tools": [_tool("Socket set", "mechanic socket set SAE metric"), _tool("Belt tool", "serpentine belt tool"), _tool("Turkey baster", "fluid transfer pump")],
            "parts": [_part("Power steering fluid", "power steering fluid exact fit", "Use correct type for the vehicle", ["Walmart", "AutoZone"]), _part("Power steering pump", "power steering pump exact fit", "Replace if confirmed failing", ["RockAuto", "AutoZone", "O'Reilly Auto Parts"])],
            "repair_videos": [_video("Power steering pump replacement", "power steering pump replacement tutorial")],
        },
        "mechanic": {"estimated_cost": {"min": 200, "max": 1200}},
    },
    {
        "key": "ac-heating-system", "title": "AC or heating system issue",
        "summary": "No cold air, weak airflow, strange smells from vents, or no heat can indicate a refrigerant leak, compressor failure, clogged cabin filter, blend door issue, or heater core problem.",
        "difficulty": "Moderate to Advanced", "experience": "Intermediate",
        "keywords": ["AC not working", "air conditioning", "no cold air", "AC compressor", "refrigerant", "heater not working", "no heat", "blend door", "cabin filter"],
        "aliases": ["bad AC compressor", "low refrigerant", "heater core leak", "AC blowing warm"],
        "symptoms": ["warm air from AC", "no heat", "strange smell from vents", "weak airflow"],
        "inspection_steps": ["Check if the AC compressor clutch engages when AC is turned on.", "Feel both AC lines — the low-pressure line should be cold.", "Replace the cabin air filter if airflow is weak.", "Check coolant level if the heater is not producing heat."],
        "inspection_tools": [_tool("OBD2 scanner", "obd2 scanner"), _tool("Infrared thermometer", "infrared thermometer automotive"), _tool("Flashlight", "led inspection flashlight")],
        "related_videos": [_video("AC system diagnosis", "car AC not blowing cold diagnosis"), _video("Cabin filter replacement", "cabin air filter replacement")],
        "diy": {
            "estimated_cost": {"min": 15, "max": 600},
            "tools": [_tool("AC recharge kit", "AC recharge kit R134a", "For topping off refrigerant"), _tool("Socket set", "mechanic socket set SAE metric")],
            "parts": [_part("Cabin air filter", "cabin air filter exact fit", "Replace if airflow is weak or smells musty", ["Amazon", "Walmart", "AutoZone"]), _part("AC recharge kit", "AC recharge kit with gauge", "For DIY refrigerant top-off", ["Walmart", "AutoZone"])],
            "repair_videos": [_video("AC recharge tutorial", "how to recharge car AC tutorial"), _video("Heater core diagnosis", "heater core not working diagnosis")],
        },
        "mechanic": {"estimated_cost": {"min": 150, "max": 1800}},
    },
    {
        "key": "oil-leak", "title": "Oil leak",
        "summary": "Oil spots under the vehicle, burning oil smell, low oil level warnings, or visible oil residue on the engine can indicate a valve cover gasket, oil pan gasket, rear main seal, or other oil leak.",
        "difficulty": "Easy to Advanced", "experience": "Beginner to Advanced",
        "keywords": ["oil leak", "burning oil", "oil on ground", "oil consumption", "low oil", "valve cover gasket", "oil pan gasket", "oil smell"],
        "aliases": ["leaking oil", "engine oil leak", "oil drip"],
        "symptoms": ["oil spots under car", "burning oil smell", "low oil warning", "visible oil on engine"],
        "inspection_steps": ["Check oil level on the dipstick.", "Look for oil residue on the valve cover, oil pan, and around the front and rear of the engine.", "Clean the area and drive to identify the exact leak source.", "Check the oil drain plug and filter for tightness."],
        "inspection_tools": [_tool("Flashlight", "led inspection flashlight"), _tool("Mechanic gloves", "nitrile mechanic gloves"), _tool("Mirror inspection tool", "telescoping inspection mirror")],
        "related_videos": [_video("How to find an oil leak", "how to find engine oil leak source"), _video("Valve cover gasket inspection", "valve cover gasket leak diagnosis")],
        "diy": {
            "estimated_cost": {"min": 15, "max": 300},
            "tools": [_tool("Socket set", "mechanic socket set SAE metric"), _tool("Torque wrench", "torque wrench"), _tool("Drain pan", "automotive oil drain pan")],
            "parts": [_part("Valve cover gasket set", "valve cover gasket set exact fit", "Common leak source on many engines", ["RockAuto", "AutoZone", "O'Reilly Auto Parts"]), _part("Oil drain plug gasket", "oil drain plug washer", "Replace if plug area is seeping", ["AutoZone", "Amazon"]), _part("Engine oil", "engine oil exact spec", "Top off or replace after repair", ["Walmart", "AutoZone"])],
            "repair_videos": [_video("Valve cover gasket replacement", "valve cover gasket replacement tutorial"), _video("Oil pan gasket replacement", "oil pan gasket replacement DIY")],
        },
        "mechanic": {"estimated_cost": {"min": 100, "max": 1500}},
    },
    {
        "key": "tire-alignment", "title": "Tire wear or alignment issue",
        "summary": "Uneven tire wear, vehicle pulling to one side, steering wheel off-center, or vibration at highway speeds can indicate alignment problems, worn suspension, or tire issues.",
        "difficulty": "Easy to Moderate", "experience": "Beginner to Intermediate",
        "keywords": ["tire wear", "alignment", "pulling left", "pulling right", "uneven wear", "vibration at speed", "tire rotation", "bald tire"],
        "aliases": ["bad alignment", "tire cupping", "feathered tires"],
        "symptoms": ["vehicle pulls to one side", "uneven tire wear", "steering vibration", "off-center steering wheel"],
        "inspection_steps": ["Inspect all four tires for uneven wear patterns.", "Check tire pressures with a gauge.", "Look for inner or outer edge wear which suggests alignment.", "Check for cupping or feathering which may indicate suspension wear."],
        "inspection_tools": [_tool("Tire pressure gauge", "digital tire pressure gauge"), _tool("Flashlight", "led inspection flashlight"), _tool("Tread depth gauge", "tire tread depth gauge")],
        "related_videos": [_video("Tire wear patterns explained", "tire wear patterns and what they mean"), _video("When to get an alignment", "wheel alignment signs and symptoms")],
        "diy": {
            "estimated_cost": {"min": 10, "max": 800},
            "tools": [_tool("Tire pressure gauge", "digital tire pressure gauge"), _tool("Lug wrench", "lug wrench"), _tool("Floor jack", "3 ton floor jack")],
            "parts": [_part("Replacement tires", "tires exact fit vehicle size", "Replace if worn below 2/32 tread depth", ["Walmart", "Amazon"]), _part("Tire rotation service", "tire rotation and balance", "Rotate every 5,000-7,500 miles", ["Walmart"])],
            "repair_videos": [_video("How to check tire wear", "how to check tire tread depth and wear"), _video("Tire rotation guide", "DIY tire rotation tutorial")],
        },
        "mechanic": {"estimated_cost": {"min": 50, "max": 1200}},
    },
    {
        "key": "check-engine-light", "title": "Check engine light (generic)",
        "summary": "The check engine light can indicate hundreds of possible issues from a loose gas cap to serious engine problems. Scanning for diagnostic trouble codes is the essential first step.",
        "difficulty": "Easy to Advanced", "experience": "Beginner",
        "keywords": ["check engine light", "CEL", "engine light on", "warning light", "MIL", "service engine soon", "diagnostic codes", "OBD codes"],
        "aliases": ["engine warning", "malfunction indicator", "service engine"],
        "symptoms": ["check engine light on", "reduced power", "rough running", "poor fuel economy"],
        "inspection_steps": ["Scan for diagnostic trouble codes with an OBD2 scanner.", "Note all codes and their descriptions.", "Check if the gas cap is tight and properly sealed.", "Research the specific codes for your vehicle year, make, and model."],
        "inspection_tools": [_tool("OBD2 scanner", "obd2 scanner", "Essential tool for reading check engine codes"), _tool("Flashlight", "led inspection flashlight")],
        "related_videos": [_video("How to read check engine codes", "how to read OBD2 codes with scanner"), _video("Common check engine light causes", "most common check engine light causes and fixes")],
        "diy": {
            "estimated_cost": {"min": 0, "max": 500},
            "tools": [_tool("OBD2 scanner", "obd2 scanner bluetooth", "Read and clear codes yourself")],
            "parts": [_part("Gas cap", "gas cap replacement exact fit", "Replace if cracked or not sealing", ["AutoZone", "Amazon", "Walmart"])],
            "repair_videos": [_video("Check engine light diagnosis", "check engine light diagnosis step by step"), _video("How to clear codes", "how to clear check engine light codes OBD2")],
        },
        "mechanic": {"estimated_cost": {"min": 50, "max": 500}},
    },
    {
        "key": "serpentine-belt", "title": "Serpentine belt wear or noise",
        "summary": "Squealing on startup, chirping noise from the front of the engine, visible cracks in the belt, or loss of power steering and AC can indicate a worn or failing serpentine belt or tensioner.",
        "difficulty": "Easy to Moderate", "experience": "Beginner to Intermediate",
        "keywords": ["serpentine belt", "belt squealing", "belt noise", "belt cracking", "belt tensioner", "chirping noise", "belt slipping"],
        "aliases": ["drive belt noise", "fan belt", "accessory belt"],
        "symptoms": ["squealing on startup", "chirping from engine", "visible belt cracks", "AC and steering fail together"],
        "inspection_steps": ["Visually inspect the belt for cracks, glazing, or fraying.", "Check belt tension and the automatic tensioner for smooth operation.", "Listen for noise changes when accessories are turned on or off.", "Inspect pulleys for wobble or bearing noise."],
        "inspection_tools": [_tool("Flashlight", "led inspection flashlight"), _tool("Mechanic gloves", "nitrile mechanic gloves")],
        "related_videos": [_video("Serpentine belt inspection", "how to inspect serpentine belt"), _video("Belt tensioner check", "serpentine belt tensioner diagnosis")],
        "diy": {
            "estimated_cost": {"min": 25, "max": 150},
            "tools": [_tool("Belt tool", "serpentine belt tool", "Required to release the tensioner"), _tool("Socket set", "mechanic socket set SAE metric")],
            "parts": [_part("Serpentine belt", "serpentine belt exact fit", "Replace if cracked, glazed, or worn", ["AutoZone", "O'Reilly Auto Parts", "RockAuto"]), _part("Belt tensioner", "belt tensioner assembly exact fit", "Replace if tensioner is weak or noisy", ["RockAuto", "AutoZone"])],
            "repair_videos": [_video("Serpentine belt replacement", "serpentine belt replacement tutorial step by step"), _video("Belt routing diagram", "serpentine belt routing diagram how to")],
        },
        "mechanic": {"estimated_cost": {"min": 100, "max": 350}},
    },
]


def _normalize(text):
    if not text:
        return ""
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9\s-]", " ", str(text).lower())).strip()


def _all_terms(entry):
    terms = [entry.get("key", ""), entry.get("title", ""), entry.get("summary", "")]
    terms += entry.get("keywords", [])
    terms += entry.get("aliases", [])
    terms += entry.get("symptoms", [])
    return [t for t in terms if t]


def _score(entry, text):
    norm = _normalize(text)
    if not norm:
        return 0
    score = 0
    for term in _all_terms(entry):
        t = _normalize(term)
        if not t:
            continue
        if norm == t:
            score += 100
        elif t in norm:
            score += min(40, max(12, len(t)))
        else:
            words = t.split()
            matched = sum(1 for w in words if w in norm)
            if matched > 0:
                score += matched * 4
                if matched == len(words) and len(words) > 1:
                    score += 10
    return score


def find_repair_match(issue="", verified_diagnosis=""):
    vtext = _normalize(verified_diagnosis)
    itext = _normalize(issue)

    if vtext:
        best, best_score = None, 0
        for entry in REPAIR_LIBRARY:
            s = _score(entry, vtext)
            if s > best_score:
                best, best_score = entry, s
        if best and best_score >= 18:
            return {"entry": best, "match_type": "verified_diagnosis", "score": best_score}

    if itext:
        best, best_score = None, 0
        for entry in REPAIR_LIBRARY:
            s = _score(entry, itext)
            if s > best_score:
                best, best_score = entry, s
        if best and best_score >= 10:
            return {"entry": best, "match_type": "issue_keywords", "score": best_score}

    cooling_words = ["coolant", "overheat", "overheating", "radiator", "cooling"]
    if vtext and any(w in vtext for w in cooling_words):
        fallback = next((e for e in REPAIR_LIBRARY if e["key"] == "general-cooling-system-issue"), REPAIR_LIBRARY[0])
        return {"entry": fallback, "match_type": "cooling_fallback", "score": 1}

    return None
