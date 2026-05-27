const express = require('express');
const db = require('./db');

const app = express();
const port = process.env.PORT || 415;

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

function getMoscowTime() {
    const now = new Date();
    const moscow_offset = 3 * 60 * 60 * 1000;
    const moscow_time = new Date(now.getTime() + moscow_offset);
    return moscow_time.toISOString();
}

app.post('/data/:code', (req, res) => {
    const code = (req.body.code || req.params.code || '').toString().trim();
    const type = (req.body.type || '').toString().trim();
    const date = (req.body.date || '').toString().trim();
    const note = (req.body.note || '').toString().trim();

    try {
        const record = db.addRecord({ code, type, date, note });
        res.status(201).json({
            message: `Серийный номер ${record.code} добавлен в базу`,
            record,
            totalRecords: Object.keys(db.data).length,
            lastUpdated: db.getLastUpdated()
        });
    } catch (error) {
        if (error.code === 'INVALID_CODE') {
            return res.status(400).json({ error: 'Серийный номер не указан' });
        }

        if (error.code === 'DUPLICATE_CODE') {
            return res.status(409).json({ error: `Серийный номер ${code} уже есть в базе` });
        }

        console.error('Ошибка добавления записи:', error.message);
        res.status(500).json({ error: 'Ошибка сервера при добавлении записи' });
    }
});

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

app.get('/stats', (req, res) => {
    const totalRecords = Object.keys(db.data).length;
    const lastUpdated = db.getLastUpdated();

    res.json({
        totalRecords: totalRecords,
        message: `В базе данных ${totalRecords} записей`,
        lastUpdated: lastUpdated,
        currentTime: getMoscowTime(),
        timezone: 'MSK (GMT+3)'
    });
});

app.post('/reload-db', (req, res) => {
    const lastUpdated = db.reload();

    res.json({
        message: 'База данных перезагружена',
        totalRecords: Object.keys(db.data).length,
        lastUpdated: lastUpdated
    });
});

app.listen(port, () => {
    const startTime = getMoscowTime();
    console.log(`Сервер запущен на порту ${port}`);
    console.log(`Время запуска (МСК): ${startTime}`);
    console.log(`База данных содержит ${Object.keys(db.data).length} записей`);
});