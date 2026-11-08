const express = require('express');
const cors = require('cors');
const initDB = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

let db;

// ==========================================
// RUTA DE DEPARTAMENTOS
// ==========================================
app.get('/api/departamentos', async (req, res) => {
    try {
        const departamentos = await db.all('SELECT * FROM departamentos');
        res.json(departamentos);
    } catch (error) {
        res.status(500).json({ error: "Base de datos cargando, intente de nuevo." });
    }
});

// ==========================================
// REQUERIMIENTO: Función que devuelve el nombre del mes
// ==========================================
function obtenerNombreMes(numeroMes) {
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return meses[parseInt(numeroMes) - 1] || "Mes Inválido";
}

app.get('/api/mes/:numero', (req, res) => {
    const nombre = obtenerNombreMes(req.params.numero);
    res.json({ mes: nombre });
});

// ==========================================
// RUTAS DE EMPLEADOS
// ==========================================
app.post('/api/empleados', async (req, res) => {
    try {
        const { nombre, fecha_nacimiento, departamento_id, salario_base } = req.body;
        const result = await db.run(
            'INSERT INTO empleados (nombre, fecha_nacimiento, departamento_id, salario_base) VALUES (?, ?, ?, ?)',
            [nombre, fecha_nacimiento, departamento_id, salario_base]
        );
        res.json({ id: result.lastID, mensaje: "Empleado registrado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/empleados', async (req, res) => {
    try {
        const empleados = await db.all(`
            SELECT e.*, d.nombre as departamento 
            FROM empleados e 
            LEFT JOIN departamentos d ON e.departamento_id = d.id
        `);
        res.json(empleados);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// REQUERIMIENTO: Procedimiento para calcular la nómina
// ==========================================
app.post('/api/nominas/calcular', async (req, res) => {
    try {
        const { empleado_id, periodo, tipo_pago, dias_laborados, horas_extras_cant, horas_dobles_cant, bono_produccion, comisiones, compras_tienda, porcentaje_asociacion } = req.body;

        const empleado = await db.get('SELECT * FROM empleados WHERE id = ?', [empleado_id]);
        if (!empleado) {
            return res.status(404).json({ error: "Empleado no encontrado" });
        }

        const salarioBase = empleado.salario_base;
        let totalIngresos = 0;
        let totalEgresos = 0;
        let igss = 0;
        let isr = 0;
        let asociacionSolidarista = 0;
        let bonoDecreto = 0;
        let valorHorasExtras = 0;
        let valorHorasDobles = 0;

        if (tipo_pago === 'anticipo_15') {
            totalIngresos = salarioBase * 0.50;
            totalEgresos = 0;
        } else {
            const valorHoraNormal = (salarioBase / 30) / 8;
            valorHorasExtras = (horas_extras_cant || 0) * (valorHoraNormal * 1.5);
            valorHorasDobles = (horas_dobles_cant || 0) * (valorHoraNormal * 2);
            bonoDecreto = 250;

            totalIngresos = salarioBase + valorHorasExtras + valorHorasDobles + bonoDecreto + (bono_produccion || 0) + (comisiones || 0);

            igss = salarioBase * 0.0483;
            
            if (salarioBase > 4000) {
                isr = (salarioBase - 4000) * 0.05;
            }

            asociacionSolidarista = salarioBase * ((porcentaje_asociacion || 0) / 100);
            totalEgresos = igss + isr + asociacionSolidarista + (compras_tienda || 0);
        }

        const liquidoRecibir = totalIngresos - totalEgresos;

        await db.run(`
            INSERT INTO nominas (
                empleado_id, periodo, tipo_pago, dias_laborados,
                salario_base, horas_extras, horas_dobles, bono_decreto, bono_produccion, comisiones, total_ingresos,
                igss, isr, asociacion_solidarista, compras_tienda, total_egresos, liquido_recibir
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            empleado_id, periodo, tipo_pago, dias_laborados || 30,
            salarioBase, valorHorasExtras, valorHorasDobles, bonoDecreto, bono_produccion || 0, comisiones || 0, totalIngresos,
            igss, isr, asociacionSolidarista, compras_tienda || 0, totalEgresos, liquidoRecibir
        ]);

        res.json({ mensaje: "Nómina calculada y registrada correctamente", liquidoRecibir });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// CONSULTAS Y REPORTES OBLIGATORIOS
// ==========================================
app.get('/api/reportes/cumpleaneros/:mes', async (req, res) => {
    try {
        const mes = req.params.mes.padStart(2, '0');
        const cumpleaneros = await db.all(`
            SELECT e.nombre, e.fecha_nacimiento, d.nombre as departamento
            FROM empleados e
            LEFT JOIN departamentos d ON e.departamento_id = d.id
            WHERE strftime('%m', e.fecha_nacimiento) = ?
        `, [mes]);
        res.json({ mes: obtenerNombreMes(mes), cumpleaneros });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reportes/igss/:periodo', async (req, res) => {
    try {
        const reportes = await db.all(`
            SELECT e.nombre, n.periodo, n.salario_base, n.igss
            FROM nominas n
            JOIN empleados e ON n.empleado_id = e.id
            WHERE n.periodo = ? AND n.igss > 0
        `, [req.params.periodo]);
        res.json(reportes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reportes/isr/:periodo', async (req, res) => {
    try {
        const reportes = await db.all(`
            SELECT e.nombre, n.periodo, n.salario_base, n.isr
            FROM nominas n
            JOIN empleados e ON n.empleado_id = e.id
            WHERE n.periodo = ? AND n.isr > 0
        `, [req.params.periodo]);
        res.json(reportes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reportes/poliza/:periodo', async (req, res) => {
    try {
        const poliza = await db.all(`
            SELECT d.nombre as departamento, d.cuenta_contable, 
                   SUM(n.total_ingresos) as total_sueldos_ingresos,
                   SUM(n.total_egresos) as total_descuentos,
                   SUM(n.liquido_recibir) as total_pagar
            FROM nominas n
            JOIN empleados e ON n.empleado_id = e.id
            JOIN departamentos d ON e.departamento_id = d.id
            WHERE n.periodo = ?
            GROUP BY d.id
        `, [req.params.periodo]);
        res.json(poliza);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reportes/libros-salarios/:periodo', async (req, res) => {
    try {
        const libro = await db.all(`
            SELECT d.nombre as departamento, e.nombre as empleado, n.salario_base,
                   n.dias_laborados, n.total_ingresos, n.total_egresos, n.liquido_recibir
            FROM nominas n
            JOIN empleados e ON n.empleado_id = e.id
            JOIN departamentos d ON e.departamento_id = d.id
            WHERE n.periodo = ?
        `, [req.params.periodo]);
        res.json(libro);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// INICIALIZACIÓN DE LA BD Y ARRANQUE DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3001;

initDB().then(async (database) => {
    db = database;
    
    // Insertar los 5 departamentos obligatorios si la tabla está vacía
    const depts = await db.all('SELECT * FROM departamentos');
    if (depts.length === 0) {
        await db.run("INSERT INTO departamentos (nombre, cuenta_contable) VALUES ('Finanzas', '6101-01')");
        await db.run("INSERT INTO departamentos (nombre, cuenta_contable) VALUES ('Producción', '6101-02')");
        await db.run("INSERT INTO departamentos (nombre, cuenta_contable) VALUES ('Logística', '6101-03')");
        await db.run("INSERT INTO departamentos (nombre, cuenta_contable) প্রজাতির VALUES ('Recursos Humanos', '6101-04')");
        await db.run("INSERT INTO departamentos (nombre, cuenta_contable) VALUES ('Mercadeo', '6101-05')");
        console.log("Departamentos iniciales insertados exitosamente.");
    }

    // Encender el servidor SÓLO DESPUÉS de que la base de datos esté lista
    app.listen(PORT, () => {
        console.log(`Servidor de Consulting S.A. corriendo en el puerto ${PORT}`);
    });
}).catch(err => {
    console.error("Error crítico al inicializar la base de datos:", err);
});