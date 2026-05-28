import React, {useEffect, useState} from 'react';
import {MdAdfScanner} from "react-icons/md";
import ModalMembresia from "../components/suscripciones/ModalMembresia.jsx";

export default function Acceso() {
    const [busqueda, setBusqueda] = useState('');
    const [statusAcceso, setStatusAcceso] = useState(null);
    const [clienteActual, setClienteActual] = useState(null);
    const [btnVerificar, setBtnVerificar] = useState(false);

    const [resultados, setResultados] = useState([]);

    const [asistencias, setAsistencias] = useState([]);

    const cargarAsistencias = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/asistencias/");

            if (!res.ok) {
                throw new Error("Error al obtener el historial");
            }

            const data = await res.json();

            setAsistencias(data);

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        cargarAsistencias()
    }, []);


    const registrarAsistencia = async (codigoCliente, concedido) => {
        try {
            await fetch("http://localhost:8000/api/asistencias/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cliente: codigoCliente,
                    acceso_concedido: concedido
                }),
            });
            await cargarAsistencias()
        } catch (error) {
            console.error("Error al guardar el registro de asistencia:", error);
        }
    };

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
                        registrarAsistencia(clienteEncontrado.codigo_barra, true);
                    } else {
                        setStatusAcceso('vencido');
                        registrarAsistencia(clienteEncontrado.codigo_barra, false);
                    }
                }
                setBtnVerificar(false)
                setBusqueda('');
            })
            .catch(err => {
                console.error(err);
                setStatusAcceso('no_existe');
                setClienteActual(null);
            });
    };

    const buscarClientes = async () => {
        if (!busqueda.trim()) return;

        try {
            // Ajusta la URL según cómo maneje DRF tus búsquedas
            const response = await fetch(`http://localhost:8000/api/clientes/?search=${busqueda}`);

            if (response.ok) {
                const data = await response.json();
                // Tomamos solo los primeros 10 resultados por seguridad
                const top10 = data.slice(0, 10);

                setResultados(top10);

                // Si no hay resultados, avisamos
                if (top10.length === 0) {
                    alert("No se encontraron clientes con ese nombre o ID.");
                }
            }
        } catch (error) {
            console.error("Error al buscar clientes:", error);
        }
    };

    const handleSeleccion = (e) => {
        const idSeleccionado = e.target.value;
        const cliente = resultados.find(c => c.codigo_barra.toString() === idSeleccionado);

        if (cliente) {
            setBtnVerificar(true)
            setBusqueda(`${cliente.codigo_barra} - ${cliente.nombre_completo}`); // O puedes poner cliente.nombre_completo según prefieras
            setResultados([]);
        }
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
                    onChange={e => {
                        setBusqueda(e.target.value);
                        setClienteSeleccionado(null);
                        setBtnVerificar(false)
                    }
                    }
                    onKeyDown={e => e.key === 'Enter' && buscarClientes()}
                />

                {resultados.length > 0 && (
                    <div className="mb-4">
                        <label className="text-gray-400 text-xs mb-1 block">Selecciona el cliente correcto:</label>
                        <select
                            onChange={
                                handleSeleccion
                            }
                            className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700 outline-none focus:border-blue-500"
                            defaultValue=""
                        >
                            <option value="" disabled>-- Selecciona un cliente ({resultados.length} encontrados) --
                            </option>
                            {resultados.map(cliente => (
                                <option key={cliente.codigo_barra} value={cliente.codigo_barra}>
                                    {cliente.nombre_completo} - ID: {cliente.codigo_barra}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {btnVerificar && (
                        <button
                            onClick={verificarAcceso}
                            className="bg-red-800 hover:bg-red-700 text-white font-bold p-2 rounded-md transition-colors"
                        >
                            VERIFICAR ACCESO
                        </button>
                    )}

                    <button
                        onClick={buscarClientes}
                        disabled={busqueda.length === 0}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold disabled disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-md transition-colors"
                    >
                        BUSCAR
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
                <ModalMembresia
                    cliente={clienteActual}
                    modo="acceso"
                    onClose={() => setStatusAcceso(null)}
                    onSuccess={() => {
                        setStatusAcceso('renovado');
                        setBusqueda('');
                    }}
                />
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

            {statusAcceso === 'error' && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex flex-col gap-3 justify-center items-center font-bold">
                    🟡 Ha ocurrido un error, intentalo de nuevo.
                    <button className="bg-red-900 hover:cursor-pointer text-white font-bold px-8 py-2 rounded-md "
                            onClick={() => {
                                setStatusAcceso(null)
                            }}
                    >Aceptar
                    </button>
                </div>
            )}

            <div className="bg-[#171717] flex flex-col gap-3 border p-4 border-gray-500 rounded-md">
                <h3 className="font-bold">REGISTROS RECIENTES</h3>
                {asistencias.map(asistencia => (
                    <div
                        key={asistencia.id}
                        className="bg-[#292929] flex flex-col gap-1 border-l-4 p-3 border-gray-600 rounded-md shadow-sm"
                        style={{
                            borderLeftColor: asistencia.acceso_concedido ? '#22c55e' : '#ef4444'
                        }}
                    >
                        <p className="text-white font-bold">
                            Socio: {asistencia.cliente} - {asistencia.nombre_cliente}
                        </p>

                        <div className="flex justify-between text-sm">
                <span className={asistencia.acceso_concedido ? "text-green-500" : "text-red-500"}>
                    {asistencia.acceso_concedido ? "✅ Autorizado" : "❌ Denegado"}
                </span>
                            <span className="text-gray-400">
                    {new Date(asistencia.fecha_hora).toLocaleTimeString()}
                </span>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}