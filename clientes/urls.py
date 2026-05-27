from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'membresias', MembresiaclienteViewSet)
router.register(r'planes', PlanSuscripcionViewSet)
router.register(r'asistencias', AsistenciasViewSet)
router.register(r'productos', ProductosViewSet)
router.register(r'ventas', VentasViewSet)
router.register(r'detalles-ventas', DetalleVentaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]