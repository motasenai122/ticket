const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { readJson, writeJson } = require('./helpers/fileDb');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ticketRoutes = require('./routes/tickets');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);

// Inicialização e Seed
const usersPath = path.join(__dirname, './data/users.json');
const ticketsPath = path.join(__dirname, './data/tickets.json');

async function seedAdmin() {
    const users = readJson(usersPath);
    if (users.length === 0) {
        console.log('--- Inicializando Banco de Dados ---');
        const adminPassword = await bcrypt.hash('admin123', 10);
        const adminUser = {
            id: crypto.randomUUID(),
            name: 'Administrador',
            email: 'admin@helpdesk.com',
            password_hash: adminPassword,
            role: 'admin',
            active: true,
            created_at: new Date().toISOString()
        };
        writeJson(usersPath, [adminUser]);
        console.log('Admin padrão criado: admin@helpdesk.com / admin123');
    }
    
    // Garantir que o arquivo de tickets existe
    if (!require('fs').existsSync(ticketsPath)) {
        writeJson(ticketsPath, []);
    }
}

app.listen(PORT, async () => {
    await seedAdmin();
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
