const xlsx = require('xlsx');

class Database {
    constructor() {
        this.filePath = './database.xlsx';
        this.data = {};
        this.loadData();
    }

    // Функция для преобразования Excel даты в нормальный формат
    excelDateToJSDate(serial) {
        // Если значение пустое, undefined или null, возвращаем пустую строку
        if (serial === undefined || serial === null || serial === '') {
            return '';
        }
        
        // Если это строка (текстовое значение), возвращаем как есть
        if (typeof serial === 'string') {
            return serial;
        }
        
        // Если это число (Excel дата), преобразуем
        if (typeof serial === 'number') {
            const utc_days = Math.floor(serial - 25569);
            const utc_value = utc_days * 86400;
            const date_info = new Date(utc_value * 1000);
            
            const day = date_info.getDate().toString().padStart(2, '0');
            const month = (date_info.getMonth() + 1).toString().padStart(2, '0');
            const year = date_info.getFullYear();
            
            return `${day}.${month}.${year}`;
        }
        
        // Для любых других типов возвращаем как строку
        return String(serial);
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
                    // Преобразуем код в строку и убираем пробелы
                    const code = row.code.toString().trim();
                    
                    this.data[code] = {
                        type: row.type || '',
                        date: this.excelDateToJSDate(row.date),
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

    // Перезагрузка данных
    reload() {
        this.loadData();
    }
}

module.exports = new Database();