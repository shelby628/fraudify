
import joblib
import numpy as np
import pandas as pd

# Load trained models
rf_stage1 = joblib.load("C:\\Users\\hp\\OneDrive\\Desktop\\fraud-detection-project\\models\\rf_stage1.joblib")
rf_stage2 = joblib.load("C:\\Users\\hp\\OneDrive\\Desktop\\fraud-detection-project\\models\\rf_stage2.joblib")

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

        # -------- Input validation --------
        required_fields = [
            "step", "amount", "oldbalanceOrg", "newbalanceOrig",
            "oldbalanceDest", "newbalanceDest",
            "type_CASH_OUT", "type_DEBIT", "type_PAYMENT", "type_TRANSFER"
        ]
        for field in required_fields:
            if field not in transaction:
                return {
                    "decision": "REVIEW",
                    "stage": "Fallback",
                    "reason": f"Missing required field: {field}"
                }
            if transaction[field] is None:
                return {
                    "decision": "REVIEW",
                    "stage": "Fallback",
                    "reason": f"Null value in field: {field}"
                }

        numeric_fields = ["step", "amount", "oldbalanceOrg", "newbalanceOrig", "oldbalanceDest", "newbalanceDest"]
        for field in numeric_fields:
            if not isinstance(transaction[field], (int, float)):
                return {
                    "decision": "REVIEW",
                    "stage": "Fallback",
                    "reason": f"Invalid type for field: {field}"
                }
            if transaction[field] < 0:
                return {
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

        stage1_prob = rf_stage1.predict_proba(stage1_features)[0, 1]
        explanation['stage1_probability'] = float(stage1_prob)

        if stage1_prob < STAGE1_THRESHOLD:
            explanation.update({
                "decision": "APPROVE",
                "stage": "Stage 1",
                "reason": "Low fraud probability at Stage 1"
            })
            return explanation

        # -------- Stage 2 --------
        orig_balance_change = transaction['oldbalanceOrg'] - transaction['newbalanceOrig']
        dest_balance_change = transaction['newbalanceDest'] - transaction['oldbalanceDest']
        is_zero_orig_after = int(transaction['newbalanceOrig'] == 0)
        amount_to_old_balance_ratio = transaction['amount'] / (transaction['oldbalanceOrg'] + 1)
        explanation['amount_to_old_balance_ratio'] = amount_to_old_balance_ratio

        # -------- Fallback check --------
        if amount_to_old_balance_ratio > HISTORICAL_MAX_RATIO:
            return {
                "decision": "REVIEW",
                "stage": "Fallback",
                "reason": "Unsafe ratio detected"
            }

        # -------- Stage 2 model --------
        stage2_features = np.array([[
            transaction['amount'],
            orig_balance_change,
            dest_balance_change,
            is_zero_orig_after,
            amount_to_old_balance_ratio
        ]])
        stage2_prob = rf_stage2.predict_proba(stage2_features)[0, 1]
        explanation['stage2_probability'] = float(stage2_prob)
        explanation['stage'] = 'Stage 2'

        if stage2_prob >= 0.75:
            explanation.update({"decision": "BLOCK", "reason": "High fraud probability at Stage 2"})
        elif stage2_prob >= 0.25:
            explanation.update({"decision": "REVIEW", "reason": "Medium fraud probability at Stage 2"})
        else:
            explanation.update({"decision": "APPROVE", "reason": "Low fraud probability at Stage 2"})

        return explanation

    except Exception as e:
        return {**SAFE_DEFAULT_RESPONSE, "error": str(e)}
