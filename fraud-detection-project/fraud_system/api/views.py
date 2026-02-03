from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User

from api.models import Transaction
from .models import Prediction, AuditLog
from .pipeline import process_transaction


# ======================================================
# USER REGISTRATION (SIGN UP)
# ======================================================
@api_view(["POST"])
def register_user(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    confirm_password = request.data.get("confirm_password")

    if not all([username, email, password, confirm_password]):
        return Response({"error": "All fields are required"}, status=400)

    if password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response({"message": "Account created"}, status=201)


# ======================================================
# GET CURRENT USER
# ======================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    return Response({
        "username": request.user.username,
        "is_staff": request.user.is_staff
    })


# ======================================================
# TRANSACTIONS LIST
# ======================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transactions_list(request):
    view_as_user = request.query_params.get('view_as_user') == 'true'

    if request.user.is_staff and not view_as_user:
        transactions = Transaction.objects.all().order_by('-created_at')
    else:
        transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')

    data = []

    for tx in transactions:
        try:
            pred = Prediction.objects.get(transaction=tx)
            decision = pred.decision
            stage = pred.stage
            reason = pred.reason
            s1_prob = pred.stage1_probability or 0.0
            s2_prob = pred.stage2_probability or 0.0
        except Prediction.DoesNotExist:
            decision = "PENDING"
            stage = "N/A"
            reason = ""
            s1_prob = 0.0
            s2_prob = 0.0

        data.append({
            "id": tx.id,
            "user": tx.user.username,
            "amount": tx.amount,
            "step": tx.step,
            "oldbalanceOrg": tx.oldbalanceOrg,
            "newbalanceOrig": tx.newbalanceOrig,
            "oldbalanceDest": tx.oldbalanceDest,
            "newbalanceDest": tx.newbalanceDest,
            "decision": decision,
            "stage": stage,
            "reason": reason,
            "stage1_probability": s1_prob,
            "stage2_probability": s2_prob,
            "created_at": tx.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    return Response(data, status=status.HTTP_200_OK)


# ======================================================
# PREDICT TRANSACTION
# ======================================================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict(request):
    body = request.data

    if "amount" not in body:
        return Response(
            {"error": "Missing field: amount"},
            status=status.HTTP_400_BAD_REQUEST
        )

    step = body.get("step", 1)
    amount = float(body.get("amount"))
    oldbalanceOrg = body.get("oldbalanceOrg", amount)
    newbalanceOrig = body.get("newbalanceOrig", 0.0)
    oldbalanceDest = body.get("oldbalanceDest", 0.0)
    newbalanceDest = body.get("newbalanceDest", 0.0)
    t_type = body.get("type", "TRANSFER")

    pipeline_input = {
        "step": step,
        "amount": amount,
        "oldbalanceOrg": oldbalanceOrg,
        "newbalanceOrig": newbalanceOrig,
        "oldbalanceDest": oldbalanceDest,
        "newbalanceDest": newbalanceDest,
        "type_CASH_OUT": t_type == "CASH_OUT",
        "type_DEBIT": t_type == "DEBIT",
        "type_PAYMENT": t_type == "PAYMENT",
        "type_TRANSFER": t_type == "TRANSFER"
    }

    result = process_transaction(pipeline_input)

    transaction = Transaction.objects.create(
        user=request.user,
        **pipeline_input
    )

    prediction = Prediction.objects.create(
        transaction=transaction,
        stage1_probability=result.get("stage1_probability", 0.0),
        stage2_probability=result.get("stage2_probability", 0.0),
        decision=result.get("decision", "unknown"),
        stage=result.get("stage", "unknown"),
        reason=result.get("reason", ""),
        model_version="v1.0"
    )

    AuditLog.objects.create(
        user=request.user,
        action="PREDICT",
        transaction=transaction,
        details=f"{prediction.decision} — {prediction.reason}"
    )

    response = {
        "status": "success",
        "transaction_id": transaction.id,
        "decision": prediction.decision,
        "reason": prediction.reason
    }

    if request.user.is_staff:
        response["scores"] = {
            "stage1_probability": prediction.stage1_probability,
            "stage2_probability": prediction.stage2_probability
        }

    return Response(response, status=status.HTTP_200_OK)


# ======================================================
# DASHBOARD STATS (USER ONLY)
# ======================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard_stats(request):
    transactions = Transaction.objects.filter(user=request.user)
    predictions = Prediction.objects.filter(transaction__user=request.user)

    total = transactions.count()
    approved = predictions.filter(decision="APPROVE").count()
    blocked = predictions.filter(decision="BLOCK").count()
    pending = transactions.filter(prediction__isnull=True).count()

    # Calculate fraud_rate only if there are blocked transactions
    fraud_rate = round((blocked / total) * 100, 2) if total and blocked > 0 else 0


    return Response({
        "total": total,
        "approved": approved,
        "blocked": blocked,
        "pending": pending,
        "fraud_rate": fraud_rate
    })


# ======================================================
# DASHBOARD STATS (ADMIN ONLY)
# ======================================================
@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    transactions = Transaction.objects.all()
    predictions = Prediction.objects.all()

    total = transactions.count()
    approved = predictions.filter(decision="APPROVE").count()
    blocked = predictions.filter(decision="BLOCK").count()
    pending = transactions.filter(prediction__isnull=True).count()

    fraud_rate = round((blocked / total) * 100, 2) if total else 0

    return Response({
        "total": total,
        "approved": approved,
        "blocked": blocked,
        "pending": pending,
        "fraud_rate": fraud_rate
    })


# ======================================================
# MANUAL REVIEW (ADMIN ONLY)
# ======================================================
@api_view(['POST'])
@permission_classes([IsAdminUser])
def review_transaction(request):
    transaction_id = request.data.get("transaction_id")
    action = request.data.get("action")

    if action not in ["APPROVE", "BLOCK"]:
        return Response({"error": "Invalid action"}, status=400)

    try:
        prediction = Prediction.objects.get(transaction_id=transaction_id)
        prediction.decision = action
        prediction.reason = f"Manually {action}D by admin"
        prediction.model_version = "MANUAL"
        prediction.save()

        AuditLog.objects.create(
            user=request.user,
            action=f"REVIEW_{action}",
            transaction=prediction.transaction,
            details=f"Admin set decision to {action}"
        )

        return Response({"status": "success"})
    except Prediction.DoesNotExist:
        return Response({"error": "Prediction not found"}, status=404)


# ======================================================
# AUDIT LOGS (ADMIN ONLY)
# ======================================================
@api_view(['GET'])
@permission_classes([IsAdminUser])
def audit_logs_list(request):
    logs = AuditLog.objects.all().order_by('-timestamp')

    return Response([
        {
            "id": log.id,
            "user": log.user.username if log.user else "System",
            "action": log.action,
            "transaction": log.transaction.id if log.transaction else None,
            "details": log.details,
            "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }
        for log in logs
    ])
