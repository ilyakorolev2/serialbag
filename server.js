const express = require('express');
const app = express();
const port = process.env.PORT || 415; // Берём порт из Render или 415 локально

// Простые данные для теста (как база; ключ — code, значение — JSON)
const dataBase = {
    '202101B': { type: 'накопитель для АДМ KDS200 Standart', date: '01.01.2024', note: 100 },
    '12345': { type: 'накопитель для АДМ KDS200 Compact', date: '01.01.2024', note: 200 },
    '54321': { type: 'накопитель для АДМ Panda', date: '01.01.2024', note: 543 },
    '111': { type: 'накопитель для АДМ KDS200 MAX', date: '01.01.2024', note: 300 } 
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