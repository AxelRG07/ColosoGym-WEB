import React, {useEffect, useState} from 'react';
import {MdAdfScanner} from "react-icons/md";

export default function Acceso() {
    const [busqueda, setBusqueda] = useState('');
    const [statusAcceso, setStatusAcceso] = useState(null); // 'autorizado', 'vencido', 'no_existe'
    const [clienteActual, setClienteActual] = useState(null);
    const [planes, setPlanes] = useState([]);
    const [planSeleccionado, setPlanSeleccionado] = useState('');

    const cargarPlanes = () => {
        fetch("http://localhost:8000/api/planes/")
            .then(res => res.json())
            .then(data => setPlanes(data))
    };

    useEffect(() => {
        cargarPlanes()
    }, []);

    const planElegido = planes.find((p) => p.id === parseInt(planSeleccionado));
    const montoAPagar = planElegido ? planElegido.precio : 0;

    const verificarAcceso = () => {
        if (!busqueda.trim()) return;

        fetch(`http://localhost:8000/api/clientes/?search=${busqueda}`)
            .then(res => {
                if (!res.ok) throw new Error('Error en la conexión');
                return res.json();
            })
            .then(data => {
                if (data.length === 0) {
                    setStatusAcceso('no_existe');
                    setClienteActual(null);
                } else {
                    const clienteEncontrado = data[0];
                    setClienteActual(clienteEncontrado);

                    if (clienteEncontrado.estado === 'Activo') {
                        setStatusAcceso('autorizado');
                    } else {
                        setStatusAcceso('vencido');
                    }
                }
                setBusqueda('');
            })
            .catch(err => {
                console.error(err);
                setStatusAcceso('no_existe');
                setClienteActual(null);
            });
    };

    const procesarPago = async () => {
        const fechaInicio = new Date();

        const fechaFin = new Date();
        fechaFin.setDate(fechaInicio.getDate() + planElegido.duracion_dias);

        const strFechaInicio = fechaInicio.toISOString().split('T')[0];
        const strFechaFin = fechaFin.toISOString().split('T')[0];

        const datosMembresia = {
            cliente: clienteActual.codigo_barra,
            plan_suscripcion: planElegido.id,
            fecha_inicio: strFechaInicio,
            fecha_fin: strFechaFin,
            monto_pagado: montoAPagar,
            estado_membresia: 'Vigente'
        }

        const datosCliente = {estado: 'Activo'};

        try {
            const resMembresia = await fetch("http://localhost:8000/api/membresias/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datosMembresia),
            });

            if (!resMembresia.ok) {
                const detallesError = await resMembresia.json();
                console.error(planElegido);
                console.error("Django dice que el error está en:", detallesError);
                throw new Error("Error al renovar la membresía");
            }

            const resCliente = await fetch(`http://localhost:8000/api/clientes/${clienteActual.codigo_barra}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datosCliente),
            });

            if (!resCliente.ok) {
                throw new Error("Error al actualizar cliente");
            }

            setStatusAcceso('renovado');
            setPlanSeleccionado(null);
            setBusqueda('')


        } catch (error) {
            console.error("Error en la transacción:", error);
            alert("Hubo un problema procesando el pago. Intenta de nuevo.");
        }
    };

    const limpiarPantalla = () => {
        setBusqueda('');
        setStatusAcceso(null);
        setClienteActual(null);
    };

    return (
        <main className="w-full flex flex-col gap-5 justify-center p-8">
            <div className="">
                <h1 className="text-4xl font-bold">ACCESO / CHECK-IN</h1>
                <h3 className="text-red-900 font-bold">CONTROL DE ENTRADA</h3>
            </div>

            <div className="bg-[#171717] flex flex-col gap-3 border p-4 border-gray-500 rounded-md">
                <h2 className="text-red-900 font-bold flex gap-2 items-center-safe">
                    <span><MdAdfScanner/></span>ESCRIBIR CÓDIGO O NOMBRE
                </h2>

                <input
                    className="border-gray-500 border rounded-md p-2 bg-black text-white"
                    type="text"
                    placeholder="ID del miembro o nombre..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && verificarAcceso()} // Permite buscar con Enter
                />

                <div className="flex items-center gap-2">
                    <button
                        onClick={verificarAcceso}
                        className="bg-red-800 hover:bg-red-700 text-white font-bold p-2 rounded-md transition-colors"
                    >
                        VERIFICAR ACCESO
                    </button>

                    <button
                        onClick={limpiarPantalla}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold p-2 rounded-md transition-colors"
                    >
                        LIMPIAR
                    </button>
                </div>
            </div>

            {statusAcceso === 'autorizado' && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex flex-col gap-3 justify-center items-center font-bold">
                    🟢 ACCESO AUTORIZADO: {clienteActual?.nombre_completo}
                    <button className="bg-red-900 hover:cursor-pointer text-white font-bold px-8 py-2 rounded-md "
                            onClick={() => {
                                setStatusAcceso(null)
                            }}
                    >Aceptar
                    </button>
                </div>
            )}

            {statusAcceso === 'renovado' && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex flex-col gap-3 justify-center items-center font-bold">
                    🟢 Transacción Completada
                    <button className="bg-red-900 hover:cursor-pointer text-white font-bold px-8 py-2 rounded-md "
                            onClick={() => {
                                setStatusAcceso(null)
                            }}
                    >Aceptar
                    </button>
                </div>
            )}

            {statusAcceso === 'vencido' && (
                <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
                    <div
                        className="bg-[#171717] border-2 border-red-800 p-8 rounded-lg flex flex-col gap-4 max-w-md w-full text-center shadow-[0_0_15px_rgba(153,27,27,0.5)]">
                        <h2 className="text-3xl font-bold text-red-600">🔴 ACCESO DENEGADO</h2>
                        <p className="text-2xl text-white font-bold">{clienteActual?.nombre_completo}</p>
                        <p className="text-red-400">La membresía de este socio se encuentra inactiva.</p>

                        <div className="bg-black p-6 rounded border border-gray-700 my-2">
                            <label className="text-gray-400 text-sm font-bold mb-2 block">
                                RENOVACIÓN EXPRESS
                            </label>

                            <select
                                value={planSeleccionado}
                                onChange={(e) => setPlanSeleccionado(e.target.value)}
                                className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-600 focus:border-red-500 outline-none">
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

                            <button onClick={procesarPago}
                                    className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full mt-4 transition-colors">
                                Procesar Pago y Reactivar
                            </button>
                        </div>

                        <div className="flex justify-center mt-2">
                            <button
                                onClick={() => setStatusAcceso(null)}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-8 rounded-md transition-colors w-full"
                            >
                                CERRAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {statusAcceso === 'no_existe' && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex flex-col gap-3 justify-center items-center font-bold">
                    🟡 SOCIO NO ENCONTRADO
                    <button className="bg-red-900 hover:cursor-pointer text-white font-bold px-8 py-2 rounded-md "
                            onClick={() => {
                                setStatusAcceso(null)
                            }}
                    >Aceptar
                    </button>
                </div>
            )}

            <div className="p-4 border border-dashed border-gray-600 mt-4">
                {statusAcceso === null && <p className="text-gray-500">Esperando escaneo...</p>}
            </div>

            <div>
                <h3 className="font-bold">REGISTROS RECIENTES</h3>
            </div>
        </main>
    );
}