import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, DollarSign, Calendar, FileText, BookOpen, Building2 } from 'lucide-react';

const API_URL = 'https://backend-lady-consulting.onrender.com/api';

export default function App() {
  // 1. Estados de Autenticación
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ usuario: '', password: '' });

  // 2. Estados de la Aplicación
  const [tab, setTab] = useState('empleados');
  const [departamentos, setDepartamentos] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  // Estados para formularios
  const [nuevoEmpleado, setNuevoEmpleado] = useState({ nombre: '', fecha_nacimiento: '', departamento_id: '1', salario_base: '' });
  const [nominaForm, setNominaForm] = useState({
    empleado_id: '', periodo: '2026-10', tipo_pago: 'fin_de_mes', dias_laborados: '',
    horas_extras_cant: '', horas_dobles_cant: '', bono_produccion: '', comisiones: '', compras_tienda: '', porcentaje_asociacion: ''
  });

  // Estados para reportes
  const [mesCumple, setMesCumple] = useState('10');
  const [reporteCumple, setReporteCumple] = useState([]);
  const [periodoReporte, setPeriodoReporte] = useState('2026-10');
  const [reporteIgss, setReporteIgss] = useState([]);
  const [reporteIsr, setReporteIsr] = useState([]);
  const [reportePoliza, setReportePoliza] = useState([]);
  const [reporteLibro, setReporteLibro] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      cargarDatos();
    }
  }, [isLoggedIn]);

  const cargarDatos = async () => {
    try {
      const resDepts = await axios.get(`${API_URL}/departamentos`);
      setDepartamentos(resDepts.data);
      const resEmp = await axios.get(`${API_URL}/empleados`);
      setEmpleados(resEmp.data);
      if (resEmp.data.length > 0) {
        setNominaForm(prev => ({ ...prev, empleado_id: resEmp.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.usuario === 'admin' && loginForm.password === '1234') {
      setIsLoggedIn(true);
    } else {
      alert('Usuario o contraseña incorrectos. (Prueba admin / 1234)');
    }
  };

  const guardarEmpleado = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/empleados`, {
        ...nuevoEmpleado,
        departamento_id: Number(nuevoEmpleado.departamento_id),
        salario_base: Number(nuevoEmpleado.salario_base)
      });
      alert('Empleado registrado exitosamente');
      setNuevoEmpleado({ nombre: '', fecha_nacimiento: '', departamento_id: '1', salario_base: '' });
      cargarDatos();
    } catch (err) {
      console.error(err);
      alert('Error al guardar empleado: ' + (err.response?.data?.error || err.message));
    }
  };

  const calcularNomina = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/nominas/calcular`, nominaForm);
      alert(`Nómina procesada con éxito. Líquido a recibir: Q${res.data.liquidoRecibir.toFixed(2)}`);
    } catch (err) {
      alert('Error al procesar nómina: ' + (err.response?.data?.error || err.message));
    }
  };

  const cargarCumpleaneros = async () => {
    const res = await axios.get(`${API_URL}/reportes/cumpleaneros/${mesCumple}`);
    setReporteCumple(res.data.cumpleaneros || []);
  };

  const cargarIgss = async () => {
    const res = await axios.get(`${API_URL}/reportes/igss/${periodoReporte}`);
    setReporteIgss(res.data);
  };

  const cargarIsr = async () => {
    const res = await axios.get(`${API_URL}/reportes/isr/${periodoReporte}`);
    setReporteIsr(res.data);
  };

  const cargarPoliza = async () => {
    const res = await axios.get(`${API_URL}/reportes/poliza/${periodoReporte}`);
    setReportePoliza(res.data);
  };

  const cargarLibro = async () => {
    const res = await axios.get(`${API_URL}/reportes/libros-salarios/${periodoReporte}`);
    setReporteLibro(res.data);
  };

  // Pantalla de Inicio de Sesión
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f8' }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', color: '#2563eb', marginBottom: '20px' }}>Lady Consulting, S.A.</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>Ingrese al Sistema de Nóminas</p>
          
          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Usuario:</label>
              <input 
                type="text" 
                placeholder="Ej. admin" 
                value={loginForm.usuario} 
                onChange={e => setLoginForm({...loginForm, usuario: e.target.value})} 
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Contraseña:</label>
              <input 
                type="password" 
                placeholder="Ej. 1234" 
                value={loginForm.password} 
                onChange={e => setLoginForm({...loginForm, password: e.target.value})} 
                style={inputStyle}
                required
              />
            </div>
            <button type="submit" style={{ ...btnStyle, marginTop: '10px', width: '100%' }}>
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Interfaz Principal
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh', padding: '20px' }}>
      <header className="bg-blue-600 text-white p-6 rounded-lg shadow-md mb-6 text-center">
        <h1 className="text-3xl font-bold">
          Lady Consulting, S.A. - Sistema de Nóminas
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          Módulo de Gestión y Automatización de Salarios
        </p>
      </header>

      {/* Navegación por Pestañas */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setTab('empleados')} style={tabStyle(tab === 'empleados')}><Users size={18}/> Empleados</button>
        <button onClick={() => setTab('nomina')} style={tabStyle(tab === 'nomina')}><DollarSign size={18}/> Cálculo Nómina</button>
        <button onClick={() => setTab('cumple')} style={tabStyle(tab === 'cumple')}><Calendar size={18}/> Cumpleañeros</button>
        <button onClick={() => setTab('descuentos')} style={tabStyle(tab === 'descuentos')}><FileText size={18}/> IGSS e ISR</button>
        <button onClick={() => setTab('poliza')} style={tabStyle(tab === 'poliza')}><Building2 size={18}/> Póliza Contable</button>
        <button onClick={() => setTab('libro')} style={tabStyle(tab === 'libro')}><BookOpen size={18}/> Libro de Salarios</button>
      </div>

      {/* Pestaña: Registro de Empleados */}
      {tab === 'empleados' && (
        <div style={cardStyle}>
          <h2>Registrar Nuevo Empleado</h2>
          <form onSubmit={guardarEmpleado} style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
            <input type="text" placeholder="Nombre completo" required value={nuevoEmpleado.nombre} onChange={e => setNuevoEmpleado({...nuevoEmpleado, nombre: e.target.value})} style={inputStyle}/>
            <input type="date" required value={nuevoEmpleado.fecha_nacimiento} onChange={e => setNuevoEmpleado({...nuevoEmpleado, fecha_nacimiento: e.target.value})} style={inputStyle}/>
            <select value={nuevoEmpleado.departamento_id} onChange={e => setNuevoEmpleado({...nuevoEmpleado, departamento_id: e.target.value})} style={inputStyle}>
              {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
            <input type="number" step="0.01" placeholder="Salario Base (Q)" required value={nuevoEmpleado.salario_base} onChange={e => setNuevoEmpleado({...nuevoEmpleado, salario_base: e.target.value})} style={inputStyle}/>
            <button type="submit" style={btnStyle}>Guardar Empleado</button>
          </form>

          <h3 style={{ marginTop: '30px' }}>Listado de Empleados</h3>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#e2e8f0' }}>
                <th style={thTdStyle}>ID</th><th style={thTdStyle}>Nombre</th><th style={thTdStyle}>Departamento</th><th style={thTdStyle}>Salario Base</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map(e => (
                <tr key={e.id}>
                  <td style={thTdStyle}>{e.id}</td><td style={thTdStyle}>{e.nombre}</td><td style={thTdStyle}>{e.departamento}</td><td style={thTdStyle}>Q{e.salario_base?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pestaña: Cálculo de Nómina */}
      {tab === 'nomina' && (
        <div style={cardStyle}>
          <h2>Procesar Pago de Nómina</h2>
          <form onSubmit={calcularNomina} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>Empleado:</label>
              <select value={nominaForm.empleado_id} onChange={e => setNominaForm({...nominaForm, empleado_id: e.target.value})} style={inputStyle}>
                {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div>
              <label>Periodo (YYYY-MM):</label>
              <input type="text" value={nominaForm.periodo} onChange={e => setNominaForm({...nominaForm, periodo: e.target.value})} style={inputStyle}/>
            </div>
            <div>
              <label>Tipo de Pago:</label>
              <select value={nominaForm.tipo_pago} onChange={e => setNominaForm({...nominaForm, tipo_pago: e.target.value})} style={inputStyle}>
                <option value="anticipo_15">Anticipo Quincenal (50%)</option>
                <option value="fin_de_mes">Fin de Mes (Completo con Descuentos)</option>
              </select>
            </div>
            <div>
              <label>Horas Extras Normales (Cantidad):</label>
              <input type="number" value={nominaForm.horas_extras_cant} onChange={e => setNominaForm({...nominaForm, horas_extras_cant: Number(e.target.value)})} onFocus={(e) => e.target.select()} style={inputStyle}/>
            </div>
            <div>
              <label>Horas Dobles (Cantidad):</label>
              <input type="number" value={nominaForm.horas_dobles_cant} onChange={e => setNominaForm({...nominaForm, horas_dobles_cant: Number(e.target.value)})} onFocus={(e) => e.target.select()} style={inputStyle}/>
            </div>
            <div>
              <label>Bonificación por Producción (Q):</label>
              <input type="number" value={nominaForm.bono_produccion} onChange={e => setNominaForm({...nominaForm, bono_produccion: Number(e.target.value)})} onFocus={(e) => e.target.select()} style={inputStyle}/>
            </div>
            <div>
              <label>Comisiones (Q):</label>
              <input type="number" value={nominaForm.comisiones} onChange={e => setNominaForm({...nominaForm, comisiones: Number(e.target.value)})} onFocus={(e) => e.target.select()} style={inputStyle}/>
            </div>
            <div>
              <label>Compras en Tienda Solidarista (Q):</label>
              <input type="number" value={nominaForm.compras_tienda} onChange={e => setNominaForm({...nominaForm, compras_tienda: Number(e.target.value)})} onFocus={(e) => e.target.select()} style={inputStyle}/>
            </div>
            <div>
              <label>Ahorro Asociación Solidarista (%):</label>
              <input type="number" value={nominaForm.porcentaje_asociacion} onChange={e => setNominaForm({...nominaForm, porcentaje_asociacion: Number(e.target.value)})} onFocus={(e) => e.target.select()} style={inputStyle}/>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <button type="submit" style={btnStyle}>Calcular y Registrar Nómina</button>
            </div>
          </form>
        </div>
      )}

      {/* Pestaña: Cumpleañeros */}
      {tab === 'cumple' && (
        <div style={cardStyle}>
          <h2>Consulta de Cumpleañeros</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <select value={mesCumple} onChange={e => setMesCumple(e.target.value)} style={inputStyle}>
              {Array.from({length: 12}, (_, i) => (
                <option key={i+1} value={String(i+1)}>{i+1}</option>
              ))}
            </select>
            <button onClick={cargarCumpleaneros} style={btnStyle}>Buscar Cumpleañeros</button>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#e2e8f0' }}>
                <th style={thTdStyle}>Nombre</th><th style={thTdStyle}>Fecha Nacimiento</th><th style={thTdStyle}>Departamento</th>
              </tr>
            </thead>
            <tbody>
              {reporteCumple.map((c, idx) => (
                <tr key={idx}><td style={thTdStyle}>{c.nombre}</td><td style={thTdStyle}>{c.fecha_nacimiento}</td><td style={thTdStyle}>{c.departamento}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pestaña: IGSS e ISR */}
      {tab === 'descuentos' && (
        <div style={cardStyle}>
          <h2>Reportes de Retenciones (IGSS e ISR)</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="text" value={periodoReporte} onChange={e => setPeriodoReporte(e.target.value)} placeholder="YYYY-MM" style={inputStyle}/>
            <button onClick={() => { cargarIgss(); cargarIsr(); }} style={btnStyle}>Consultar Descuentos</button>
          </div>
          <h3>Listado Descuentos IGSS (4.83%)</h3>
          <table style={tableStyle}>
            <thead><tr style={{ backgroundColor: '#e2e8f0' }}><th style={thTdStyle}>Empleado</th><th style={thTdStyle}>Sueldo Base</th><th style={thTdStyle}>Descuento IGSS</th></tr></thead>
            <tbody>{reporteIgss.map((r, i) => <tr key={i}><td style={thTdStyle}>{r.nombre}</td><td style={thTdStyle}>Q{r.salario_base?.toFixed(2)}</td><td style={thTdStyle}>Q{r.igss?.toFixed(2)}</td></tr>)}</tbody>
          </table>

          <h3 style={{ marginTop: '20px' }}>Listado Descuentos ISR</h3>
          <table style={tableStyle}>
            <thead><tr style={{ backgroundColor: '#e2e8f0' }}><th style={thTdStyle}>Empleado</th><th style={thTdStyle}>Sueldo Base</th><th style={thTdStyle}>Descuento ISR</th></tr></thead>
            <tbody>{reporteIsr.map((r, i) => <tr key={i}><td style={thTdStyle}>{r.nombre}</td><td style={thTdStyle}>Q{r.salario_base?.toFixed(2)}</td><td style={thTdStyle}>Q{r.isr?.toFixed(2)}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {/* Pestaña: Póliza Contable */}
      {tab === 'poliza' && (
        <div style={cardStyle}>
          <h2>Póliza de Contabilidad por Departamento</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="text" value={periodoReporte} onChange={e => setPeriodoReporte(e.target.value)} placeholder="YYYY-MM" style={inputStyle}/>
            <button onClick={cargarPoliza} style={btnStyle}>Generar Póliza</button>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#e2e8f0' }}>
                <th style={thTdStyle}>Cuenta Contable</th><th style={thTdStyle}>Departamento</th><th style={thTdStyle}>Total Ingresos (Debe)</th><th style={thTdStyle}>Total Descuentos</th><th style={thTdStyle}>Líquido A Pagar (Haber)</th>
              </tr>
            </thead>
            <tbody>
              {reportePoliza.map((p, i) => (
                <tr key={i}>
                  <td style={thTdStyle}>{p.cuenta_contable}</td><td style={thTdStyle}>{p.departamento}</td>
                  <td style={thTdStyle}>Q{p.total_sueldos_ingresos?.toFixed(2)}</td><td style={thTdStyle}>Q{p.total_descuentos?.toFixed(2)}</td>
                  <td style={thTdStyle}>Q{p.total_pagar?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pestaña: Libro de Salarios */}
      {tab === 'libro' && (
        <div style={cardStyle}>
          <h2>Libro de Salarios</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="text" value={periodoReporte} onChange={e => setPeriodoReporte(e.target.value)} placeholder="YYYY-MM" style={inputStyle}/>
            <button onClick={cargarLibro} style={btnStyle}>Cargar Libro de Salarios</button>
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#e2e8f0' }}>
                <th style={thTdStyle}>Departamento</th><th style={thTdStyle}>Empleado</th><th style={thTdStyle}>Sueldo Base</th>
                <th style={thTdStyle}>Días Lab.</th><th style={thTdStyle}>Ingresos</th><th style={thTdStyle}>Egresos</th><th style={thTdStyle}>Líquido Recibir</th>
              </tr>
            </thead>
            <tbody>
              {reporteLibro.map((l, i) => (
                <tr key={i}>
                  <td style={thTdStyle}>{l.departamento}</td><td style={thTdStyle}>{l.empleado}</td><td style={thTdStyle}>Q{l.salario_base?.toFixed(2)}</td>
                  <td style={thTdStyle}>{l.dias_laborados}</td><td style={thTdStyle}>Q{l.total_ingresos?.toFixed(2)}</td><td style={thTdStyle}>Q{l.total_egresos?.toFixed(2)}</td>
                  <td style={thTdStyle}>Q{l.liquido_recibir?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Estilos dinámicos y limpios
const tabStyle = (active) => ({
  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', border: 'none', borderRadius: '6px',
  cursor: 'pointer', backgroundColor: active ? '#2563eb' : '#ffffff', color: active ? 'white' : '#334155', fontWeight: 'bold'
});
const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
const btnStyle = { padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
const thTdStyle = { border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left' };