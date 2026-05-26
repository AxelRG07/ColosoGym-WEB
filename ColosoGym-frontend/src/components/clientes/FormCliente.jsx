import React, {useEffect, useState} from 'react';

export default function FormCliente( {onSuccess, clienteEditar} ) {

    const [cliente, setCliente] = useState({
        nombre_completo: '',
        telefono_emergencia: '',
        notas_medicas: '',
        estado: 'Activo',
    });

    useEffect(() => {
    if (clienteEditar) {
        setCliente(clienteEditar);
    } else {
        setCliente({
            nombre_completo: '',
            telefono_emergencia: '',
            notas_medicas: '',
            estado: 'Activo'
        });
    }
}, [clienteEditar]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = clienteEditar ?
            `http://localhost:8000/api/clientes/${cliente.codigo_barra}/` :
            'http://localhost:8000/api/clientes/';

        const method= clienteEditar ?
            'PUT' : 'POST'
        ;

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cliente)
        })
            .then(async res => {
                if (!res.ok) {
                    const errorData = await res.json();
                    console.error("Detalles del rechazo de Django:", errorData);
                    throw new Error('Petición rechazada');
                }
                return res.json();
            })
            .then(data => {
                console.log("Éxito:", data);
                alert("cliente enviado");
                onSuccess();
            })
            .catch(err => console.log("Hubo un problema:", err));
    }

    return (

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 justify-start">

            <label htmlFor="nombre">Nombre Completo</label>
            <input id="nombre" className="border-gray-500 border rounded-md p-2" type="text" value={cliente.nombre_completo}
                   onChange={e =>
                       setCliente({...cliente, nombre_completo: e.target.value})}/>

            <label htmlFor="tel">Telefono de emergencia</label>
            <input id="tel" className="border-gray-500 border rounded-md p-2" type="text" value={cliente.telefono_emergencia}
                   onChange={e =>
                       setCliente({...cliente, telefono_emergencia: e.target.value})}/>

            <label htmlFor="notas">Notas medicas</label>
            <input id="notas" className="border-gray-500 border rounded-md p-2" type="text" value={cliente.notas_medicas}
                   onChange={e =>
                       setCliente({...cliente, notas_medicas: e.target.value})}
            />

            <label htmlFor="estado">Membresia</label>
            <select className="border-gray-500 border rounded-md p-2" name="estado" id="estado" onChange={e => {
                setCliente({...cliente, estado: e.target.value});
            }}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
            </select>


            <button className="w-36 bg-red-900 p-2 rounded-md" type="submit">Enviar</button>
        </form>

    )
}