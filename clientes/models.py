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