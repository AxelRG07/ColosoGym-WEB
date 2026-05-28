import React, {useState, useEffect, useRef} from 'react';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    LineChart, Line, Legend,
} from 'recharts';
import {toPng} from 'html-to-image';
import jsPDF from "jspdf";
import * as XLSX from 'xlsx';

export default function Reportes() {
    const fecha_actual = new Date().toISOString().split('T')[0];
    const [fecha, setFecha] = useState(fecha_actual);
    const [reporteVentas, setReporteVentas] = useState(null);
    const reportRef = useRef(null);
    const [topProductos, setTopProductos] = useState([]);
    const [inventario, setInventario] = useState([]);

    const obtenerReporte = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/ventas/corte_caja/?fecha=${fecha}`);
            const data = await response.json();

            if (response.ok) {
                setReporteVentas(data);
            } else {
                console.error("Error del servidor al cargar métricas");
                setReporteVentas(null);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    };

    const obtenerEstadoInventario = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/productos/estado_inventario/");
            const data = await response.json();

            if (response.ok) {
                const datosLimpios = data.map(item => ({
                    ...item,
                    stock_actual: Number(item.stock_actual),
                    stock_minimo: Number(item.stock_minimo)
                }));
                setInventario(datosLimpios);
            } else {
                console.error("Error al cargar el inventario");
                setInventario([]);
            }
        } catch (error) {
            console.error("Error de conexión en inventario:", error);
        }
    };

    const obtenerTopProductos = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/detalles-ventas/top_productos/");
            const data = await response.json();

            if (response.ok) {
                const datosLimpios = data.map(item => ({
                    ...item,
                    ventas: Number(item.ventas)
                }));

                setTopProductos(datosLimpios);
            } else {
                console.error("Error del servidor al cargar métricas");
                setTopProductos([]);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    };

    useEffect(() => {
        obtenerReporte();
        obtenerEstadoInventario()
    }, [fecha]);

    useEffect(() => {
        obtenerTopProductos();
    }, [])

    const exportarPDF = async () => {
        const elemento = reportRef.current;

        if (!elemento) return;

        try {
            const dataUrl = await toPng(elemento, {backgroundColor: '#0f0f0f'});

            const pdf = new jsPDF('l', 'mm', 'letter');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (elemento.offsetHeight * pdfWidth) / elemento.offsetWidth;

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Corte_Caja_${fecha}.pdf`);

        } catch (error) {
            console.error("Error al generar el PDF:", error);
        }
    };

    const exportarExcel = () => {
        if (!reporteVentas?.transacciones) return;

        const hoja = XLSX.utils.json_to_sheet(reporteVentas.transacciones);

        const libro = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(libro, hoja, "Transacciones_Del_Día");

        XLSX.writeFile(libro, `Corte_Caja_${fecha}.xlsx`);
    };

    return (
        <main className="min-h-screen bg-[#0f0f0f] text-white p-6 font-sans">
            <div className="mb-6">
                <h1 className="text-3xl font-black tracking-wider">REPORTES FINANCIEROS</h1>
                <h3 className="text-red-600 font-bold tracking-widest text-sm mt-1">
                    CORTE DE CAJA DIARIO
                </h3>
            </div>

            <div className="mb-6 flex gap-4 items-center">
                <label className="font-bold text-gray-400">Seleccionar Día:</label>
                <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="bg-[#171717] border border-gray-800 rounded p-2 text-white focus:outline-none focus:border-red-600 cursor-pointer"
                />
            </div>

            {reporteVentas ? (
                <div className="p-4">
                    <div ref={reportRef}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div
                                className="bg-[#171717] border border-gray-800 rounded-lg p-6 flex flex-col items-center shadow-lg">
                                <p className="text-gray-400 font-bold mb-2">TOTAL DEL DÍA</p>
                                <p className="text-4xl font-black text-white">${reporteVentas.total_general?.toFixed(2)}</p>
                            </div>
                            <div
                                className="bg-[#171717] border border-gray-800 rounded-lg p-6 flex flex-col items-center shadow-lg">
                                <p className="text-gray-400 font-bold mb-2">EFECTIVO 💵</p>
                                <p className="text-4xl font-black text-green-500">${reporteVentas.efectivo?.toFixed(2)}</p>
                            </div>
                            <div
                                className="bg-[#171717] border border-gray-800 rounded-lg p-6 flex flex-col items-center shadow-lg">
                                <p className="text-gray-400 font-bold mb-2">TARJETA 💳</p>
                                <p className="text-4xl font-black text-blue-500">${reporteVentas.tarjeta?.toFixed(2)}</p>
                            </div>
                        </div>

                        <div
                            className="bg-[#171717] border border-gray-800 rounded-lg p-6 mt-6 overflow-x-auto shadow-lg">
                            <h3 className="text-xl font-bold text-white mb-6">Flujo de Ventas (Transacciones)</h3>

                            <div className="flex justify-center">
                                <BarChart
                                    width={800}
                                    height={300}
                                    data={reporteVentas.transacciones}
                                    margin={{top: 20, right: 30, left: 20, bottom: 20}}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>

                                    <XAxis dataKey="id" stroke="#9ca3af" tick={{fill: '#9ca3af'}}/>
                                    <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af'}}/>

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#222',
                                            borderColor: '#444',
                                            borderRadius: '8px'
                                        }}
                                        itemStyle={{color: '#fff', fontWeight: 'bold'}}
                                        formatter={(value) => [`$${value.toFixed(2)}`, "Total Cobrado"]}
                                        labelFormatter={(label) => `Ticket ID: ${label}`}
                                    />

                                    <Bar dataKey="total" fill="#dc2626" radius={[4, 4, 0, 0]}/>
                                </BarChart>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={exportarPDF}
                            className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-6 rounded transition-colors"
                        >
                            📄 Generar PDF (Corte)
                        </button>
                        <button
                            onClick={exportarExcel}
                            className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-6 rounded transition-colors"
                        >
                            📊 Exportar a Excel
                        </button>
                    </div>

                    <div className="bg-[#171717] border border-gray-800 rounded-lg p-6 mt-6 overflow-x-auto shadow-lg">
                        {topProductos && topProductos.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                <h1>Productos más vendidos</h1>

                                <LineChart
                                    width={800}
                                    height={350}
                                    data={topProductos}
                                    margin={{top: 20, right: 30, left: 20, bottom: 80}}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>

                                    <XAxis
                                        dataKey="producto"
                                        stroke="#9ca3af"
                                        interval={0}
                                        angle={-45}
                                        textAnchor="end"
                                        tick={{fill: '#9ca3af', fontSize: 12}}
                                    />

                                    <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af'}}/>

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#222',
                                            borderColor: '#444',
                                            borderRadius: '8px'
                                        }}
                                        itemStyle={{color: '#fff', fontWeight: 'bold'}}
                                        labelFormatter={(label) => `Producto: ${label}`}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="ventas"
                                        stroke="#dc2626"
                                        strokeWidth={3}
                                        dot={{r: 5, fill: '#dc2626'}}
                                        activeDot={{r: 8}}
                                    />
                                </LineChart>
                            </div>
                        ) : (
                            <div className="flex justify-center py-20">
                                <p className="text-gray-500 font-bold text-lg animate-pulse">Cargando...</p>
                            </div>
                        )}

                        <div className="w-full flex flex-col gap-4 bg-[#111] p-6 rounded-xl">
                            <h1>Estado del Inventario (Stock vs Mínimo)</h1>

                            {inventario && inventario.length > 0 ? (
                                <BarChart
                                    width={1000}
                                    height={400}
                                    data={inventario}
                                    margin={{top: 20, right: 30, left: 20, bottom: 100}}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false}/>

                                    <XAxis
                                        dataKey="producto"
                                        stroke="#9ca3af"
                                        interval={0}
                                        angle={-45}
                                        textAnchor="end"
                                        height={90}
                                        tick={{fill: '#9ca3af', fontSize: 12}}
                                    />
                                    <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af'}}/>

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#222',
                                            borderColor: '#444',
                                            borderRadius: '8px'
                                        }}
                                        itemStyle={{color: '#fff', fontWeight: 'bold'}}
                                    />

                                    <Bar
                                        dataKey="stock_actual"
                                        name="Stock Actual"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                    />

                                    <Bar
                                        dataKey="stock_minimo"
                                        name="Stock Mínimo"
                                        fill="#f59e0b"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="center"
                                        wrapperStyle={{paddingBottom: '20px'}}
                                    />

                                </BarChart>
                            ) : (
                                <div className="flex justify-center py-20">
                                    <p className="text-gray-500 font-bold text-lg animate-pulse">Cargando
                                        inventario...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex justify-center py-20">
                    <p className="text-gray-500 font-bold text-lg animate-pulse">Cargando métricas...</p>
                </div>
            )}
        </main>
    );
}