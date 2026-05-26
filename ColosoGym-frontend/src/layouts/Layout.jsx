import React from 'react';
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { Outlet, Link, NavLink } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="h-screen flex flex-row text-white">
            <Sidebar></Sidebar>

            <main className="h-full flex flex-col w-full">
                <Header></Header>

                <Outlet/>
            </main>
        </div>

    )
}