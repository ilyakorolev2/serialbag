const express = require('express');
const app = express();
const port = 415;  // Порт — можно изменить на 80, если нужно

// Простые данные для теста (как база; ключ — code, значение — JSON)
const dataBase = {
    '2021001B': { name: 'Продукт 1', description: 'Это описание для кода 2021001B', price: 100 },
    '12345': { name: 'Продукт 2', description: 'Другое описание', price: 200 }
    '111': { name: 'Продукт 2', description: 'Другое описание', price: 300 }
    // Добавь больше по аналогии
};

// Маршрут: GET /data/:code — получает code из URL
app.get('/data/:code', (req, res) => {
    const code = req.params.code;  // Твой код из запроса
    const data = dataBase[code];   // Ищем в "базе"
    if (data) {
        res.json(data);  // Возвращаем JSON
    } else {
        res.status(404).json({ error: 'Данные не найдены для кода ' + code });  // Ошибка, если нет
    }
});

// Запуск сервера
app.listen(port, '0.0.0.0', () => {
    console.log(`Сервер запущен на http://0.0.0.0:${port}`);
});