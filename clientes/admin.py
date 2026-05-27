from django.contrib import admin

from clientes.models import *

# Register your models here.
admin.site.register(Cliente)
admin.site.register(PlanSuscripcion)
admin.site.register(Membresiacliente)
admin.site.register(Productos)
admin.site.register(Ventas)
admin.site.register(DetalleVenta)
admin.site.register(Asistencias)

