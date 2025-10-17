"""Seed content for quick-start demos and tests."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List


def _objective(objective_id: str, name: str, description: str) -> Dict[str, Any]:
    return {
        "id": objective_id,
        "name": name,
        "description": description,
    }


def _question(
    question_id: str,
    objective_id: str,
    text: str,
    options: Dict[str, str],
    correct_answer: str,
    explanation: str,
) -> Dict[str, Any]:
    return {
        "id": question_id,
        "objective_id": objective_id,
        "text": text,
        "options": options,
        "correct_answer": correct_answer,
        "explanation": explanation,
    }


OBJECTIVES: List[Dict[str, Any]] = [
    _objective(
        "obj1",
        "Ventricular Septal Defects",
        "Diagnose and manage ventricular septal defects using imaging and clinical findings.",
    ),
    _objective(
        "obj2",
        "Tetralogy of Fallot",
        "Identify anatomical hallmarks of Tetralogy of Fallot and plan staged interventions.",
    ),
]

QUESTIONS: List[Dict[str, Any]] = [
    _question(
        "q1",
        "obj1",
        "A 2-week-old infant presents with a harsh holosystolic murmur at the lower left sternal border. Which finding best supports a diagnosis of a moderate ventricular septal defect?",
        {
            "A": "Fixed, widely split S2 on auscultation",
            "B": "Prominent left-to-right shunting on Doppler echocardiography",
            "C": "Differential cyanosis limited to the lower extremities",
            "D": "Diminished pulmonary vascular markings on chest X-ray",
        },
        "B",
        "Moderate VSDs typically show a left-to-right shunt with increased pulmonary blood flow on Doppler imaging.",
    ),
    _question(
        "q2",
        "obj1",
        "During follow-up, which clinical change most strongly indicates the need for surgical intervention in a child with a previously hemodynamically insignificant VSD?",
        {
            "A": "Improved growth velocity and weight gain",
            "B": "Onset of exertional dyspnea with elevated pulmonary pressures",
            "C": "Normalization of QRS axis on serial ECGs",
            "D": "Resolution of systolic murmur intensity",
        },
        "B",
        "Rising pulmonary pressures and new dyspnea signal increasing shunt volume and need for closure.",
    ),
    _question(
        "q3",
        "obj2",
        "Which anatomic component is responsible for the cyanosis observed in Tetralogy of Fallot?",
        {
            "A": "Patent ductus arteriosus",
            "B": "Subpulmonic stenosis with right-to-left shunt",
            "C": "Preductal coarctation of the aorta",
            "D": "Supravalvular pulmonary membrane",
        },
        "B",
        "Right ventricular outflow obstruction causes right-to-left shunting leading to systemic desaturation.",
    ),
    _question(
        "q4",
        "obj2",
        "A 5-year-old with repaired Tetralogy of Fallot now has progressive exercise intolerance. Which late complication is most consistent with these symptoms?",
        {
            "A": "Residual ventricular septal defect",
            "B": "Pulmonary regurgitation causing right ventricular dilation",
            "C": "Left ventricular outflow tract obstruction",
            "D": "Atrial septal aneurysm formation",
        },
        "B",
        "Chronic pulmonary regurgitation after repair can dilate the right ventricle and reduce exercise tolerance.",
    ),
]

USERS: Dict[str, Dict[str, Any]] = {
    "demo": {
        "password_hash": "",
        "salt": "",
        "points": 0,
        "badges": [],
        "level": 1,
        "completed_objectives": {},
    }
}

LEADERBOARD: List[Dict[str, Any]] = [
    {
        "username": "demo",
        "total_points": 0,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
]

SEED_STATE: Dict[str, Any] = {
    "objectives": OBJECTIVES,
    "questions": QUESTIONS,
    "users": USERS,
    "leaderboard": LEADERBOARD,
    "sessions": {},
}

__all__ = ["SEED_STATE", "OBJECTIVES", "QUESTIONS"]
