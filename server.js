const express = require('express');
const path = require('path');
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
            message: `РЎРµСЂРёР№РЅС‹Р№ РЅРѕРјРµСЂ ${record.code} РґРѕР±Р°РІР»РµРЅ РІ Р±Р°Р·Сѓ`,
            record,
            totalRecords: Object.keys(db.data).length,
            lastUpdated: db.getLastUpdated()
        });
    } catch (error) {
        if (error.code === 'INVALID_CODE') {
            return res.status(400).json({ error: 'РЎРµСЂРёР№РЅС‹Р№ РЅРѕРјРµСЂ РЅРµ СѓРєР°Р·Р°РЅ' });
        }

        if (error.code === 'DUPLICATE_CODE') {
            return res.status(409).json({ error: `РЎРµСЂРёР№РЅС‹Р№ РЅРѕРјРµСЂ ${code} СѓР¶Рµ РµСЃС‚СЊ РІ Р±Р°Р·Рµ` });
        }

        console.error('РћС€РёР±РєР° РґРѕР±Р°РІР»РµРЅРёСЏ Р·Р°РїРёСЃРё:', error.message);
        res.status(500).json({ error: 'РћС€РёР±РєР° СЃРµСЂРІРµСЂР° РїСЂРё РґРѕР±Р°РІР»РµРЅРёРё Р·Р°РїРёСЃРё' });
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
            error: 'Р”Р°РЅРЅС‹Рµ РЅРµ РЅР°Р№РґРµРЅС‹ РґР»СЏ РєРѕРґР° ' + requestedCode
        });
    }
});

app.get('/stats', (req, res) => {
    const totalRecords = Object.keys(db.data).length;
    const lastUpdated = db.getLastUpdated();

    res.json({
        totalRecords: totalRecords,
        message: `Р’ Р±Р°Р·Рµ РґР°РЅРЅС‹С… ${totalRecords} Р·Р°РїРёСЃРµР№`,
        lastUpdated: lastUpdated,
        currentTime: getMoscowTime(),
        timezone: 'MSK (GMT+3)'
    });
});

app.get('/history', (req, res) => {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
        ? Math.min(Math.max(requestedLimit, 1), 50)
        : 5;

    res.json({
        records: db.getRecentRecords(limit)
    });
});

app.get('/download-db', (req, res) => {
    const filePath = path.join(__dirname, 'database.xlsx');
    res.download(filePath, 'database.xlsx', (error) => {
        if (error && !res.headersSent) {
            console.error('Database download error:', error.message);
            res.status(500).json({ error: 'Database download failed' });
        }
    });
});
app.post('/reload-db', (req, res) => {
    const lastUpdated = db.reload();

    res.json({
        message: 'Р‘Р°Р·Р° РґР°РЅРЅС‹С… РїРµСЂРµР·Р°РіСЂСѓР¶РµРЅР°',
        totalRecords: Object.keys(db.data).length,
        lastUpdated: lastUpdated
    });
});

app.listen(port, () => {
    const startTime = getMoscowTime();
    console.log(`РЎРµСЂРІРµСЂ Р·Р°РїСѓС‰РµРЅ РЅР° РїРѕСЂС‚Сѓ ${port}`);
    console.log(`Р’СЂРµРјСЏ Р·Р°РїСѓСЃРєР° (РњРЎРљ): ${startTime}`);
    console.log(`Р‘Р°Р·Р° РґР°РЅРЅС‹С… СЃРѕРґРµСЂР¶РёС‚ ${Object.keys(db.data).length} Р·Р°РїРёСЃРµР№`);
});
