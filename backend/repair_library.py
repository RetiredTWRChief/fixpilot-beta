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
