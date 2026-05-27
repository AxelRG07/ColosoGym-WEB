from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Cliente, PlanSuscripcion
from .serializers import *
from rest_framework.filters import SearchFilter

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    filter_backends = [SearchFilter]

    search_fields = ['codigo_barra', 'nombre_completo']

class PlanSuscripcionViewSet(viewsets.ModelViewSet):
    queryset = PlanSuscripcion.objects.all()
    serializer_class = PlanSuscripcionSerializer

class MembresiaclienteViewSet(viewsets.ModelViewSet):
    queryset = Membresiacliente.objects.all()
    serializer_class = MembresiaClienteSerializer

class AsistenciasViewSet(viewsets.ModelViewSet):
    queryset = Asistencias.objects.all().order_by('-fecha_hora')[:5]
    serializer_class = AsistenciasSerializer

class ProductosViewSet(viewsets.ModelViewSet):
    queryset = Productos.objects.all()
    serializer_class = ProductosSerializer


class VentasViewSet(viewsets.ModelViewSet):
    queryset = Ventas.objects.all().order_by('-fecha_hora')
    serializer_class = VentasSerializer

    @action(detail=False, methods=['get'])
    def corte_caja(self, request):
        fecha_solicitada = request.query_params.get('fecha')

        if not fecha_solicitada:
            return Response({"error": "Por favor, proporciona una fecha."}, status=400)

        ventas_del_dia = Ventas.objects.filter(fecha_hora__date=fecha_solicitada)

        total_general = ventas_del_dia.aggregate(total_suma=Sum('total'))['total_suma'] or 0.00

        total_efectivo = ventas_del_dia.filter(metodo_pago='Efectivo').aggregate(suma=Sum('total'))['suma'] or 0.00
        total_tarjeta = ventas_del_dia.filter(metodo_pago='Tarjeta').aggregate(suma=Sum('total'))['suma'] or 0.00

        return Response({
            "fecha": fecha_solicitada,
            "total_general": float(total_general),
            "efectivo": float(total_efectivo),
            "tarjeta": float(total_tarjeta),
            "transacciones": list(ventas_del_dia.values('id', 'total', 'metodo_pago', 'fecha_hora'))
        })

class DetalleVentaViewSet(viewsets.ModelViewSet):
    queryset = DetalleVenta.objects.all()
    serializer_class = DetalleVentaSerializer

    @action(detail=False, methods=['get'])
    def top_productos(self, request):
        ranking = DetalleVenta.objects.values('producto__nombre_producto').annotate(
            total_vendido=Sum('cantidad')
        ).order_by('total_vendido')[:5]

        datos = [
            {
                "producto": item['producto__nombre_producto'],
                "ventas": item['total_vendido']
            }
            for item in ranking
        ]

        return Response(datos)