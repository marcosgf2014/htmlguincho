// Funções de utilidade
function formatCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
}

function formatTelefone(telefone) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/g, '($1) $2-$3');
}

// Carregar clientes ao iniciar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarClientes();
    
    // Adicionar máscaras aos campos
    document.getElementById('cpf').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
            e.target.value = value;
        }
    });

    document.getElementById('telefone').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/g, '($1) $2-$3');
            e.target.value = value;
        }
    });

    // Configurar o formulário
    document.getElementById('clienteForm').addEventListener('submit', (e) => {
        e.preventDefault();
        salvarCliente();
    });
});

// Funções CRUD
async function carregarClientes() {
    try {
        const response = await fetch('http://localhost:3000/api/clientes');
        const clientes = await response.json();
        atualizarTabelaClientes(clientes);
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        alert('Erro ao carregar clientes. Por favor, tente novamente.');
    }
}

async function salvarCliente() {
    const clienteId = document.getElementById('clienteId').value;
    const cliente = {
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        telefone: document.getElementById('telefone').value,
        endereco: document.getElementById('endereco').value,
        email: document.getElementById('email').value
    };

    try {
        const url = clienteId 
            ? `http://localhost:3000/api/clientes/${clienteId}`
            : 'http://localhost:3000/api/clientes';
        
        const response = await fetch(url, {
            method: clienteId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cliente)
        });

        if (response.ok) {
            limparFormulario();
            carregarClientes();
            alert(clienteId ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!');
        } else {
            throw new Error('Erro ao salvar cliente');
        }
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        alert('Erro ao salvar cliente. Por favor, tente novamente.');
    }
}

async function excluirCliente(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/clientes/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            carregarClientes();
            alert('Cliente excluído com sucesso!');
        } else {
            throw new Error('Erro ao excluir cliente');
        }
    } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Erro ao excluir cliente. Por favor, tente novamente.');
    }
}

async function editarCliente(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/clientes/${id}`);
        const cliente = await response.json();

        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('nome').value = cliente.nome;
        document.getElementById('cpf').value = cliente.cpf;
        document.getElementById('telefone').value = cliente.telefone;
        document.getElementById('endereco').value = cliente.endereco;
        document.getElementById('email').value = cliente.email;
    } catch (error) {
        console.error('Erro ao carregar cliente:', error);
        alert('Erro ao carregar dados do cliente. Por favor, tente novamente.');
    }
}

async function searchClientes() {
    const termo = document.getElementById('searchInput').value;
    if (!termo) {
        carregarClientes();
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/clientes/busca/${termo}`);
        const clientes = await response.json();
        atualizarTabelaClientes(clientes);
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        alert('Erro ao buscar clientes. Por favor, tente novamente.');
    }
}

// Funções auxiliares
function limparFormulario() {
    document.getElementById('clienteForm').reset();
    document.getElementById('clienteId').value = '';
}

function atualizarTabelaClientes(clientes) {
    const tbody = document.getElementById('clientesTable');
    tbody.innerHTML = '';

    clientes.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.cpf || '-'}</td>
            <td>${cliente.telefone || '-'}</td>
            <td>${cliente.email || '-'}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editarCliente(${cliente.id})">Editar</button>
                <button class="delete-btn" onclick="excluirCliente(${cliente.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
} 