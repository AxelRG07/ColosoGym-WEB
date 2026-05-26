from rest_framework import viewsets
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