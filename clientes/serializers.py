from rest_framework import serializers
from .models import Cliente, PlanSuscripcion, Membresiacliente


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class PlanSuscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanSuscripcion
        fields = '__all__'

class MembresiaClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membresiacliente
        fields = '__all__'