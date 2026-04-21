const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { readJson } = require('../helpers/fileDb');
const { authMiddleware, SECRET_KEY } = require('../middleware/auth');

const usersPath = path.join(__dirname, '../data/users.json');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const users = readJson(usersPath);
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!user.active) {
        return res.status(403).json({ error: 'Usuário desativado. Entre em contato com o administrador.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '8h' }
    );

    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
