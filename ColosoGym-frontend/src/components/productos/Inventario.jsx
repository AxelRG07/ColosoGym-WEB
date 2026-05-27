import React from 'react';
import DataTable from 'react-data-table-component';
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Inventario({ productos, busqueda }) {

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
    const columnasInventario = [
        {
            name: 'ID',
            selector: row => `P-${row.id.toString().padStart(3, '0')}`,
            sortable: true,
            width: '100px'
        },

        {
            name: 'NOMBRE',
            selector: row => row.nombre_producto,
            sortable: true,
        },
        {
            name: 'STOCK',
            selector: row => row.stock,
            sortable: true,
            cell: row => (
                <div className="flex items-center gap-2">
                    <span className={row.stock <= row.stock_minimo ? 'text-red-500 font-bold' : ''}>
                        {row.stock}
                    </span>
                    {row.stock <= row.stock_minimo && <span title="Stock Bajo">⚠️</span>}
                </div>
            )
        },
        {
            name: 'PRECIO',
            selector: row => `$${row.precio_venta}`,
            sortable: true,
        },
        {
            name: 'ACCIONES',
            cell: row => (
                <div className="flex gap-2">
                    <button className="p-1.5 bg-[#171717] border border-gray-700 rounded hover:bg-gray-700 transition-colors">
                        <FaEdit className="text-gray-400" />
                    </button>
                    <button className="p-1.5 bg-[#3a0000] border border-red-900 rounded hover:bg-red-800 transition-colors">
                        <FaTrash className="text-red-400" />
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        }
    ];

    // Filtramos los productos localmente usando la búsqueda que viene del padre
    const productosFiltrados = productos.filter(p =>
        p.nombre_producto.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="mt-6 bg-[#171717] border border-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Listado de Productos</h2>
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
                    + NUEVO PRODUCTO
                </button>
            </div>

            <DataTable
                columns={columnasInventario}
                data={productosFiltrados}
                customStyles={customStyles}
                pagination
                highlightOnHover
                responsive
            />
        </div>
    );
}