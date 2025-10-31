const xlsx = require('xlsx');
const fs = require('fs');

class Database {
    constructor() {
        this.filePath = './database.xlsx';
        this.data = {};
        this.loadData();
        this.setupFileWatcher();
    }

    // Загрузка данных из Excel файла
    loadData() {
        try {
            const workbook = xlsx.readFile(this.filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Конвертируем Excel в JSON
            const jsonData = xlsx.utils.sheet_to_json(worksheet);
            
            // Преобразуем в формат { code: { type, date, note } }
            this.data = {};
            jsonData.forEach(row => {
                if (row.code) {
                    this.data[row.code] = {
                        type: row.type || '',
                        date: row.date || '',
                        note: row.note || ''
                    };
                }
            });
            
            console.log(`База данных загружена. Записей: ${Object.keys(this.data).length}`);
        } catch (error) {
            console.error('Ошибка загрузки базы данных:', error.message);
            this.data = {};
        }
    }

    // Настройка отслеживания изменений файла
    setupFileWatcher() {
        fs.watchFile(this.filePath, (curr, prev) => {
            console.log('Обнаружено изменение в database.xlsx, перезагружаем...');
            this.loadData();
        });
        console.log('Отслеживание изменений database.xlsx включено');
    }

    // Поиск по коду (без учета регистра)
    findByCode(code) {
        const searchCode = code.toString().trim().toLowerCase();
        
        for (const key in this.data) {
            if (key.toLowerCase() === searchCode) {
                return {
                    code: key,
                    ...this.data[key]
                };
            }
        }
        return null;
    }

    // Перезагрузка данных (например, после изменения Excel файла)
    reload() {
        this.loadData();
    }
}

module.exports = new Database();