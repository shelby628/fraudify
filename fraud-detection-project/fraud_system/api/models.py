
from django.db import models
from django.contrib.auth.models import User

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    step = models.IntegerField()
    amount = models.FloatField()
    oldbalanceOrg = models.FloatField()
    newbalanceOrig = models.FloatField()
    oldbalanceDest = models.FloatField()
    newbalanceDest = models.FloatField()

    type_CASH_OUT = models.BooleanField()
    type_DEBIT = models.BooleanField()
    type_PAYMENT = models.BooleanField()
    type_TRANSFER = models.BooleanField()
    decision = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction {self.id} by {self.user.username}"

class Prediction(models.Model):
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE)

    stage1_probability = models.FloatField(null=True, blank=True)
    stage2_probability = models.FloatField(null=True, blank=True)

    decision = models.CharField(
        max_length=10,
        choices=[
            ('APPROVE', 'APPROVE'),
            ('REVIEW', 'REVIEW'),
            ('BLOCK', 'BLOCK')
        ]
    )

    stage = models.CharField(max_length=20)
    reason = models.TextField()

    model_version = models.CharField(max_length=20, default="v1.0")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prediction for Transaction {self.transaction.id}"


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50)  # e.g., 'PREDICT', 'REVIEW_APPROVE', 'REVIEW_BLOCK'
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, null=True, blank=True)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} by {self.user} at {self.timestamp}"
