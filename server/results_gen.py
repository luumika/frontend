from typing import Dict, List, Union, Literal
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
import numpy as np
import matplotlib.pyplot as plt
import base64
import io
import random
from fastapi.middleware.cors import CORSMiddleware  # Wichtig: CORS importieren

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)


##############################################################################
# 1) GLOBAL STATE
##############################################################################

scenario_store: Dict[str, Dict] = {}

PATTERN_OPTIONS = ["LOW", "MEDIUM", "HIGH"]
REMAINING_PATTERNS: List[str] = []

def pick_consumption_pattern() -> str:
    global REMAINING_PATTERNS
    if len(REMAINING_PATTERNS) == 0:
        REMAINING_PATTERNS = PATTERN_OPTIONS.copy()
    chosen = random.choice(REMAINING_PATTERNS)
    REMAINING_PATTERNS.remove(chosen)
    return chosen

##############################################################################
# 2) PYDANTIC MODELS
##############################################################################

class SimulationLength(BaseModel):
    days: int = 0
    hours: int = 0
    minutes: int = 0

    @validator("*")
    def non_negative(cls, v):
        if v < 0:
            raise ValueError("days/hours/minutes cannot be negative.")
        return v

class SimulationInput(BaseModel):
    scenario_name: str
    system_id: str
    states_values: Union[dict, Literal["default"]] = "default"
    duration: SimulationLength

    @validator("scenario_name")
    def scenario_name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("scenario_name cannot be empty.")
        return v

    @validator("system_id")
    def system_id_not_empty(cls, v):
        if not v.strip():
            raise ValueError("system_id cannot be empty.")
        return v

class VisualizationInput(BaseModel):
    scenario_names: List[str]
    graph_type: str

    @validator("scenario_names")
    def scenario_list_not_empty(cls, v):
        if not v:
            raise ValueError("scenario_names cannot be empty.")
        return v

    @validator("graph_type")
    def valid_graph_type(cls, v):
        allowed = ["comparison", "stacked_area", "stacked_bar"]
        if v not in allowed:
            raise ValueError(f"graph_type must be one of {allowed}")
        return v

##############################################################################
# 3) DEVICES & PATTERNS
##############################################################################
DEVICES = ["Heater", "Controller", "Cloud Router", "Thermo Sensor"]

PATTERN_TOTAL_USAGE = {
    "LOW":    (0.5,  0.1),
    "MEDIUM": (1.0,  0.2),
    "HIGH":   (2.0,  0.3)
}

PATTERN_HEATER_RATIO = {
    "LOW":    0.70,
    "MEDIUM": 0.80,
    "HIGH":   0.90
}

##############################################################################
# 4) DATA GENERATION
##############################################################################

def generate_device_data(duration: SimulationLength, pattern: str) -> Dict[str, List[float]]:
    total_hours = duration.days * 24 + duration.hours
    # If there are leftover minutes, consider it an extra hour
    if duration.minutes > 0:
        total_hours += 1
    if total_hours < 1:
        total_hours = 1

    mean_val, std_val = PATTERN_TOTAL_USAGE[pattern]
    heater_ratio = PATTERN_HEATER_RATIO[pattern]

    usage_data = {dev: [] for dev in DEVICES}

    for _ in range(total_hours):
        total_usage = np.random.normal(mean_val, std_val)
        if total_usage < 0.0:
            total_usage = 0.0

        heater_val = total_usage * heater_ratio
        remainder = total_usage - heater_val
        if remainder < 0:
            remainder = 0

        # random split among remaining 3 devices
        rand_weights = np.random.random(len(DEVICES) - 1)
        w_sum = np.sum(rand_weights)
        if w_sum < 1e-9:
            shares = [0.0, 0.0, 0.0]
            shares[0] = remainder
        else:
            shares = (rand_weights / w_sum) * remainder

        usage_data["Heater"].append(heater_val)
        other_devs = [d for d in DEVICES if d != "Heater"]
        for i, dev in enumerate(other_devs):
            usage_data[dev].append(shares[i])

    return usage_data

##############################################################################
# 5) SIMULATE ENDPOINT
##############################################################################

@app.post("/simulate")
def simulate_scenario(input_data: SimulationInput):
    scenario_name = input_data.scenario_name
    if scenario_name in scenario_store:
        raise HTTPException(
            status_code=400,
            detail=f"Scenario '{scenario_name}' already exists."
        )

    chosen_pattern = pick_consumption_pattern()
    device_usage = generate_device_data(input_data.duration, chosen_pattern)

    # We still sum usage for internal usage in some plots
    total_array = []
    steps = len(device_usage["Heater"])
    for i in range(steps):
        step_sum = sum(device_usage[dev][i] for dev in DEVICES)
        total_array.append(step_sum)

    scenario_store[scenario_name] = {
        "system_id": input_data.system_id,
        "duration": input_data.duration.dict(),
        "pattern": chosen_pattern,
        "results": device_usage,   # device->list of floats
        "total_usage": total_array # needed for some plot types
    }

    return {
        "message": "Scenario simulation complete.",
        "scenario_data": {
            "scenario_name": scenario_name,
            "system_id": input_data.system_id,
            "duration": input_data.duration.dict(),
            "pattern": chosen_pattern
        }
    }

##############################################################################
# 6) VISUALIZE ENDPOINT
##############################################################################

@app.post("/visualize")
def visualize(input_data: VisualizationInput):
    # Validierung der Szenarien
    for s_name in input_data.scenario_names:
        if s_name not in scenario_store:
            raise HTTPException(
                status_code=404,
                detail=f"Scenario '{s_name}' not found."
            )
    scenarios_data = [scenario_store[s] for s in input_data.scenario_names]

    # Überprüfen, ob alle Szenarien die gleiche Anzahl an Zeitschritten haben, falls es eine "comparison" Grafik ist
    if input_data.graph_type == "comparison" and len(scenarios_data) > 1:
        lengths = [len(s["total_usage"]) for s in scenarios_data]
        if len(set(lengths)) != 1:
            raise HTTPException(
                status_code=400,
                detail="All scenarios in 'comparison' must have the same number of time steps."
            )

    fig = plt.figure(figsize=(8,5))
    ax = fig.add_subplot(111)

    # Unterschiedliche Visualisierungen
    if input_data.graph_type == "comparison":
        for i, s_data in enumerate(scenarios_data):
            label_name = input_data.scenario_names[i]
            ax.plot(s_data["total_usage"], label=f"{label_name} usage")
        ax.set_title("Comparison of Hourly Usage")
        ax.set_xlabel("Time Steps (Hours)")
        ax.set_ylabel("Usage (kWh)")
        ax.grid(True, linestyle="--", alpha=0.7)
        ax.legend()

    elif input_data.graph_type == "stacked_area":
        s_data = scenarios_data[0]
        usage_data = s_data["results"]
        arrs = [np.array(usage_data[dev]) for dev in DEVICES]
        x_vals = np.arange(len(arrs[0]))
        ax.stackplot(x_vals, arrs, labels=DEVICES, alpha=0.8)
        ax.set_title(f"Stacked Area for {input_data.scenario_names[0]}")
        ax.set_xlabel("Time Steps (Hours)")
        ax.set_ylabel("Usage (kWh)")
        ax.legend(loc="upper left")
        ax.grid(True, linestyle="--", alpha=0.7)

    elif input_data.graph_type == "stacked_bar":
        scenario_labels = []
        device_totals_by_scenario = {dev: [] for dev in DEVICES}
        for i, s_data in enumerate(scenarios_data):
            scenario_labels.append(input_data.scenario_names[i])
            usage_data = s_data["results"]
            for dev in DEVICES:
                dev_sum = sum(usage_data[dev])
                device_totals_by_scenario[dev].append(dev_sum)

        x_vals = np.arange(len(scenarios_data))
        bottoms = np.zeros(len(scenarios_data))
        colors = ["blue", "green", "red", "orange"]

        for i, dev in enumerate(DEVICES):
            vals = device_totals_by_scenario[dev]
            ax.bar(x_vals, vals, bottom=bottoms, color=colors[i], label=dev)
            bottoms += vals

        for i in range(len(scenarios_data)):
            total_val = bottoms[i]
            ax.text(i, total_val, f"{total_val:.1f}", ha="center", va="bottom")

        ax.set_xticks(x_vals)
        ax.set_xticklabels(scenario_labels, rotation=45, ha="right")
        ax.set_title("Stacked Bar of Device Totals")
        ax.set_ylabel("Total Energy (kWh)")
        ax.legend()
        ax.grid(True, linestyle="--", alpha=0.7)

    # Rückgabe ohne Bild, nur mit Szenariodetails
    scenario_info = []
    for i, s_name in enumerate(input_data.scenario_names):
        s_data = scenario_store[s_name]
        n_steps = len(s_data["results"]["Heater"])  # oder jedes andere Gerät
        time_array = list(range(n_steps))

        scenario_info.append({
            "scenario_name": s_name,
            "system_id": s_data["system_id"],
            "duration": s_data["duration"],
            "pattern": s_data["pattern"],
            "num_time_steps": n_steps,
            "unit": "kWh",
            "raw_data": {
                "time": time_array,
                "devices_usage": s_data["results"]
            }
        })

    return {
        "graph_type": input_data.graph_type,
        "scenario_details": scenario_info
    }

