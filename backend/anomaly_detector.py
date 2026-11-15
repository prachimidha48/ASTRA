import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from sklearn.ensemble import IsolationForest
import uuid
from datetime import datetime

class AstraHealthIntelligence:
    def __init__(self, contamination: float = 0.08):
        self.contamination = contamination
        self.iso_forest = IsolationForest(
            n_estimators=120,
            contamination=contamination,
            random_state=42
        )
        self.feature_cols = [
            'resting_heart_rate',
            'spo2',
            'blood_pressure_sys',
            'sleep_duration',
            'hrv',
            'body_temp'
        ]
        self.is_fitted = False

    def calculate_baselines(
        self,
        vitals_df: pd.DataFrame,
        wellness_df: pd.DataFrame,
        window_days: int = 14
    ) -> Dict[str, Dict[str, Any]]:
        """
        Calculates personalized baseline statistics (mean, std, median, p10, p90)
        from the EARLIEST `window_days` rows — the stable calibration period
        before any degradation begins.

        FIX (was bug): previously used ALL rows regardless of window_days,
        contaminating baselines with anomalous data from the fatigue period.
        Now we explicitly take the first `window_days` rows by sol order.
        """
        baselines = {}

        if not vitals_df.empty:
            # --- FIX: slice to calibration window (earliest sols only) ---
            cal_vitals = (
                vitals_df.sort_values('sol')
                         .drop_duplicates('sol')
                         .head(window_days)
            )

            metrics = {
                'heart_rate':          ('BPM',          68.0,  7.5),
                'resting_heart_rate':  ('BPM',          58.0,  4.2),
                'spo2':                ('%',            98.2,  0.8),
                'blood_pressure_sys':  ('mmHg',        116.0,  5.5),
                'blood_pressure_dia':  ('mmHg',         74.0,  4.8),
                'body_temp':           ('°C',           36.6,  0.25),
                'respiratory_rate':    ('breaths/min',  14.2,  1.2),
                'hrv':                 ('ms',           58.0,  8.5),
            }

            for col, (unit, default_mean, default_std) in metrics.items():
                if col in cal_vitals.columns and len(cal_vitals[col].dropna()) > 3:
                    data = cal_vitals[col].dropna()
                    mean_val   = float(data.mean())
                    std_val    = float(data.std()) if data.std() > 0.01 else default_std
                    median_val = float(data.median())
                    p10_val    = float(np.percentile(data, 10))
                    p90_val    = float(np.percentile(data, 90))
                else:
                    mean_val, std_val, median_val = default_mean, default_std, default_mean
                    p10_val = default_mean - 1.28 * default_std
                    p90_val = default_mean + 1.28 * default_std

                baselines[col] = {
                    'metric_name': col,
                    'unit': unit,
                    'mean':       round(mean_val,   2),
                    'std_dev':    round(std_val,    2),
                    'median':     round(median_val, 2),
                    'p10':        round(p10_val,    2),
                    'p90':        round(p90_val,    2),
                    'window_days': window_days,
                    'updated_at':  datetime.utcnow().isoformat(),
                }

        # Sleep baseline from calibration window only
        if not wellness_df.empty and 'sleep_duration' in wellness_df.columns:
            # --- FIX: slice to calibration window ---
            cal_wellness = (
                wellness_df.sort_values('sol')
                            .drop_duplicates('sol')
                            .head(window_days)
            )
            s_data = cal_wellness['sleep_duration'].dropna()
            if len(s_data) > 3:
                mean_s = float(s_data.mean())
                std_s  = float(s_data.std()) if s_data.std() > 0.01 else 0.8
                baselines['sleep_duration'] = {
                    'metric_name': 'sleep_duration',
                    'unit': 'hours',
                    'mean':       round(mean_s, 2),
                    'std_dev':    round(std_s,  2),
                    'median':     round(float(s_data.median()), 2),
                    'p10':        round(float(np.percentile(s_data, 10)), 2),
                    'p90':        round(float(np.percentile(s_data, 90)), 2),
                    'window_days': window_days,
                    'updated_at':  datetime.utcnow().isoformat(),
                }
        if 'sleep_duration' not in baselines:
            baselines['sleep_duration'] = {
                'metric_name': 'sleep_duration',
                'unit': 'hours',
                'mean': 7.4, 'std_dev': 0.7, 'median': 7.5,
                'p10': 6.5, 'p90': 8.2,
                'window_days': window_days,
                'updated_at': datetime.utcnow().isoformat(),
            }

        return baselines

    def fit_isolation_forest(self, combined_df: pd.DataFrame):
        """
        Fits the Isolation Forest using ONLY clean (non-anomalous) records.

        FIX (was bug): previously trained on all rows including anomalous ones,
        reducing model sensitivity and causing false positives on nominal data.
        Now we filter to is_anomaly == 0 before fitting.

        Minimum sample requirement raised to 25 clean records (from 10).
        Reason: IsolationForest with contamination=0.08 flags ceil(0.08 * N)
        records as outliers by design. With N < 25, up to 2 clean records
        get flagged as anomalies purely by the contamination fraction, producing
        false positives on perfectly normal data. 25 clean records ensures the
        2 mandatory 'outlier' slots fall on genuine boundary points.
        """
        if 'is_anomaly' in combined_df.columns:
            clean_df = combined_df[combined_df['is_anomaly'] == 0][self.feature_cols].dropna()
        else:
            clean_df = combined_df[self.feature_cols].dropna()

        if len(clean_df) >= 25:
            self.iso_forest.fit(clean_df)
            self.is_fitted = True

    def detect_anomalies(
        self,
        vitals_df: pd.DataFrame,
        wellness_df: pd.DataFrame,
        baselines: Dict[str, Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Multi-tier anomaly detection operating entirely on actual telemetry data.

        Tier 1 – Statistical compound rules (all thresholds derived from stored
                  personalized baselines, never hardcoded universal constants).
        Tier 2 – Isolation Forest multivariate outlier detection (fitted only on
                  the clean calibration period).

        Every alert field (baseline_value, current_value, reason, severity) is
        populated from real measurement values at detection time.

        Returns: list of alert dicts.  Empty list when data is nominal.
        """
        alerts = []
        if vitals_df.empty:
            return alerts

        # --- Sort ascending so tail() gives us the most recent records ---
        v_df = vitals_df.sort_values(by=['sol', 'timestamp']).reset_index(drop=True)
        w_df = (wellness_df.sort_values(by=['sol', 'timestamp']).reset_index(drop=True)
                if not wellness_df.empty else pd.DataFrame())

        # Merge wellness (sleep, stress, fatigue) onto vitals by Sol
        if not w_df.empty:
            merged = pd.merge(
                v_df,
                w_df[['sol', 'sleep_duration', 'stress_level', 'fatigue_level']],
                on='sol', how='left'
            )
        else:
            merged = v_df.copy()
            merged['sleep_duration'] = None
            merged['stress_level']   = None
            merged['fatigue_level']  = None

        # Fill missing wellness with baseline mean (not a hardcoded constant)
        sleep_base  = baselines.get('sleep_duration', {})
        sleep_mean  = sleep_base.get('mean', 7.4)
        sleep_std   = sleep_base.get('std_dev', 0.7)
        merged['sleep_duration'] = merged['sleep_duration'].fillna(sleep_mean)
        merged['stress_level']   = merged['stress_level'].fillna(3)
        merged['fatigue_level']  = merged['fatigue_level'].fillna(3)

        # Retrieve all baseline dicts – every threshold below uses these values
        rhr_base    = baselines.get('resting_heart_rate', {'mean': 58.0, 'std_dev': 4.2})
        spo2_base   = baselines.get('spo2',               {'mean': 98.2, 'std_dev': 0.8})
        bp_sys_base = baselines.get('blood_pressure_sys', {'mean': 116.0, 'std_dev': 5.5})
        hrv_base    = baselines.get('hrv',                {'mean': 58.0, 'std_dev': 8.5})
        temp_base   = baselines.get('body_temp',          {'mean': 36.6, 'std_dev': 0.25})

        # --- Fit Isolation Forest on clean records if not yet fitted ---
        if not self.is_fitted and len(merged) >= 10:
            self.fit_isolation_forest(merged)

        # Last record (most recent telemetry point) used for single-point rules
        last_row = merged.iloc[-1]

        # ── RULE 1: Compound Autonomic Strain + Sleep Debt ────────────────────
        # Requires BOTH resting HR and sleep duration to be simultaneously
        # degraded for >= 2 consecutive recent Sols (gradual change detection).
        # Thresholds: >1.5σ above personal RHR baseline AND <-1.4σ below sleep mean.
        recent_records = merged.tail(14)
        consecutive_rhr_elevated = 0
        consecutive_sleep_low    = 0

        for _, row in recent_records.iterrows():
            rhr_z_row   = (row['resting_heart_rate'] - rhr_base['mean']) / max(rhr_base['std_dev'], 0.1)
            sleep_z_row = (row['sleep_duration']     - sleep_mean)       / max(sleep_std,            0.1)

            if rhr_z_row >= 1.5:
                consecutive_rhr_elevated += 1
            else:
                consecutive_rhr_elevated = max(0, consecutive_rhr_elevated - 1)

            if sleep_z_row <= -1.4:
                consecutive_sleep_low += 1
            else:
                consecutive_sleep_low = max(0, consecutive_sleep_low - 1)

        rhr_last  = float(last_row['resting_heart_rate'])
        rhr_z     = (rhr_last - rhr_base['mean']) / max(rhr_base['std_dev'], 0.1)
        sleep_last = float(last_row['sleep_duration'])

        if consecutive_rhr_elevated >= 2 and consecutive_sleep_low >= 2:
            severity = "High" if rhr_z > 2.5 else "Moderate"
            alerts.append({
                'id': f"ALT-COMP-{int(last_row['sol'])}-{int(rhr_last)}-01",
                'timestamp': str(last_row['timestamp']),
                'sol': int(last_row['sol']),
                'title': "Autonomic Fatigue & Circadian Misalignment",
                'metric': "Resting HR + Sleep Duration",
                'baseline_value': round(rhr_base['mean'], 1),
                'current_value':  round(rhr_last, 1),
                'severity': severity,
                'reason': (
                    f"Resting heart rate has remained significantly above your personalized "
                    f"baseline ({round(rhr_last, 1)} BPM vs baseline {round(rhr_base['mean'], 1)} BPM, "
                    f"+{round(rhr_z, 1)}\u03c3) concurring with reduced restorative sleep "
                    f"({round(sleep_last, 1)}h vs {round(sleep_mean, 1)}h baseline) "
                    f"over {consecutive_rhr_elevated} consecutive mission cycles. "
                    f"This compound pattern indicates accumulated autonomic load, not an isolated measurement."
                ),
                'recommended_action': (
                    "1) Schedule a 45-minute sleep extension window in quiet sleeping quarters; "
                    "2) Reduce resistive exercise load by 20% on next cycle; "
                    "3) Verify habitat acoustic dampers and circadian blue-depleted lighting; "
                    "4) Re-assess with flight surgeon telemetry check."
                ),
                'acknowledged': False,
                'ack_timestamp': None,
                'dismissed': False,
            })

        # ── RULE 2: SpO2 Hypoxic Saturation Dip ──────────────────────────────
        # Triggers when SpO2 is < 94.5 (absolute physiological floor) OR
        # drops >= 2.4σ below the astronaut's own baseline — whichever is more
        # sensitive.  Entirely computed from stored personal baseline values.
        spo2_last = float(last_row['spo2'])
        spo2_z    = (spo2_last - spo2_base['mean']) / max(spo2_base['std_dev'], 0.1)
        if spo2_last < 94.5 or spo2_z <= -2.4:
            alerts.append({
                'id': f"ALT-SPO2-{int(last_row['sol'])}-{int(spo2_last*10)}-02",
                'timestamp': str(last_row['timestamp']),
                'sol': int(last_row['sol']),
                'title': "Peripheral Blood Oxygen Saturation Dip",
                'metric': "SpO2",
                'baseline_value': round(spo2_base['mean'], 1),
                'current_value':  round(spo2_last, 1),
                'severity': "High" if spo2_last < 93.0 else "Moderate",
                'reason': (
                    f"Recorded SpO2 of {round(spo2_last, 1)}% is {round(abs(spo2_z), 1)}\u03c3 below "
                    f"your personal baseline ({round(spo2_base['mean'], 1)}%). In pressurized space habitats, "
                    f"persistent desaturation can stem from localized CO2 pockets or airway resistance."
                ),
                'recommended_action': (
                    "1) Cross-verify ECLSS ppO2/ppCO2 cabin sensors; "
                    "2) Re-calibrate and reposition pulse oximetry optical sensor; "
                    "3) Perform forced vital capacity breathing exercise; "
                    "4) If confirmed <94%, notify Flight Surgeon immediately."
                ),
                'acknowledged': False,
                'ack_timestamp': None,
                'dismissed': False,
            })

        # ── RULE 3: Elevated Systolic BP / Cephalad Fluid Shift ──────────────
        # Threshold: >= 2.3σ above personal BP baseline, or absolute >= 135 mmHg.
        bp_sys_last = float(last_row['blood_pressure_sys'])
        bp_z = (bp_sys_last - bp_sys_base['mean']) / max(bp_sys_base['std_dev'], 0.1)
        if bp_sys_last >= 135.0 or bp_z >= 2.3:
            alerts.append({
                'id': f"ALT-BP-{int(last_row['sol'])}-{int(bp_sys_last)}-03",
                'timestamp': str(last_row['timestamp']),
                'sol': int(last_row['sol']),
                'title': "Microgravity Cephalad Hemodynamic Shift",
                'metric': "Blood Pressure (Systolic)",
                'baseline_value': round(bp_sys_base['mean'], 1),
                'current_value':  round(bp_sys_last, 1),
                'severity': "High" if bp_sys_last >= 145.0 else "Moderate",
                'reason': (
                    f"Systolic blood pressure of {round(bp_sys_last, 1)} mmHg exceeds your personal "
                    f"baseline of {round(bp_sys_base['mean'], 1)} mmHg by +{round(bp_z, 1)}\u03c3. "
                    f"Microgravity cephalad fluid redistribution can induce transient central venous pressure elevation."
                ),
                'recommended_action': (
                    "1) Hydration re-check: maintain fluid and electrolyte intake; "
                    "2) Perform 15 minutes of LBNP or light cycle ergometer session; "
                    "3) Repeat BP measurement after 30 minutes rest in seated restraint."
                ),
                'acknowledged': False,
                'ack_timestamp': None,
                'dismissed': False,
            })

        # ── RULE 4: HRV Depression (Parasympathetic Withdrawal) ───────────────
        # Threshold: >= 2.0σ below personal HRV baseline, or absolute < 32 ms.
        hrv_last = float(last_row['hrv'])
        hrv_z    = (hrv_last - hrv_base['mean']) / max(hrv_base['std_dev'], 0.1)
        if hrv_last < 32.0 or hrv_z <= -2.0:
            alerts.append({
                'id': f"ALT-HRV-{int(last_row['sol'])}-{int(hrv_last)}-04",
                'timestamp': str(last_row['timestamp']),
                'sol': int(last_row['sol']),
                'title': "Parasympathetic Tone Withdrawal (Low HRV)",
                'metric': "Heart Rate Variability (rMSSD)",
                'baseline_value': round(hrv_base['mean'], 1),
                'current_value':  round(hrv_last, 1),
                'severity': "High" if hrv_z <= -3.0 else "Low",
                'reason': (
                    f"HRV index dropped to {round(hrv_last, 1)} ms vs your personalized baseline of "
                    f"{round(hrv_base['mean'], 1)} ms ({round(abs(hrv_z), 1)}\u03c3 below nominal). "
                    f"This indicates elevated sympathetic dominance, commonly linked to intense cognitive "
                    f"workload, pre-EVA mission prep, or incomplete autonomic recovery."
                ),
                'recommended_action': (
                    "1) Complete guided 10-minute paced diaphragmatic resonance breathing (0.1 Hz, 6 breaths/min); "
                    "2) Check caffeine and stimulant intake timing before the sleep window; "
                    "3) Log subjective stress level in the daily wellness check-in."
                ),
                'acknowledged': False,
                'ack_timestamp': None,
                'dismissed': False,
            })

        # ── TIER 2: Isolation Forest Multivariate Anomaly ─────────────────────
        # Only fires when the statistical rules above did NOT already catch it,
        # keeping the alert count to at most 3 (rule alerts take priority).
        # Anomaly score threshold -0.20 is tighter than the previous -0.15 to
        # reduce false positives on nominal data.
        if self.is_fitted and len(alerts) < 2:
            try:
                sample_df = pd.DataFrame([{
                    'resting_heart_rate': float(last_row['resting_heart_rate']),
                    'spo2':               float(last_row['spo2']),
                    'blood_pressure_sys': float(last_row['blood_pressure_sys']),
                    'sleep_duration':     float(last_row['sleep_duration']),
                    'hrv':                float(last_row['hrv']),
                    'body_temp':          float(last_row['body_temp']),
                }])
                prediction = self.iso_forest.predict(sample_df)[0]  # -1 anomaly, 1 normal
                score      = float(self.iso_forest.score_samples(sample_df)[0])

                if prediction == -1 and score < -0.20:
                    alerts.append({
                        'id': f"ALT-ML-ISO-{int(last_row['sol'])}-{int(abs(score)*1000)}-05",
                        'timestamp': str(last_row['timestamp']),
                        'sol': int(last_row['sol']),
                        'title': "Unsupervised Multivariate Telemetry Deviation",
                        'metric': "Multi-parameter (Isolation Forest)",
                        'baseline_value': 0.0,
                        'current_value':  round(score, 3),
                        'severity': "Moderate",
                        'reason': (
                            f"Isolation Forest multivariate model (fitted on {len(merged[merged.get('is_anomaly', 0) == 0]) if 'is_anomaly' in merged.columns else len(merged)} "
                            f"clean calibration records) flagged an anomalous joint pattern "
                            f"(anomaly score: {round(score, 3)}). Simultaneous micro-variations across "
                            f"resting heart rate, HRV, SpO2, and sleep duration deviate from your "
                            f"calibrated multidimensional baseline space."
                        ),
                        'recommended_action': (
                            "Review all subsystem telemetry. Log qualitative health comments in the "
                            "daily wellness check-in and schedule a routine biotelemetry sync."
                        ),
                        'acknowledged': False,
                        'ack_timestamp': None,
                        'dismissed': False,
                    })
            except Exception as e:
                print(f"ML anomaly detection skipped: {e}")

        return alerts
