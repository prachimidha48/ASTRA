from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AstronautProfile(BaseModel):
    id: str = "ASTRO-7702"
    name: str = "Dr. Elena Vance"
    callsign: str = "Valkyrie-1"
    role: str = "Mission Specialist / Flight Surgeon"
    mission_name: str = "Artemis VII - Mars Transit Simulation"
    mission_sol: int = 68
    mission_duration_days: int = 180
    vessel: str = "Deep Space Gateway / Orion HAB-4"
    craft_orbit: str = "Near-Rectilinear Halo Orbit (NRHO)"
    status: str = "Nominal Monitoring"
    baseline_established: bool = True
    avatar_url: Optional[str] = "/avatar.svg"

class VitalsRecord(BaseModel):
    id: Optional[str] = None
    timestamp: str
    sol: int = Field(ge=1, le=10000, description="Mission Sol index")
    heart_rate: float = Field(ge=25.0, le=240.0, description="Active Heart Rate (BPM)")
    resting_heart_rate: float = Field(ge=25.0, le=200.0, description="Resting Heart Rate (BPM)")
    spo2: float = Field(ge=60.0, le=100.0, description="Peripheral Blood Oxygen Saturation (%)")
    blood_pressure_sys: float = Field(ge=60.0, le=240.0, description="Systolic Blood Pressure (mmHg)")
    blood_pressure_dia: float = Field(ge=35.0, le=150.0, description="Diastolic Blood Pressure (mmHg)")
    body_temp: float = Field(ge=32.0, le=43.0, description="Core Body Temperature (°C)")
    respiratory_rate: float = Field(ge=4.0, le=60.0, description="Respiratory Rate (breaths/min)")
    hrv: float = Field(ge=5.0, le=250.0, description="Heart Rate Variability rMSSD (ms)")
    source: Optional[str] = "BioTelemetry-Suit-04"
    is_anomaly: Optional[int] = 0

class WellnessRecord(BaseModel):
    id: Optional[str] = None
    timestamp: str
    sol: int = Field(ge=1, le=10000, description="Mission Sol index")
    mood: int = Field(ge=1, le=10, description="1 (Very Low) to 10 (Optimal)")
    stress_level: int = Field(ge=1, le=10, description="1 (Relaxed) to 10 (Severe)")
    energy_level: int = Field(ge=1, le=10, description="1 (Exhausted) to 10 (Peak)")
    sleep_quality: int = Field(ge=1, le=10, description="1 (Poor/Fragmented) to 10 (Restorative)")
    fatigue_level: int = Field(ge=1, le=10, description="1 (None) to 10 (Exhaustion)")
    sleep_duration: float = Field(ge=0.0, le=24.0, description="Total sleep duration (hours)")
    rem_sleep_duration: Optional[float] = Field(default=0.0, ge=0.0, le=24.0)
    deep_sleep_duration: Optional[float] = Field(default=0.0, ge=0.0, le=24.0)
    light_sleep_duration: Optional[float] = Field(default=0.0, ge=0.0, le=24.0)
    notes: Optional[str] = ""

class FitnessRecord(BaseModel):
    id: Optional[str] = None
    timestamp: str
    sol: int = Field(ge=1, le=10000, description="Mission Sol index")
    activity_type: str
    duration_minutes: int = Field(ge=1, le=480, description="Exercise duration in minutes")
    intensity: str
    avg_heart_rate: float = Field(ge=30.0, le=240.0, description="Average Exercise Heart Rate (BPM)")
    peak_heart_rate: float = Field(ge=30.0, le=250.0, description="Peak Exercise Heart Rate (BPM)")
    calories_burned: float = Field(ge=0.0, le=5000.0, description="Estimated Calories Burned (kcal)")
    load_kg: Optional[float] = Field(default=0.0, ge=0.0, le=500.0, description="Resistive Exercise Load (kg)")
    completed: Optional[int] = 1
    notes: Optional[str] = ""

class BaselineMetric(BaseModel):
    metric_name: str
    mean: float
    std_dev: float
    median: float
    p10: float
    p90: float
    window_days: int = 14
    unit: str
    updated_at: str

class AnomalyAlert(BaseModel):
    id: str
    timestamp: str
    sol: int
    title: str
    metric: str
    baseline_value: float
    current_value: float
    severity: str # "Low", "Moderate", "High"
    reason: str
    recommended_action: str
    acknowledged: bool = False
    ack_timestamp: Optional[str] = None
    dismissed: bool = False

class AnomalyDetectionRequest(BaseModel):
    sol: Optional[int] = None
    window_days: Optional[int] = 14
    sensitivity: Optional[float] = 0.08 # Isolation Forest contamination rate

class SyncBatchRequest(BaseModel):
    vitals: List[VitalsRecord] = []
    wellness: List[WellnessRecord] = []
    fitness: List[FitnessRecord] = []
    alerts_ack: List[str] = []

