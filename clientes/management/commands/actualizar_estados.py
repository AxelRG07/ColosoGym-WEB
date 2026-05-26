from django.core.management.base import BaseCommand
from django.utils import timezone
from clientes.models import Membresiacliente, Cliente


class Command(BaseCommand):
    help = 'Revisa las membresías y cambia a Inactivo a los clientes con fecha vencida'

    def handle(self, *args, **kwargs):
        hoy = timezone.now().date()

        membresias_vencidas = Membresiacliente.objects.filter(
            fecha_fin__lt=hoy,
            estado_membresia='Vigente'
        )

        contador = 0

        for membresia in membresias_vencidas:
            membresia.estado_membresia = 'Vencida'
            membresia.save()

            cliente = membresia.cliente
            cliente.estado = 'Inactivo'
            cliente.save()

            contador += 1

        self.stdout.write(self.style.SUCCESS(f'Éxito: Se desactivaron {contador} clientes el día de hoy.'))