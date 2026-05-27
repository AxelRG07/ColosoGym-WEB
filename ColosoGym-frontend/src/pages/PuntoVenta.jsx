import React, {useEffect, useState} from 'react';
import {MdInventory} from "react-icons/md";
import {data} from "react-router-dom";
import {FaShoppingCart, FaSearch, FaTrash, FaPlus, FaMinus} from "react-icons/fa";
import Inventario from '../components/productos/Inventario';

export default function PuntoVenta() {

    const [busqueda, setBusqueda] = useState('');
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [productos, setProductos] = useState([]);
    const [vistaActiva, setVistaActiva] = useState('puntoVenta');
    const [statusVenta, setStatusVenta] = useState('');

    const cargarProductos = () => {
        fetch("http://localhost:8000/api/productos/")
            .then(res => res.json())
            .then(data => setProductos(data))
    };

    useEffect(() => {
        cargarProductos()
    }, []);

    const agregarProducto = (productoNuevo) => {
        const productoExistente = productosSeleccionados.find(
            (item) => item.id === productoNuevo.id
        );
        if (productoExistente) {
            const nuevoCarrito = productosSeleccionados.map((item) => {
                if (item.id === productoNuevo.id) {
                    return {...item, cantidad: item.cantidad + 1};
                }
                return item;
            });
            setProductosSeleccionados(nuevoCarrito);
        } else {
            setProductosSeleccionados([...productosSeleccionados, {...productoNuevo, cantidad: 1}]);
        }
    };

    const restarProducto = (id) => {
        const nuevoCarrito = productosSeleccionados.map((item) => {
            if (item.id === id && item.cantidad > 1) {
                return {...item, cantidad: item.cantidad - 1};
            }
            return item;
        });
        setProductosSeleccionados(nuevoCarrito);
    };

    const eliminarProducto = (id) => {
        const nuevoCarrito = productosSeleccionados.filter((item) => item.id !== id);
        setProductosSeleccionados(nuevoCarrito);
    };

    const totalPagar = productosSeleccionados.reduce(
        (sum, item) => sum + (item.precio_venta * item.cantidad),
        0
    );

    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const procesarPago = async () => {
        const detallesFormateados = productosSeleccionados.map((item) => {
            return {
                producto: item.id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_venta,
                subtotal: (item.cantidad * item.precio_venta),
            };
        });

        try {
            const response = await fetch("http://localhost:8000/api/ventas/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    total: totalPagar,
                    metodo_pago: metodoPago,
                    detalles: detallesFormateados,
                }),
            });
            if (response.ok) {
                setStatusVenta('completada')
                setProductosSeleccionados([])
                cargarProductos()
            } else {
                console.log("Error al guardar la venta");
            }
        } catch (error) {
            console.error("Error al procesar la compra:", error);
        }
    }

    return (
        <main className="min-h-screen bg-[#0f0f0f] text-white p-6 font-sans">
            <div className="mb-6">
                <h1 className="text-3xl font-black tracking-wider">INVENTARIO Y VENTAS</h1>
                <h3 className="text-red-600 font-bold tracking-widest text-sm mt-1">
                    GESTIÓN DE PRODUCTOS — PUNTO DE VENTA
                </h3>
            </div>

            <div className="flex gap-6 border-b border-gray-800 mb-6 pb-2">
                <button
                    onClick={() => setVistaActiva('inventario')}
                    className={`flex items-center gap-2 font-bold text-gray-400 hover:text-white transition-colors
                    ${vistaActiva === 'inventario' ? 'border-b-2 border-red-600' : ''}`}>
                    <MdInventory/> INVENTARIO
                </button>
                <button
                    onClick={() => setVistaActiva('puntoVenta')}
                    className={`flex items-center gap-2 font-bold text-gray-400 hover:text-white transition-colors
                    ${vistaActiva === 'puntoVenta' ? 'border-b-2 border-red-600' : ''}`}>
                    <FaShoppingCart/> PUNTO DE VENTA
                </button>
            </div>

            {vistaActiva === 'puntoVenta' ? (
                <div className="flex gap-6 items-start">

                <div className="flex-1 flex flex-col gap-5">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-3.5 text-gray-400"/>
                        <input
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar producto"
                            className="w-full bg-[#171717] border border-gray-800 rounded-md py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {productos
                            .filter(p => p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()))
                            .map((producto) => {
                                const enCarrito = productosSeleccionados.find(item => item.id === producto.id);
                                const cantidadEnCarrito = enCarrito ? enCarrito.cantidad : 0;

                                return (
                                    <div
                                        key={producto.id}
                                        onClick={() => agregarProducto(producto)}
                                        className={`relative bg-[#171717] border rounded-lg p-4 cursor-pointer transition-all hover:border-gray-500 flex flex-col justify-between
                                        ${cantidadEnCarrito > 0 ? 'border-red-600' : 'border-gray-800'}`}
                                    >

                                        {/* Badge Cantidad en Carrito */}
                                        {cantidadEnCarrito > 0 && (
                                            <span
                                                className="absolute top-2 right-2 bg-red-600 text-white text-xs
                                                font-bold h-6 w-6 flex items-center justify-center rounded-full">{cantidadEnCarrito}</span>
                                        )}

                                        <div>
                                            <h4 className="font-bold text-white leading-tight truncate">{producto.nombre_producto}</h4>
                                            <p className="text-red-600 font-bold mt-1">${producto.precio_venta}</p>
                                            <p className="text-gray-500 text-xs mt-1">Stock: {producto.stock}</p>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                <div
                    className="w-[400px] bg-[#171717] border border-gray-800 rounded-lg p-5 flex flex-col gap-6 sticky top-6">

                    <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <FaShoppingCart/> VENTA ACTIVA
                        </h2>
                        <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold">
                            {productosSeleccionados.length} items</span>
                    </div>

                    <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
                        {productosSeleccionados.map((item) => (
                            <div key={item.id}
                                 className="flex justify-between items-center bg-[#222222] p-2 rounded border border-gray-800">
                                <div className="flex gap-3 items-center">
                                    <p className="font-bold text-sm text-white truncate w-32">{item.nombre_producto}</p>
                                    <p className="text-red-600 text-sm">${item.precio_venta}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button onClick={() => restarProducto(item.id)}
                                            className="p-1 bg-gray-800 rounded hover:bg-gray-700">
                                        <FaMinus size={10}/>
                                    </button>
                                    <span className="font-bold w-4 text-center">{item.cantidad}</span>
                                    <button onClick={() => agregarProducto(item)}
                                            className="p-1 bg-gray-800 rounded hover:bg-gray-700">
                                        <FaPlus size={10}/>
                                    </button>
                                    <button onClick={() => eliminarProducto(item.id)}
                                            className="p-1.5 bg-red-900 text-red-300 rounded hover:bg-red-800 ml-2">
                                        <FaTrash size={12}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {productosSeleccionados.length === 0 && (
                            <p className="text-center text-gray-500 my-4 text-sm">El carrito está vacío</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 mt-auto border-t border-gray-800 pt-4">

                        {/* Método de Pago */}
                        <div className="flex gap-2">
                            <select
                                value={metodoPago}
                                onChange={(e) => setMetodoPago(e.target.value)}
                                className="bg-[#111111] border border-gray-800 rounded p-2 text-sm w-full focus:border-red-600 outline-none"
                            >
                                <option value="Efectivo">💵 Efectivo</option>
                                <option value="Tarjeta">💳 Tarjeta</option>
                            </select>
                        </div>

                        {/* Totales */}
                        <div className="flex justify-between items-center my-2">
                            <p className="font-bold text-gray-400">SUBTOTAL</p>
                            <p className="font-black text-3xl">${totalPagar.toFixed(2)}</p>
                        </div>

                        <input
                            placeholder="Monto recibido..."
                            type="number"
                            className="bg-[#111111] border border-gray-800 rounded p-3 w-full focus:border-red-600 outline-none"
                        />

                        <button
                            onClick={procesarPago}
                            disabled={productosSeleccionados.length === 0}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold hover:cursor-pointer py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            $ CONFIRMAR VENTA
                        </button>
                    </div>
                </div>
            </div>
            ) : (
                <Inventario productos={productos} busqueda={busqueda} />
            )}

            {statusVenta === 'completada' && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex flex-col gap-3 justify-center items-center font-bold">
                    <h1 className="text-4xl">🟢 COMPRA REALIZADA</h1>
                    <button className="bg-red-900 hover:cursor-pointer text-white font-bold px-8 py-2 rounded-md "
                            onClick={() => {
                                setStatusVenta('')
                            }}
                    >Aceptar
                    </button>
                </div>
            )}

        </main>
    );
};