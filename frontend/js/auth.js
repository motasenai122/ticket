
/**
 * Salva o token e dados do usuário no localStorage
 */
function setAuth(token, user) {
    localStorage.setItem('helpdesk_token', token);
    localStorage.setItem('helpdesk_user', JSON.stringify(user));
}

/**
 * Retorna o token salvo
 */
function getToken() {
    return localStorage.getItem('helpdesk_token');
}

/**
 * Retorna os dados do usuário salvo
 */
function getUser() {
    const user = localStorage.getItem('helpdesk_user');
    return user ? JSON.parse(user) : null;
}

/**
 * Limpa a sessão e redireciona para o login
 */
function logout() {
    localStorage.removeItem('helpdesk_token');
    localStorage.removeItem('helpdesk_user');
    window.location.href = 'index.html';
}

/**
 * Verifica se o usuário está autenticado e redireciona se necessário
 */
async function checkAuth() {
    const token = getToken();
    if (!token) {
        if (!window.location.pathname.endsWith('index.html')) {
            window.location.href = 'index.html';
        }
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Sessão expirada');
        }

        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Erro na autenticação:', error);
        logout();
        return null;
    }
}

/**
 * Exibe notificação temporária
 */
function notify(message, type = 'success') {
    const div = document.createElement('div');
    div.className = `notification ${type}`;
    div.textContent = message;
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, 3000);
}
