from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Transaction, Prediction

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = "__all__"

class TransactionSerializer(serializers.ModelSerializer):
    prediction = PredictionSerializer(read_only=True)  # nested prediction

    class Meta:
        model = Transaction
        fields = [
            "id", "user", "amount", "step", "oldbalanceOrg", "newbalanceOrig",
            "oldbalanceDest", "newbalanceDest", "decision", "created_at", "prediction"
        ]

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'confirm_password')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password') # Remove confirm_password as it's not a model field
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_active=True # Explicitly set user as active
        )
        return user
