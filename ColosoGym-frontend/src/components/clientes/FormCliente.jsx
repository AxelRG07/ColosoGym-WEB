import React, {useEffect, useState} from 'react';

export default function FormCliente({onSuccess, clienteEditar}) {

    const [cliente, setCliente] = useState({
        nombre_completo: '',
        telefono_emergencia: '',
        notas_medicas: '',
        estado: 'Inactivo'
    });
    const [status, setStatus] = useState(null)

    useEffect(() => {
        if (clienteEditar) {
            setCliente(clienteEditar);
        } else {
            setCliente({
                nombre_completo: '',
                telefono_emergencia: '',
                notas_medicas: '',
            });
        }
    }, [clienteEditar]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = clienteEditar ?
            `http://localhost:8000/api/clientes/${cliente.codigo_barra}/` :
            'http://localhost:8000/api/clientes/';

        const method = clienteEditar ?
            'PUT' : 'POST'
        ;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cliente)
            });
            if (response.ok) {
                const nuevoCliente = await response.json();
                onSuccess(nuevoCliente);
            } else {
                const errorData = await res.json();
                console.error("Detalles del rechazo de Django:", errorData);
                throw new Error('Petición rechazada');

            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            {status === 'success' && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex flex-col gap-3 justify-center items-center font-bold">
                    🟢 Cliente registrado.
                    <button className="bg-red-900 hover:cursor-pointer text-white font-bold px-8 py-2 rounded-md "
                            onClick={() => {
                                setStatus(null)
                            }}
                    >Aceptar
                    </button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 justify-start">

                <label htmlFor="nombre">Nombre Completo</label>
                <input id="nombre" className="border-gray-500 border rounded-md p-2" type="text"
                       value={cliente.nombre_completo}
                       onChange={e =>
                           setCliente({...cliente, nombre_completo: e.target.value})}/>

                <label htmlFor="tel">Telefono de emergencia</label>
                <input id="tel" className="border-gray-500 border rounded-md p-2" type="text"
                       value={cliente.telefono_emergencia}
                       onChange={e =>
                           setCliente({...cliente, telefono_emergencia: e.target.value})}/>

                <label htmlFor="notas">Notas medicas</label>
                <input id="notas" className="border-gray-500 border rounded-md p-2" type="text"
                       value={cliente.notas_medicas}
                       onChange={e =>
                           setCliente({...cliente, notas_medicas: e.target.value})}
                />

                <button className="w-36 bg-red-900 p-2 rounded-md" type="submit">Enviar</button>
            </form>
        </>
    )
}