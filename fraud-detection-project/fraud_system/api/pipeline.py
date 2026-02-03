
import joblib
import numpy as np
import pandas as pd
import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "models")

# Load trained models
rf_stage1 = joblib.load(os.path.join(MODEL_DIR, "rf_stage1.joblib"))
rf_stage2 = joblib.load(os.path.join(MODEL_DIR, "rf_stage2.joblib"))

# Stage 1 decision threshold
STAGE1_THRESHOLD = 0.06

# Historical max for failure detection
HISTORICAL_MAX_RATIO = 5860863  # replace with actual max observed value

SAFE_DEFAULT_RESPONSE = {
    "decision": "REVIEW",
    "stage": "SYSTEM",
    "reason": "System error – safe fallback"
}

def process_transaction(transaction):
    try:
        explanation = {}
        decision = "REVIEW"
        stage = "SYSTEM"
        reason_text = ""
        stage1_prob = 0.0
        stage2_prob = 0.0

        # -------- Input validation --------
        required_fields = [
            "step", "amount", "oldbalanceOrg", "newbalanceOrig",
            "oldbalanceDest", "newbalanceDest",
            "type_CASH_OUT", "type_DEBIT", "type_PAYMENT", "type_TRANSFER"
        ]
        for field in required_fields:
            if field not in transaction:
                return {
                    "stage1_probability": 0.0,
                    "stage2_probability": 0.0,
                    "decision": "REVIEW",
                    "stage": "Fallback",
                    "reason": f"Missing required field: {field}"
                }
            if transaction[field] is None:
                return {
                    "stage1_probability": 0.0,
                    "stage2_probability": 0.0,
                    "decision": "REVIEW",
                    "stage": "Fallback",
                    "reason": f"Null value in field: {field}"
                }

        numeric_fields = ["step", "amount", "oldbalanceOrg", "newbalanceOrig", "oldbalanceDest", "newbalanceDest"]
        for field in numeric_fields:
            if not isinstance(transaction[field], (int, float)):
                 return {
                    "stage1_probability": 0.0,
                    "stage2_probability": 0.0,
                    "decision": "REVIEW",
                    "stage": "Fallback",
                    "reason": f"Invalid type for field: {field}"
                }
            if transaction[field] < 0:
                 return {
                    "stage1_probability": 0.0,
                    "stage2_probability": 0.0,
                    "decision": "REVIEW",
                    "stage": "Fallback",
                    "reason": f"Negative value in field: {field}"
                }

        # -------- Stage 1 --------
        stage1_features = pd.DataFrame([{
            'step': transaction['step'],
            'amount': transaction['amount'],
            'oldbalanceOrg': transaction['oldbalanceOrg'],
            'type_CASH_OUT': transaction['type_CASH_OUT'],
            'type_DEBIT': transaction['type_DEBIT'],
            'type_PAYMENT': transaction['type_PAYMENT'],
            'type_TRANSFER': transaction['type_TRANSFER']
        }])

        stage1_prob = float(rf_stage1.predict_proba(stage1_features)[0, 1])
        explanation['stage1_probability'] = stage1_prob

        # Decision Logic
        if stage1_prob < STAGE1_THRESHOLD:
            decision = "APPROVE"
            stage = "Stage 1"
            # reason_text will be calculated via rules below
        else:
            # -------- Stage 2 --------
            orig_balance_change = transaction['oldbalanceOrg'] - transaction['newbalanceOrig']
            dest_balance_change = transaction['newbalanceDest'] - transaction['oldbalanceDest']
            is_zero_orig_after = int(transaction['newbalanceOrig'] == 0)
            amount_to_old_balance_ratio = transaction['amount'] / (transaction['oldbalanceOrg'] + 1)
            
            explanation['amount_to_old_balance_ratio'] = amount_to_old_balance_ratio

            # -------- Fallback check --------
            if amount_to_old_balance_ratio > HISTORICAL_MAX_RATIO:
                decision = "REVIEW"
                stage = "Fallback"
                reason_text = "Unsafe ratio detected"
            else:
                # -------- Stage 2 model --------
                stage2_features = np.array([[
                    transaction['amount'],
                    orig_balance_change,
                    dest_balance_change,
                    is_zero_orig_after,
                    amount_to_old_balance_ratio
                ]])
                stage2_prob = float(rf_stage2.predict_proba(stage2_features)[0, 1])
                explanation['stage2_probability'] = stage2_prob
                stage = 'Stage 2'

                if stage2_prob >= 0.75:
                    decision = "BLOCK"
                elif stage2_prob >= 0.25:
                    decision = "REVIEW"
                else:
                    decision = "APPROVE"

        # -------- Rule-Based Reason Generation --------
        reasons = []
        if transaction['amount'] > 500000:
            reasons.append("Unusually large transaction amount")

        if (transaction['oldbalanceOrg'] - transaction['newbalanceOrig']) != transaction['amount']:
            # Allow for small floating point errors? The user rule is strict inequality.
            # Using strict for now as requested.
            reasons.append("Origin account balance inconsistency")

        if (transaction['newbalanceDest'] - transaction['oldbalanceDest']) > (transaction['amount'] * 0.9):
             # User rule: new_dest - old_dest > amount * 0.9
             reasons.append("Sudden destination balance increase")

        if stage2_prob > 0.8:
            reasons.append("High fraud probability detected by stage 2 model")
        
        # Add stage 1 specific reason if approved there to ensure context
        if stage == "Stage 1" and not reasons:
             reasons.append("Passed Stage 1 low-risk check")

        if not reasons:
            reasons.append("Transaction pattern within normal limits")

        reason_text = "; ".join(reasons)

        return {
            "status": "success",
            "decision": decision,
            "stage": stage,
            "reason": reason_text,
            "stage1_probability": stage1_prob,
            "stage2_probability": stage2_prob
        }

    except Exception as e:
        return {**SAFE_DEFAULT_RESPONSE, "error": str(e), "stage1_probability": 0.0, "stage2_probability": 0.0}
