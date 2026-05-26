from django.contrib import admin

from clientes.models import *

# Register your models here.
admin.site.register(Cliente)
admin.site.register(PlanSuscripcion)
admin.site.register(Membresiacliente)

