// Cargamos las librerías necesarias para manejar la base de datos de SQLite
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

// Función para inicializar la base de datos
async function initDB() {
    // Abrimos o creamos el archivo de base de datos 'nomina.db' dentro de la carpeta backend
    const db = await open({
        filename: path.join(__dirname, 'nomina.db'),
        driver: sqlite3.Database
    });

    // 1. Tabla de Departamentos (Finanzas, Producción, Logística, RRHH, Mercadeo)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS departamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            cuenta_contable TEXT NOT NULL
        );
    `);

    // 2. Tabla de Empleados
    await db.exec(`
        CREATE TABLE IF NOT EXISTS empleados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            fecha_nacimiento DATE NOT NULL,
            departamento_id INTEGER,
            salario_base REAL NOT NULL,
            FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
        );
    `);

    // 3. Tabla de Nómina (Pagos del día 15 y fin de mes)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS nominas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            empleado_id INTEGER,
            periodo TEXT NOT NULL, -- Formato: YYYY-MM
            tipo_pago TEXT NOT NULL, -- 'anticipo_15' o 'fin_de_mes'
            dias_laborados INTEGER DEFAULT 30,
            
            -- INGRESOS
            salario_base REAL DEFAULT 0,
            horas_extras REAL DEFAULT 0,
            horas_dobles REAL DEFAULT 0,
            bono_decreto REAL DEFAULT 250,
            bono_produccion REAL DEFAULT 0,
            comisiones REAL DEFAULT 0,
            total_ingresos REAL DEFAULT 0,

            -- EGRESOS
            igss REAL DEFAULT 0,
            isr REAL DEFAULT 0,
            asociacion_solidarista REAL DEFAULT 0,
            compras_tienda REAL DEFAULT 0,
            total_egresos REAL DEFAULT 0,

            -- LIQUIDO A RECIBIR
            liquido_recibir REAL DEFAULT 0,
            
            FOREIGN KEY (empleado_id) REFERENCES empleados(id)
        );
    `);

    console.log("¡Base de datos y tablas creadas exitosamente!");
    return db;
}

module.exports = initDB;
