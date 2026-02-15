const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'serverinfo.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Раздача статических файлов (фронтенд)
app.use(express.static(path.join(__dirname, 'public')));

// Загрузка данных из файла (если есть)
let serverInfo = {
    online: 0,
    max: 0,
    version: '1.16.5',
    motd: 'SkyPvP Server',
    players: []
};

function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            serverInfo = JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading data:', e);
    }
}

function saveData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(serverInfo, null, 2));
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

loadData();

// Эндпоинт для получения данных фронтендом
app.get('/api/serverinfo', (req, res) => {
    res.json(serverInfo);
});

// Эндпоинт для обновления данных от плагина (POST)
app.post('/api/serverinfo', (req, res) => {
    const { api_key, online, max, version, motd, players } = req.body;

    // Проверка API ключа (должен совпадать с тем, что в плагине)
    if (api_key !== 'skypvp_8f7d3a2b9e1c4f5d6a7b8c9d0e1f2g3h') {
        return res.status(403).json({ error: 'Invalid API key' });
    }

    // Обновляем данные
    if (online !== undefined) serverInfo.online = online;
    if (max !== undefined) serverInfo.max = max;
    if (version !== undefined) serverInfo.version = version;
    if (motd !== undefined) serverInfo.motd = motd;
    if (players !== undefined) serverInfo.players = players;

    saveData();
    res.json({ status: 'ok' });
});

// Простой ping для UptimeRobot (чтобы сайт не засыпал)
app.get('/ping', (req, res) => res.send('OK'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API доступен по адресу: http://localhost:${PORT}/api/serverinfo`);
});
