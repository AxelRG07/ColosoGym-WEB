import React from 'react';
import {TfiAgenda, TfiFaceSmile, TfiLayers, TfiLayoutMediaLeft, TfiShiftRight, TfiUser} from "react-icons/tfi";
import { Outlet, Link, NavLink } from 'react-router-dom';


export default function Sidebar() {
    return (
        <aside className='flex flex-col items-center w-70 justify-start gap-7 h-full border-r-2 border-gray-500'>

            <div className="p-3 w-full">
                <h1 className="text-2xl text-white font-bold flex flex-row gap-3 items-center"><span><TfiUser /></span>Coloso</h1>
                <h1 className=" text-red-900 font-bold">GYM administración</h1>
            </div>


            <nav className="flex flex-col gap-5 w-full">

                <NavLink className="flex flex-row gap-3 items-center hover:bg-[#2a0809] hover:cursor-pointer text-gray-400 p-3
                transition-all duration-300 ease-in-out" to="/acceso">
                    <span><TfiShiftRight /></span>Acceso</NavLink>

                <NavLink className="flex flex-row gap-3 items-center hover:bg-[#2a0809] hover:cursor-pointer text-gray-400 p-3
                transition-all duration-300 ease-in-out" to="/registro">
                    <span><TfiFaceSmile /></span>Registro</NavLink>

                <NavLink className="flex flex-row gap-3 items-center hover:bg-[#2a0809] hover:cursor-pointer text-gray-400 p-3
                transition-all duration-300 ease-in-out" to="/productos">
                    <span><TfiLayers /></span>Punto de venta</NavLink>

                <NavLink className="flex flex-row gap-3 items-center hover:bg-[#2a0809] hover:cursor-pointer text-gray-400 p-3
                transition-all duration-300 ease-in-out" to="/reportes">
                    <span><TfiLayoutMediaLeft /></span>Reportes</NavLink>
            </nav>

        </aside>
    )
}