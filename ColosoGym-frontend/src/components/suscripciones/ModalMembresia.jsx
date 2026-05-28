import React, {useState, useEffect} from 'react';

const ModalMembresia = ({cliente, modo, onClose, onSuccess}) => {
    const [planes, setPlanes] = useState([]);
    const [planSeleccionado, setPlanSeleccionado] = useState("");
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        const cargarPlanes = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/planes/");
                const data = await res.json();
                setPlanes(data);
            } catch (error) {
                console.error("Error al cargar planes:", error);
            }
        };
        cargarPlanes();
    }, []);

    const planElegido = planes.find(p => p.id.toString() === planSeleccionado.toString());
    const montoAPagar = planElegido ? planElegido.precio : 0;

    const procesarPago = async () => {
        if (!planElegido) return;
        setProcesando(true);

        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaInicio.getDate() + planElegido.duracion_dias);

        const strFechaInicio = fechaInicio.toISOString().split('T')[0];
        const strFechaFin = fechaFin.toISOString().split('T')[0];

        const datosMembresia = {
            cliente: cliente.codigo_barra,
            plan_suscripcion: planElegido.id,
            fecha_inicio: strFechaInicio,
            fecha_fin: strFechaFin,
            monto_pagado: montoAPagar,
            estado_membresia: 'Vigente'
        };

        const datosCliente = {estado: 'Activo'};

        try {
            const resMembresia = await fetch("http://localhost:8000/api/membresias/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(datosMembresia),
            });

            if (!resMembresia.ok) {
                const detallesError = await resMembresia.json();
                console.error("🚨 DRF dice que el error está en:", detallesError);
                throw new Error("Error al renovar la membresía");
            }

            const resCliente = await fetch(`http://localhost:8000/api/clientes/${cliente.codigo_barra}/`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(datosCliente),
            });

            if (!resCliente.ok) throw new Error("Error al actualizar cliente");

            onSuccess();

        } catch (error) {
            console.error("Error en la transacción:", error);
            alert("Hubo un error al procesar el pago");
        } finally {
            setProcesando(false);
        }
    };

    const esAcceso = modo === 'acceso';

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div
                className={`bg-[#171717] border-2 p-8 rounded-lg flex flex-col gap-4 max-w-md w-full text-center ${esAcceso ? 'border-red-800 shadow-[0_0_15px_rgba(153,27,27,0.5)]' : 'border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]'}`}>

                <h2 className={`text-3xl font-bold ${esAcceso ? 'text-red-600' : 'text-blue-500'}`}>
                    {esAcceso ? '🔴 ACCESO DENEGADO' : '🟢 NUEVO CLIENTE'}
                </h2>

                <p className="text-2xl text-white font-bold">{cliente?.nombre_completo}</p>

                <p className={esAcceso ? 'text-red-400' : 'text-gray-400'}>
                    {esAcceso ? 'La membresía de este socio se encuentra inactiva.' : 'Asigna la membresía inicial para activar la cuenta.'}
                </p>

                <div className="bg-black p-6 rounded border border-gray-700 my-2">
                    <label className="text-gray-400 text-sm font-bold mb-2 block">
                        SELECCIONAR PLAN
                    </label>

                    <select
                        value={planSeleccionado}
                        onChange={(e) => setPlanSeleccionado(e.target.value)}
                        className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-600 outline-none focus:border-blue-500">
                        <option value="">-- Selecciona un plan --</option>
                        {planes.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                                {plan.nombre_plan} - ${plan.precio}
                            </option>
                        ))}
                    </select>

                    <div
                        className="flex justify-between items-center bg-gray-900 p-3 rounded mt-2 border border-gray-600">
                        <span className="text-gray-400 font-bold">Total a cobrar:</span>
                        <span className="text-2xl text-green-500 font-bold">${montoAPagar}</span>
                    </div>

                    <button
                        onClick={procesarPago}
                        disabled={!planSeleccionado || procesando}
                        className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded w-full mt-4 transition-colors">
                        {procesando ? 'Procesando...' : 'Procesar Pago y Activar'}
                    </button>
                </div>

                <div className="flex justify-center mt-2">
                    <button
                        onClick={onClose}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-8 rounded-md transition-colors w-full">
                        {esAcceso ? 'CERRAR' : 'OMITIR POR AHORA'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalMembresia;