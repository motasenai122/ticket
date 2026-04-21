async function loadAdminTickets() {
    const list = document.getElementById('adminTicketsList');
    list.innerHTML = '<tr><td colspan="5" class="text-center">Carregando...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/tickets`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const tickets = await response.json();

        list.innerHTML = '';
        tickets.forEach(ticket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ticket.user_name}</td>
                <td><strong>${ticket.title}</strong></td>
                <td><span class="badge badge-${ticket.priority}">${ticket.priority}</span></td>
                <td><span class="badge badge-${ticket.status === 'em_andamento' ? 'andamento' : ticket.status}">${ticket.status.replace('_', ' ')}</span></td>
                <td>
                    <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;" onclick="openStatusModal('${ticket.id}', '${ticket.title}', '${ticket.status}')">Status</button>
                </td>
            `;
            list.appendChild(row);
        });
    } catch (error) {
        notify('Erro ao carregar chamados', 'error');
    }
}

async function loadUsers() {
    const list = document.getElementById('usersList');
    list.innerHTML = '<tr><td colspan="5" class="text-center">Carregando...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const users = await response.json();

        list.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span style="text-transform: capitalize">${user.role}</span></td>
                <td><span class="badge ${user.active ? 'badge-resolvido' : 'badge-fechado'}">${user.active ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                    <button class="btn" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; background: ${user.active ? '#ef4444' : '#10b981'}; color: white;" 
                            onclick="toggleUserStatus('${user.id}', ${!user.active})">
                        ${user.active ? 'Desativar' : 'Ativar'}
                    </button>
                </td>
            `;
            list.appendChild(row);
        });
    } catch (error) {
        notify('Erro ao carregar usuários', 'error');
    }
}

async function createUser(userData) {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao criar usuário');

        notify('Usuário criado com sucesso!');
        return true;
    } catch (error) {
        notify(error.message, 'error');
        return false;
    }
}

async function toggleUserStatus(id, active) {
    try {
        const response = await fetch(`${API_URL}/users/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ active })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao alterar status');
        }

        notify('Status do usuário atualizado!');
        loadUsers();
    } catch (error) {
        notify(error.message, 'error');
    }
}

function openStatusModal(id, title, currentStatus) {
    document.getElementById('currentTicketId').value = id;
    document.getElementById('ticketInfo').textContent = `Chamado: ${title}`;
    document.getElementById('newStatus').value = currentStatus;
    toggleModal('statusModal', true);
}

async function confirmStatusUpdate() {
    const id = document.getElementById('currentTicketId').value;
    const status = document.getElementById('newStatus').value;

    try {
        const response = await fetch(`${API_URL}/tickets/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) throw new Error('Erro ao atualizar status');

        notify('Status do chamado atualizado!');
        toggleModal('statusModal', false);
        loadAdminTickets();
    } catch (error) {
        notify(error.message, 'error');
    }
}
