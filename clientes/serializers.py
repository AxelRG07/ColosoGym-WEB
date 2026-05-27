from rest_framework import serializers
from .models import *
from django.db import transaction

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

class AsistenciasSerializer(serializers.ModelSerializer):
    nombre_cliente = serializers.CharField(source='cliente.nombre_completo', read_only=True)
    class Meta:
        model = Asistencias
        fields = '__all__'

class ProductosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Productos
        fields = '__all__'

class DetalleVentaSerializer(serializers.ModelSerializer):
    nombre_producto = serializers.CharField(source='producto.nombre_producto', read_only=True)

    class Meta:
        model = DetalleVenta
        fields = ['id', 'producto', 'nombre_producto', 'cantidad', 'precio_unitario', 'subtotal']


class VentasSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True)

    class Meta:
        model = Ventas
        fields = ['id', 'total', 'metodo_pago', 'fecha_hora', 'detalles']

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')

        with transaction.atomic():
            venta = Ventas.objects.create(**validated_data)

            for detalle in detalles_data:
                producto = detalle['producto']
                cantidad = detalle['cantidad']

                if producto.stock < cantidad:
                    raise serializers.ValidationError({
                        "inventario": f"Stock insuficiente para {producto.nombre_producto}. Disponible: {producto.stock}"
                    })

                producto.stock -= cantidad
                producto.save()

                DetalleVenta.objects.create(venta=venta, **detalle)

            return venta