import { useState } from 'react'
import 'tailwindcss';
import Layout from "./layouts/Layout.jsx";
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Dashboard from "./pages/Dashboard.jsx";
import Registros from "./pages/Registros.jsx";
import Acceso from "./pages/Acceso.jsx";
import PuntoVenta from "./pages/PuntoVenta.jsx";

function App() {

  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Layout/>}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="registro" element={<Registros />} />
                <Route path="acceso" element={<Acceso />} />
                <Route path="productos" element={<PuntoVenta />} />
              </Route>
          </Routes>
      </BrowserRouter>

  )
}

export default App
