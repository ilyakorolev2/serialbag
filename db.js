const xlsx = require('xlsx');
const path = require('path');

class Database {
    constructor() {
        this.filePath = path.join(__dirname, 'database.xlsx');
        this.data = {};
        this.recordOrder = [];
        this.lastUpdated = null;
        this.loadData();
    }

    getMoscowTime() {
        const now = new Date();
        const moscow_offset = 3 * 60 * 60 * 1000;
        const moscow_time = new Date(now.getTime() + moscow_offset);
        return moscow_time.toISOString();
    }

    excelDateToJSDate(serial) {
        if (serial === undefined || serial === null || serial === '') {
            return '';
        }

        if (typeof serial === 'string') {
            return serial;
        }

        if (typeof serial === 'number') {
            const utc_days = Math.floor(serial - 25569);
            const utc_value = utc_days * 86400;
            const date_info = new Date(utc_value * 1000);
            const moscow_offset = 3 * 60 * 60 * 1000;
            const moscow_date = new Date(date_info.getTime() + moscow_offset);
            const day = moscow_date.getDate().toString().padStart(2, '0');
            const month = (moscow_date.getMonth() + 1).toString().padStart(2, '0');
            const year = moscow_date.getFullYear();

            return `${day}.${month}.${year}`;
        }

        return String(serial);
    }

    loadData() {
        try {
            const workbook = xlsx.readFile(this.filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

            this.data = {};
            this.recordOrder = [];
            jsonData.forEach(row => {
                if (row.code) {
                    const code = row.code.toString().trim();
                    this.data[code] = {
                        type: row.type || '',
                        date: this.excelDateToJSDate(row.date),
                        note: row.note || '',
                        createdAt: row.createdAt || ''
                    };
                    this.recordOrder.push(code);
                }
            });

            this.lastUpdated = this.getMoscowTime();
            console.log(`База данных загружена. Записей: ${Object.keys(this.data).length}`);
            console.log(`Время обновления базы: ${this.lastUpdated}`);
        } catch (error) {
            console.error('Ошибка загрузки базы данных:', error.message);
            this.data = {};
        }
    }

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

    getRecentRecords(limit = 5) {
        return this.recordOrder
            .map((code, index) => {
                const record = this.data[code];
                let timestamp = Date.parse(record.createdAt);

                if (!Number.isFinite(timestamp)) {
                    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(record.date);
                    timestamp = match
                        ? Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
                        : 0;
                }

                return { code, index, timestamp, ...record };
            })
            .sort((left, right) => right.timestamp - left.timestamp || right.index - left.index)
            .slice(0, limit)
            .map(({ index, timestamp, ...record }) => record);
    }

    saveData() {
        const rows = this.recordOrder.map(code => ({
            code,
            type: this.data[code].type || '',
            date: this.data[code].date || '',
            note: this.data[code].note || '',
            createdAt: this.data[code].createdAt || ''
        }));
        const worksheet = xlsx.utils.json_to_sheet(rows, {
            header: ['code', 'type', 'date', 'note', 'createdAt']
        });
        const workbook = xlsx.utils.book_new();

        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        xlsx.writeFile(workbook, this.filePath);
        this.lastUpdated = this.getMoscowTime();
    }

    addRecord(record) {
        const code = (record.code || '').toString().trim();

        if (!code) {
            const error = new Error('Code is required');
            error.code = 'INVALID_CODE';
            throw error;
        }

        if (this.findByCode(code)) {
            const error = new Error('Code already exists');
            error.code = 'DUPLICATE_CODE';
            throw error;
        }

        this.data[code] = {
            type: (record.type || '').toString().trim(),
            date: (record.date || '').toString().trim() || new Date().toLocaleDateString('ru-RU'),
            note: (record.note || '').toString().trim(),
            createdAt: this.getMoscowTime()
        };
        this.recordOrder.push(code);
        this.saveData();

        return {
            code,
            ...this.data[code]
        };
    }

    deleteRecord(code) {
        const record = this.findByCode(code);

        if (!record) {
            return false;
        }

        delete this.data[record.code];
        this.recordOrder = this.recordOrder.filter(item => item !== record.code);
        this.saveData();
        return true;
    }

    reload() {
        this.loadData();
        return this.lastUpdated;
    }

    getLastUpdated() {
        return this.lastUpdated;
    }
}

module.exports = new Database();
