const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');
const { readJson, writeJson } = require('../helpers/fileDb');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const usersPath = path.join(__dirname, '../data/users.json');

// Proteger todas as rotas de usuários (Admin Only)
router.use(authMiddleware);
router.use(adminOnly);

// GET /api/users - Listar usuários
router.get('/', (req, res) => {
    const users = readJson(usersPath);
    // Remover hashes de senha antes de enviar
    const sanitizedUsers = users.map(({ password_hash, ...rest }) => rest);
    res.json(sanitizedUsers);
});

// POST /api/users - Criar usuário
router.post('/', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const users = readJson(usersPath);
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password_hash,
        role,
        active: true,
        created_at: new Date().toISOString()
    };

    users.push(newUser);
    writeJson(usersPath, users);

    const { password_hash: _, ...userResponse } = newUser;
    res.status(201).json(userResponse);
});

// PATCH /api/users/:id/status - Ativar/Desativar usuário
router.patch('/:id/status', (req, res) => {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
        return res.status(400).json({ error: 'Campo active deve ser booleano' });
    }

    let users = readJson(usersPath);
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Impedir que o admin se desative (opcional, mas recomendado)
    if (users[userIndex].email === 'admin@helpdesk.com' && active === false) {
        return res.status(400).json({ error: 'Não é possível desativar o administrador principal' });
    }

    users[userIndex].active = active;
    writeJson(usersPath, users);

    res.json({ message: `Status do usuário atualizado para ${active ? 'ativo' : 'inativo'}` });
});

module.exports = router;
