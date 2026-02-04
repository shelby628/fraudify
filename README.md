# Fraudify — Two-Stage Fraud Detection System

Fraudify is a machine-learning-driven, two-stage fraud detection system that simulates real-world banking pipelines. It combines real-time risk screening, post-transaction confirmation models, and human oversight to detect and review suspicious transactions while minimizing customer friction.



## Problem Statement

Financial institutions must approve transactions in real time while
simultaneously preventing fraud. Fraud is rare, highly imbalanced, and
constantly evolving, making traditional rule-based or single-stage models
ineffective.

Fraudify addresses this challenge by implementing a **two-stage fraud
detection architecture** that balances speed, recall, and precision.



## System Overview

The system consists of three main layers:

- **Frontend (React)**
  - Admin dashboard
  - User (Analyst) dashboard
  - Role-based navigation and access control

- **Backend (Django + Django REST Framework)**
  - Authentication & authorization
  - Transaction ingestion
  - Fraud prediction pipeline
  - Manual review queue
  - Audit logging

- **Machine Learning Layer**
  - Stage 1 real-time screening model
  - Stage 2 post-transaction confirmation model
  - Probability-based decision control
 

## Screenshots
 **User View**
<img width="920" height="433" alt="image" src="https://github.com/user-attachments/assets/6511c378-8dcd-4301-89b4-ecbbe79526fe" /> <br>
 **Admin View**
<img width="924" height="403" alt="image" src="https://github.com/user-attachments/assets/c92fe95e-c885-4fd9-84cc-91aec48e9318" /> <br>
<img width="924" height="443" alt="image" src="https://github.com/user-attachments/assets/172802c9-e383-4ea2-bee0-66b00d724646" /> <br>





## User Roles

### Admin
- View system-wide transaction statistics
- Access audit logs
- Review flagged transactions
- Override fraud decisions
- Monitor system behavior

### Analyst (Normal User)
- Submit transactions for prediction
- View fraud decisions and reasons
- Escalate transactions for review

A single login page is used, with **role-based routing enforced after
authentication**.



## Fraud Detection Architecture (Core Design)

### Two-Stage Fraud Detection Pipeline

Fraudify uses a **production-style two-stage architecture** inspired by
real banking systems.



### Stage 1 — Real-Time Risk Screening

Stage 1 acts as a **real-time risk filter** whose responsibility is to:

- Quickly approve low-risk transactions
- Flag potentially fraudulent transactions for deeper analysis

Key characteristics:
- Uses **only pre-transaction features**
- Designed for **high recall**, not high accuracy
- Outputs **fraud risk probabilities**, not binary decisions
- Applies a **fixed, conservative probability threshold**

Decision logic:
- **APPROVE** → Transaction proceeds normally
- **FLAG** → Transaction is escalated to Stage 2

This design prioritizes system safety and fraud recall over precision,
aligning with real-world fraud prevention requirements.



### Stage 2 — Post-Transaction Fraud Confirmation

Stage 2 operates only on transactions flagged by Stage 1.

Unlike Stage 1, this model is allowed to use:
- Post-transaction balances
- Balance consistency checks
- Derived balance-change features

Objectives:
- Extremely high precision
- Minimize false fraud confirmations
- Support downstream actions such as:
  - Manual review
  - Account freezing
  - Administrative escalation

Stage 2 is **not real-time** and is never applied to all transactions.



## Why a Two-Stage Design?

A single-stage fraud model is either:
- Too weak → misses fraud
- Too aggressive → blocks legitimate customers

Fraudify mirrors real production pipelines by:
- Keeping Stage 1 fast and conservative
- Keeping Stage 2 slow, powerful, and precise

This separation reduces customer friction while maintaining strong fraud
protection.



## Handling Class Imbalance & Data Leakage

Fraud cases represent a very small fraction of transactions, making accuracy
a misleading metric.

Mitigations applied:
- Class weighting
- Recall-focused evaluation
- Probability threshold tuning
- Strict separation of decision-time vs outcome-dependent features

Several highly predictive post-transaction features were intentionally
excluded from Stage 1 to prevent data leakage.

---

## Safety-Critical Feature Handling

### Example: `amount_to_old_balance_ratio`

- **Role:** Contextualizes transaction amount relative to account balance
- **Risk if missing:** Large increase in false BLOCK and REVIEW decisions
- **Classification:** Safety-critical
- **Mitigation:**
  - Feature availability monitoring
  - Fallback to REVIEW-heavy policy if unavailable

This ensures system stability under partial feature failure.

---

## Manual Review & Audit Logging

- Transactions marked as REVIEW are placed in a manual review queue
- All critical actions (logins, predictions, overrides, reviews) are recorded
  in an immutable audit log
- This ensures transparency, traceability, and accountability

---

## Technology Stack

**Frontend**
- React
- React Router
- Axios

**Backend**
- Django
- Django REST Framework
- Token-based authentication

**Machine Learning**
- Random Forest (Stage 1)
  



## Limitations

- Dataset is simulated and rule-driven
- Stage 2 relies on post-transaction features
- No real-time transaction streaming
- Not production-deployed

These limitations are acknowledged and addressed through architectural
design rather than ignored.


## Disclaimer

This project is a prototype built for educational and portfolio purposes.
It is not intended for real-world financial deployment.
