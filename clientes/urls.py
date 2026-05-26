from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, MembresiaclienteViewSet, PlanSuscripcionViewSet

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'membresias', MembresiaclienteViewSet)
router.register(r'planes', PlanSuscripcionViewSet)


urlpatterns = [
    path('', include(router.urls)),
]