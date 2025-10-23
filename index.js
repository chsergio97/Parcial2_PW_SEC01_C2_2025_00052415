const express = require('express');
const app = express();
const port = 3130;

const cuentas = require('./cuentas');

app.get('/', (req, res) => {
    res.send('Este servidor es para Salvar la materia de PW');
});
//endpoint para obtener las cuentas y el conteo
app.get('/cuentas', (req, res) => {
    const query = req.query;

    // Sin query params -> devolvemos todas las cuentas y el count
    if (Object.keys(query).length === 0) {
        return res.json({
            count: Array.isArray(cuentas) ? cuentas.length : 0,
            data: cuentas
        });
    }

    // Con query params -> filtramos. Para cada parámetro, comprobamos que
    // el campo correspondiente en la cuenta contenga (case-insensitive) el valor.
    const entries = Object.entries(query);//recupera el parametro de busqueda
    //recorre el arreglo de cuentas y filtra las que coinciden con todos los parametros
    const matches = cuentas.filter(acc =>
        entries.every(([k, v]) => {
            if (v === undefined || v === '') return false;
            const field = acc[k];
            if (field === undefined || field === null) return false;
            return String(field).toLowerCase().includes(String(v).toLowerCase());
        })
    );

    let bandera = true;
    if (matches.length === 0) {
        bandera = false;
        return res.status(404).json({ finded: bandera, message: 'No se encontraron cuentas' });
    }

    if (matches.length === 1) {

        return res.json({ finded: bandera, account: matches[0] });
    }

    return res.json({ finded: bandera, data: matches });
});
//endpoint para busqueda por id
app.get('/cuentas/:id', (req, res) => {
    const id = req.params.id;
    const cuenta = cuentas.find(c => c._id === id);
    let bandera;
    if (cuenta) {
        bandera = true;
        res.json({ finded: bandera, cuenta });
    } else {
        bandera = false;
        res.json({ finded: bandera, message: 'Cuenta no encontrada' });
    }
});
//endpoint para obtener el total de cuentas activas
app.get('/cuentasBalance', (req, res) => {
    const parseBalance = s => {
        if (typeof s !== 'string') return 0;
        const n = parseFloat(s.replace(/[^0-9.-]+/g, ''));
        return Number.isNaN(n) ? 0 : n;
    };

    const activos = cuentas.filter(c => c.isActive);
    const total = activos.reduce((sum, c) => sum + parseBalance(c.balance), 0);

    if(activos.length === 0){
        return  res.status(404).json({status: false, message: 'No hay cuentas activas'});
    }else{
        res.json({
            status: true,
            count: activos.length,
            accountsBalance: `$${total.toFixed(2)}` // string formateado
        });
    }
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
