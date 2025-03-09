const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Dados em memória
let clientes = [];
let servicos = [];
let clienteIdCounter = 1;
let servicoIdCounter = 1;

// Rotas para clientes
app.get('/api/clientes', (req, res) => {
    res.json(clientes);
});

app.get('/api/clientes/:id', (req, res) => {
    const cliente = clientes.find(c => c.id === parseInt(req.params.id));
    if (!cliente) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
    }
    res.json(cliente);
});

app.post('/api/clientes', (req, res) => {
    const cliente = {
        id: clienteIdCounter++,
        ...req.body,
        data_cadastro: new Date().toISOString()
    };
    clientes.push(cliente);
    res.json(cliente);
});

app.put('/api/clientes/:id', (req, res) => {
    const index = clientes.findIndex(c => c.id === parseInt(req.params.id));
    if (index === -1) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
    }
    const cliente = {
        ...clientes[index],
        ...req.body
    };
    clientes[index] = cliente;
    res.json(cliente);
});

app.delete('/api/clientes/:id', (req, res) => {
    const index = clientes.findIndex(c => c.id === parseInt(req.params.id));
    if (index === -1) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
    }
    clientes.splice(index, 1);
    res.json({ message: 'Cliente deletado com sucesso' });
});

app.get('/api/clientes/busca/:termo', (req, res) => {
    const termo = req.params.termo.toLowerCase();
    const resultado = clientes.filter(cliente => 
        cliente.nome?.toLowerCase().includes(termo) ||
        cliente.cpf?.includes(termo) ||
        cliente.telefone?.includes(termo) ||
        cliente.email?.toLowerCase().includes(termo)
    );
    res.json(resultado);
});

// Rotas para serviços
app.get('/api/servicos', (req, res) => {
    const servicosComClientes = servicos.map(servico => {
        const cliente = clientes.find(c => c.id === servico.cliente_id);
        return {
            ...servico,
            nome_cliente: cliente ? cliente.nome : 'Cliente não encontrado'
        };
    });
    res.json(servicosComClientes);
});

app.get('/api/servicos/:id', (req, res) => {
    const servico = servicos.find(s => s.id === parseInt(req.params.id));
    if (!servico) {
        res.status(404).json({ error: 'Serviço não encontrado' });
        return;
    }
    const cliente = clientes.find(c => c.id === servico.cliente_id);
    res.json({
        ...servico,
        nome_cliente: cliente ? cliente.nome : 'Cliente não encontrado'
    });
});

app.post('/api/servicos', (req, res) => {
    const servico = {
        id: servicoIdCounter++,
        ...req.body,
        data_cadastro: new Date().toISOString()
    };
    servicos.push(servico);
    res.json(servico);
});

app.put('/api/servicos/:id', (req, res) => {
    const index = servicos.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) {
        res.status(404).json({ error: 'Serviço não encontrado' });
        return;
    }
    const servico = {
        ...servicos[index],
        ...req.body
    };
    servicos[index] = servico;
    res.json(servico);
});

app.delete('/api/servicos/:id', (req, res) => {
    const index = servicos.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) {
        res.status(404).json({ error: 'Serviço não encontrado' });
        return;
    }
    servicos.splice(index, 1);
    res.json({ message: 'Serviço deletado com sucesso' });
});

app.get('/api/servicos/cliente/:clienteId', (req, res) => {
    const servicosDoCliente = servicos
        .filter(s => s.cliente_id === parseInt(req.params.clienteId))
        .map(servico => {
            const cliente = clientes.find(c => c.id === servico.cliente_id);
            return {
                ...servico,
                nome_cliente: cliente ? cliente.nome : 'Cliente não encontrado'
            };
        });
    res.json(servicosDoCliente);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 