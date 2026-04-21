const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const { readJson, writeJson } = require('../helpers/fileDb');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const ticketsPath = path.join(__dirname, '../data/tickets.json');

router.use(authMiddleware);

// GET /api/tickets - Listar chamados
router.get('/', (req, res) => {
    const tickets = readJson(ticketsPath);
    
    if (req.user.role === 'admin') {
        res.json(tickets);
    } else {
        const userTickets = tickets.filter(t => t.user_id === req.user.id);
        res.json(userTickets);
    }
});

// POST /api/tickets - Abrir novo chamado
router.post('/', (req, res) => {
    const { title, category, priority, description } = req.body;

    if (!title || !category || !priority || !description) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const tickets = readJson(ticketsPath);
    const newTicket = {
        id: crypto.randomUUID(),
        title,
        category,
        priority,
        description,
        status: 'aberto',
        user_id: req.user.id,
        user_name: req.user.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    tickets.push(newTicket);
    writeJson(ticketsPath, tickets);

    res.status(201).json(newTicket);
});

// GET /api/tickets/:id - Detalhes de um chamado
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const tickets = readJson(ticketsPath);
    const ticket = tickets.find(t => t.id === id);

    if (!ticket) {
        return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    // Verificar se o usuário tem permissão para ver este chamado
    if (req.user.role !== 'admin' && ticket.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Acesso negado a este chamado' });
    }

    res.json(ticket);
});

// PATCH /api/tickets/:id/status - Atualizar status do chamado (Admin Only)
router.patch('/:id/status', adminOnly, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['aberto', 'em_andamento', 'resolvido', 'fechado'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
    }

    let tickets = readJson(ticketsPath);
    const ticketIndex = tickets.findIndex(t => t.id === id);

    if (ticketIndex === -1) {
        return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    tickets[ticketIndex].status = status;
    tickets[ticketIndex].updated_at = new Date().toISOString();
    writeJson(ticketsPath, tickets);

    res.json(tickets[ticketIndex]);
});

module.exports = router;
