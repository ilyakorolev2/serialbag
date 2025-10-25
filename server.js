const express = require('express');
const app = express();
const port = process.env.PORT || 415; // Берём порт из Render или 415 локально

// Простые данные для теста (как база; ключ - code, значение - JSON)
const dataBase = {
    '202101B': { type: 'для АДМ KDS200 Standart', date: '01.01.2024', note: 'не была в ремонте' },
    '12345': { type: 'для АДМ KDS200 Compact', date: '01.01.2024', note: 'была в ремонте 01.06.2025' },
    '54321': { type: 'для АДМ Panda', date: '01.01.2024', note: 'была в ремонте 06.06.2025' },
    '11111': { type: 'для АДМ KDS200 MAX', date: '01.01.2024', note: 'была в ремонте 01.01.2025' },
    '24925': { type: 'для АДМ KDS200 МАХ', date: '11.09.2024', note: 'в ремонте' },
    '25501': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25502': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25503': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25504': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25505': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25506': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25507': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25508': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25509': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25510': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25511': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25512': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25513': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25514': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25515': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25516': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25517': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25518': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25519': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '25520': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: ' ' },
    '24858': { type: 'для АДМ KDS200 Compact', date: '21.10.2025', note: 'Была сломана шторка' },
    '25421': { type: 'для АДМ KDS200 Standart', date: '19.05.2025', note: ' ' },
    '25422': { type: 'для АДМ KDS200 Standart', date: '19.05.2025', note: ' ' },
    '25423': { type: 'для АДМ KDS200 Standart', date: '19.05.2025', note: ' ' },
    '25424': { type: 'для АДМ KDS200 Standart', date: '19.05.2025', note: ' ' },
    '25425': { type: 'для АДМ KDS200 Standart', date: '19.05.2025', note: ' ' },
    '25426': { type: 'для АДМ KDS200 Standart', date: '19.05.2025', note: ' ' },
    '25428': { type: 'для АДМ KDS200 Standart', date: '19.05.2025', note: ' ' },
    '25429': { type: 'для АДМ KDS200 Standart', date: '19.05.2025', note: ' ' },
    '25430': { type: 'для АДМ KDS200 Standart', date: '19.05.2025', note: ' ' },
    '25435': { type: 'для АДМ KDS200 Standart', date: '19.05.2025', note: ' ' },

    '25540': { type: 'для АДМ KDS200 Compact', date: 'еще не выпущена', note: ' ' },
    '25541': { type: 'для АДМ KDS200 Compact', date: 'еще не выпущена', note: ' ' },
    '25542': { type: 'для АДМ KDS200 Compact', date: 'еще не выпущена', note: ' ' },
    '25543': { type: 'для АДМ KDS200 Compact', date: 'еще не выпущена', note: ' ' },
    '25544': { type: 'для АДМ KDS200 Compact', date: 'еще не выпущена', note: ' ' },
    '25545': { type: 'для АДМ KDS200 Compact', date: 'еще не выпущена', note: ' ' }, 
    '25549': { type: 'для АДМ KDS200 Compact', date: 'еще не выпущена', note: ' ' },
    '25550': { type: 'для АДМ KDS200 Compact', date: 'еще не выпущена', note: ' ' }

    // Добавь больше по аналогии
};

// Маршрут: GET /data/:code — получает code из URL
app.get('/data/:code', (req, res) => {
    const code = req.params.code; // код из запроса
    const data = dataBase[code]; // Ищем в "базе"
    if (data) {
        res.json(data); // Возвращаем JSON
    } else {
        res.status(404).json({ error: 'Данные не найдены для кода ' + code }); // Ошибка, если нет
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});