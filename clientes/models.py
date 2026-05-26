from xmlrpc.client import Boolean

from django.db import models

class Cliente(models.Model):
    ESTADOS_CHOICES = [
        ('Activo', 'Activo'),
        ('Inactivo', 'Inactivo'),
    ]

    codigo_barra = models.CharField(primary_key=True, max_length=20, unique=True, blank=True)
    nombre_completo = models.CharField(max_length=150)
    telefono_emergencia = models.CharField(max_length=20)
    notas_medicas = models.TextField(null=True, blank=True)
    estado = models.CharField(max_length=15, choices=ESTADOS_CHOICES, default='Activo')
    fecha_registro = models.DateField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.codigo_barra:
            ultimo_cliente = Cliente.objects.order_by('-codigo_barra').first()

            if ultimo_cliente and ultimo_cliente.codigo_barra:
                try:
                    ultimo_numero = int(ultimo_cliente.codigo_barra.split('-')[1])
                    siguiente_numero = ultimo_numero + 1
                except (IndexError, ValueError):
                    siguiente_numero = 1
            else:
                siguiente_numero = 1

            self.codigo_barra = f"CG-{str(siguiente_numero).zfill(3)}"

        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre_completo

class PlanSuscripcion(models.Model):

    ESTADOS_CHOICES = [
        ('Activo', 'Activo'),
        ('Inactivo', 'Inactivo'),
    ]

    nombre_plan = models.CharField(max_length=50)
    duracion_dias = models.IntegerField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=15, choices=ESTADOS_CHOICES, default='Activo')

    def __str__(self):
        return self.nombre_plan + ' - ' + self.estado

class Membresiacliente(models.Model):

    ESTADOS_CHOICES = [
        ('Vigente', 'Vigente'),
        ('Vencida', 'Vencida'),
        ('Cancelada', 'Cancelada'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    plan_suscripcion = models.ForeignKey(PlanSuscripcion, on_delete=models.CASCADE)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    monto_pagado = models.DecimalField(max_digits=10, decimal_places=2)
    estado_membresia = models.CharField(max_length=15, choices=ESTADOS_CHOICES, default='Vigente')

    def __str__(self):
        return self.cliente.nombre_completo + ' - ' + self.plan_suscripcion.nombre_plan