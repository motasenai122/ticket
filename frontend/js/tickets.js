async function loadTickets() {
    const list = document.getElementById('ticketsList');
    list.innerHTML = '<tr><td colspan="6" class="text-center">Carregando...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/tickets`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const tickets = await response.json();

        list.innerHTML = '';
        if (tickets.length === 0) {
            list.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum chamado encontrado.</td></tr>';
            return;
        }

        tickets.forEach(ticket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${ticket.title}</strong></td>
                <td>${ticket.category}</td>
                <td><span class="badge badge-${ticket.priority}">${ticket.priority}</span></td>
                <td><span class="badge badge-${ticket.status === 'em_andamento' ? 'andamento' : ticket.status}">${ticket.status.replace('_', ' ')}</span></td>
                <td>${new Date(ticket.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;" onclick="viewTicket('${ticket.id}')">Ver</button>
                </td>
            `;
            list.appendChild(row);
        });
    } catch (error) {
        notify('Erro ao carregar chamados', 'error');
    }
}

async function createTicket(ticket) {
    try {
        const response = await fetch(`${API_URL}/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(ticket)
        });

        if (!response.ok) throw new Error('Erro ao criar chamado');

        notify('Chamado aberto com sucesso!');
        return true;
    } catch (error) {
        notify(error.message, 'error');
        return false;
    }
}

async function viewTicket(id) {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const ticket = await response.json();

        const content = `
            <div style="display: grid; gap: 1rem;">
                <p><strong>ID:</strong> ${ticket.id}</p>
                <p><strong>Usuário:</strong> ${ticket.user_name}</p>
                <p><strong>Categoria:</strong> ${ticket.category} | <strong>Prioridade:</strong> <span class="badge badge-${ticket.priority}">${ticket.priority}</span></p>
                <p><strong>Status:</strong> <span class="badge badge-${ticket.status === 'em_andamento' ? 'andamento' : ticket.status}">${ticket.status.replace('_', ' ')}</span></p>
                <div style="background: var(--secondary); padding: 1rem; border-radius: 4px;">
                    <strong>Descrição:</strong><br>${ticket.description}
                </div>
                <p style="font-size: 0.75rem; color: var(--text-muted)">
                    Criado em: ${new Date(ticket.created_at).toLocaleString()}<br>
                    Última atualização: ${new Date(ticket.updated_at).toLocaleString()}
                </p>
            </div>
        `;

        document.getElementById('detailContent').innerHTML = content;
        toggleModal('detailModal', true);
    } catch (error) {
        notify('Erro ao carregar detalhes', 'error');
    }
}
