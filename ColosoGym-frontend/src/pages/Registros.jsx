import React from 'react';
import {useState, useEffect} from "react";
import DataTable from 'react-data-table-component';
import FormCliente from "../components/clientes/FormCliente.jsx";
import ModalMembresia from "../components/suscripciones/ModalMembresia.jsx";

export default function Registros() {
    const customStyles = {
        table: {
            style: {
                backgroundColor: '#111111',
            },
        },
        headRow: {
            style: {
                backgroundColor: '#1a1a1a',
                borderBottomColor: '#374151',
                color: '#A51D21',
                fontWeight: 'bold',
                textTransform: 'uppercase',
            },
        },
        rows: {
            style: {
                backgroundColor: '#111111',
                color: '#D1D5DB',
                borderBottomColor: '#374151',
                '&:hover': {
                    backgroundColor: '#1f2937',
                    cursor: 'pointer',
                },
            },
        },
        pagination: {
            style: {
                backgroundColor: '#111111',
                color: '#9CA3AF',
                borderTopColor: '#374151',
            },
        },
    };

    const [isCreating, setIsCreating] = useState(false);
    const [clienteEditar, setClienteEditar] = useState([]);
    const [clienteEliminar, setClienteEliminar] = useState(null);
    const [statusR, setStatusR] = useState(null);
    const [eliminarC, setEliminarC] = useState(true);
    const [mostrarPago, setMostrarPago] = useState(false);
    const [clienteCreado, setClienteCreado] = useState(null);

    const [clients, setClients] = useState([]);
    const columns = [
        {
            name: 'id',
            selector: row => row.codigo_barra,
            sortable: true,
        },
        {
            name: 'Nombre Completo',
            selector: row => row.nombre_completo,
            sortable: true,
        },
        {
            name: 'Estado',
            selector: row => row.estado,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: row => (
                <div className="flex gap-2">
                    <button
                        className="bg-blue-900 text-blue-300 px-3 py-1 rounded hover:bg-blue-800 transition-colors"
                        onClick={() => {
                            setClienteEditar({
                                codigo_barra: row.codigo_barra,
                                nombre_completo: row.nombre_completo,
                                telefono_emergencia: row.telefono_emergencia,
                                notas_medicas: row.notas_medicas,
                            });
                            setIsCreating(true);
                        }}
                    >
                        Editar
                    </button>
                    <button
                        className="bg-red-900 text-red-300 px-3 py-1 rounded hover:bg-red-800 transition-colors"
                        onClick={() => {
                            setEliminarC(false);
                            setClienteEliminar(row.codigo_barra);
                        }}
                    >
                        Eliminar
                    </button>
                </div>
            )
        }
    ];

    const cargarClientes = () => {
        fetch("http://localhost:8000/api/clientes/")
            .then(res => res.json())
            .then(data => setClients(data))
    };

    const eliminarCliente = (id) => {

        fetch(`http://localhost:8000/api/clientes/${id}/`, {
            method: "DELETE",
        })
            .then(res => {
                if (res.ok) {
                    cargarClientes();
                    setStatusR("success")
                } else {
                    setStatusR("error");
                }
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        cargarClientes();
    }, []);

    return (
        <>
            {statusR === 'error' && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex flex-col gap-3 justify-center items-center font-bold">
                    🟡 Ha ocurrido un error, intente de nuevo.
                    <button className="bg-red-900 hover:cursor-pointer text-white font-bold px-8 py-2 rounded-md "
                            onClick={() => {
                                setStatusR(null)
                            }}
                    >Aceptar
                    </button>
                </div>
            )}

            {statusR === 'success' && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex flex-col gap-3 justify-center items-center font-bold">
                    Operación completada.
                    <button className="bg-red-900 hover:cursor-pointer text-white font-bold px-8 py-2 rounded-md "
                            onClick={() => {
                                setStatusR(null)
                            }}
                    >Aceptar
                    </button>
                </div>
            )}

            {!eliminarC && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex flex-col gap-3 justify-center items-center font-bold">
                    🟡 Estas seguro de eliminar el cliente?
                    <button className="bg-red-900 hover:cursor-pointer text-white font-bold px-8 py-2 rounded-md "
                            onClick={() => {
                                eliminarCliente(clienteEliminar)
                                setEliminarC(true)

                            }}
                    >Continuar

                    </button>

                    <button className="bg-red-900 hover:cursor-pointer text-white font-bold px-8 py-2 rounded-md "
                            onClick={() => {
                                setEliminarC(true)
                            }}
                    >Cancelar
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-4 p-5">
                <button
                    className={`px-4 py-2 rounded font-bold text-white transition-colors w-50 ${
                        isCreating ? 'bg-gray-600 hover:bg-gray-500' : 'bg-[#A51D21] hover:bg-red-800'
                    }`}
                    onClick={() => {
                        setIsCreating(!isCreating);
                        setClienteEditar(null)
                    }}
                >
                    {isCreating ? "← Regresar a la tabla" : "+ Nuevo Cliente"}
                </button>

                {mostrarPago && clienteCreado && (
                    <ModalMembresia
                        cliente={clienteCreado}
                        modo="registro"
                        onClose={() => {
                            setMostrarPago(false);
                        }}
                        onSuccess={() => {
                            setMostrarPago(false);
                            cargarClientes()
                            setStatusR("success")
                        }}
                    />
                )}

                {isCreating ? (
                    <FormCliente onSuccess={(clienteCreado) => {
                        setIsCreating(false);
                        setClienteCreado(clienteCreado)
                        setMostrarPago(true)
                        cargarClientes();
                    }} clienteEditar={clienteEditar}/>

                ) : (
                    <DataTable columns={columns} data={clients} pagination customStyles={customStyles}/>
                )}
            </div>
        </>
    )
}