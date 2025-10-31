const express = require('express');
const db = require('./db');

const app = express();
const port = process.env.PORT || 415;

// Middleware для логирования запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Маршрут: GET /data/:code
app.get('/data/:code', (req, res) => {
    const requestedCode = req.params.code;
    
    const result = db.findByCode(requestedCode);
    
    if (result) {
        res.json({
            type: result.type,
            date: result.date,
            note: result.note
        });
    } else {
        res.status(404).json({ 
            error: 'Данные не найдены для кода ' + requestedCode 
        });
    }
});

// Новый маршрут: GET /stats - возвращает статистику базы данных
app.get('/stats', (req, res) => {
    const totalRecords = Object.keys(db.data).length;
    
    res.json({
        totalRecords: totalRecords,
        message: `В базе данных ${totalRecords} записей`,
        lastUpdated: new Date().toISOString()
    });
});

// Дополнительный маршрут для принудительной перезагрузки базы
app.post('/reload-db', (req, res) => {
    db.reload();
    res.json({ 
        message: 'База данных перезагружена',
        totalRecords: Object.keys(db.data).length
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
    console.log(`База данных содержит ${Object.keys(db.data).length} записей`);
});