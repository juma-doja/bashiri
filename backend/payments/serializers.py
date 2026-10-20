from rest_framework import serializers
from .models import Subscription, Transaction


# Serializer for converting transaction data to JSON
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        # Fields to include in the transaction response
        fields = [
            "id", "plan", "amount_tzs", "phone_number", "checkout_request_id",
            "status", "mpesa_receipt_number", "result_desc", "created_at",
        ]
        # All fields are read-only
        read_only_fields = fields


# Serializer for converting subscription data to JSON
class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        # Fields to include in the subscription response
        fields = [
            "id", "plan", "amount_tzs", "starts_at",
            "ends_at", "is_active", "created_at"
        ]
        # All fields are read-only
        read_only_fields = fields
