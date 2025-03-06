// Funções de utilidade
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarPlaca(placa) {
    return placa.toUpperCase();
}

// Carregar dados ao iniciar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarClientes();
    carregarServicos();
    
    // Configurar máscara da placa
    document.getElementById('placa').addEventListener('input', (e) => {
        let value = e.target.value.toUpperCase();
        e.target.value = value;
    });

    // Configurar o formulário
    document.getElementById('servicoForm').addEventListener('submit', (e) => {
        e.preventDefault();
        salvarServico();
    });

    // Configurar data máxima como hoje
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data_servico').max = hoje;
});

// Funções para carregar dados
async function carregarClientes() {
    try {
        const response = await fetch('http://localhost:3000/api/clientes');
        const clientes = await response.json();
        
        const selectCliente = document.getElementById('cliente_id');
        const selectFiltro = document.getElementById('clienteFilter');
        
        // Limpar opções existentes
        selectCliente.innerHTML = '<option value="">Selecione um cliente</option>';
        selectFiltro.innerHTML = '<option value="">Todos os clientes</option>';
        
        // Adicionar clientes aos selects
        clientes.forEach(cliente => {
            selectCliente.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
            selectFiltro.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
        });
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        alert('Erro ao carregar lista de clientes. Por favor, tente novamente.');
    }
}

async function carregarServicos() {
    try {
        const response = await fetch('http://localhost:3000/api/servicos');
        const servicos = await response.json();
        atualizarTabelaServicos(servicos);
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        alert('Erro ao carregar serviços. Por favor, tente novamente.');
    }
}

// Funções CRUD
async function salvarServico() {
    const servicoId = document.getElementById('servicoId').value;
    const servico = {
        tipo_servico: document.getElementById('tipo_servico').value,
        data_servico: document.getElementById('data_servico').value,
        cliente_id: document.getElementById('cliente_id').value,
        modelo_veiculo: document.getElementById('modelo_veiculo').value,
        placa: document.getElementById('placa').value.toUpperCase(),
        valor: document.getElementById('valor').value,
        tipo_pagamento: document.getElementById('tipo_pagamento').value,
        nota_fiscal: document.getElementById('nota_fiscal').value
    };

    try {
        const url = servicoId 
            ? `http://localhost:3000/api/servicos/${servicoId}`
            : 'http://localhost:3000/api/servicos';
        
        const response = await fetch(url, {
            method: servicoId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(servico)
        });

        if (response.ok) {
            limparFormulario();
            carregarServicos();
            alert(servicoId ? 'Serviço atualizado com sucesso!' : 'Serviço cadastrado com sucesso!');
        } else {
            throw new Error('Erro ao salvar serviço');
        }
    } catch (error) {
        console.error('Erro ao salvar serviço:', error);
        alert('Erro ao salvar serviço. Por favor, tente novamente.');
    }
}

async function editarServico(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/servicos/${id}`);
        const servico = await response.json();

        document.getElementById('servicoId').value = servico.id;
        document.getElementById('tipo_servico').value = servico.tipo_servico;
        document.getElementById('data_servico').value = servico.data_servico.split('T')[0];
        document.getElementById('cliente_id').value = servico.cliente_id;
        document.getElementById('modelo_veiculo').value = servico.modelo_veiculo;
        document.getElementById('placa').value = servico.placa;
        document.getElementById('valor').value = servico.valor;
        document.getElementById('tipo_pagamento').value = servico.tipo_pagamento;
        document.getElementById('nota_fiscal').value = servico.nota_fiscal || '';
    } catch (error) {
        console.error('Erro ao carregar serviço:', error);
        alert('Erro ao carregar dados do serviço. Por favor, tente novamente.');
    }
}

async function excluirServico(id) {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/servicos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            carregarServicos();
            alert('Serviço excluído com sucesso!');
        } else {
            throw new Error('Erro ao excluir serviço');
        }
    } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        alert('Erro ao excluir serviço. Por favor, tente novamente.');
    }
}

async function filtrarServicos() {
    const clienteId = document.getElementById('clienteFilter').value;
    try {
        const response = await fetch(clienteId 
            ? `http://localhost:3000/api/servicos/cliente/${clienteId}`
            : 'http://localhost:3000/api/servicos'
        );
        const servicos = await response.json();
        atualizarTabelaServicos(servicos);
    } catch (error) {
        console.error('Erro ao filtrar serviços:', error);
        alert('Erro ao filtrar serviços. Por favor, tente novamente.');
    }
}

// Funções auxiliares
function limparFormulario() {
    document.getElementById('servicoForm').reset();
    document.getElementById('servicoId').value = '';
}

function atualizarTabelaServicos(servicos) {
    const tbody = document.getElementById('servicosTable');
    tbody.innerHTML = '';

    servicos.forEach(servico => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarData(servico.data_servico)}</td>
            <td>${servico.tipo_servico}</td>
            <td>${servico.nome_cliente}</td>
            <td>${servico.modelo_veiculo}</td>
            <td>${servico.placa}</td>
            <td>${formatarMoeda(servico.valor)}</td>
            <td>${servico.tipo_pagamento}</td>
            <td>${servico.nota_fiscal || '-'}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editarServico(${servico.id})">Editar</button>
                <button class="delete-btn" onclick="excluirServico(${servico.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
} 