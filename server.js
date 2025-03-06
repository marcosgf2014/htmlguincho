const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configuração inicial da conexão MySQL
let connection;

// Função para criar o banco de dados e tabelas
async function inicializarBancoDeDados() {
    // Primeira conexão para criar o banco
    const tempConnection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '102020'
    });

    try {
        // Criar banco de dados se não existir
        await tempConnection.promise().query('CREATE DATABASE IF NOT EXISTS guincho_db_html');
        console.log('Banco de dados criado ou já existente');
        
        // Fechar conexão temporária
        await tempConnection.promise().end();

        // Criar conexão definitiva com o banco de dados
        connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '102020',
            database: 'guincho_db_html'
        });

        // Conectar ao banco
        await connection.promise().connect();
        console.log('Conectado ao banco de dados guincho_db_html');

        // Criar tabela de clientes
        const createTableClientes = `
            CREATE TABLE IF NOT EXISTS clientes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                cpf VARCHAR(14),
                telefone VARCHAR(11),
                endereco TEXT,
                email VARCHAR(100),
                data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await connection.promise().query(createTableClientes);
        console.log('Tabela de clientes criada ou já existente');

        // Dropar tabela de serviços se existir
        await connection.promise().query('DROP TABLE IF EXISTS servicos');
        console.log('Tabela de serviços removida se existia');

        // Criar tabela de serviços
        const createTableServicos = `
            CREATE TABLE servicos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cliente_id INT NOT NULL,
                tipo_servico ENUM('Frete', 'Guincho', 'Extra') NOT NULL,
                data_servico DATE NOT NULL,
                modelo_veiculo VARCHAR(100) NOT NULL,
                placa VARCHAR(8) NOT NULL,
                valor DECIMAL(10,2) NOT NULL,
                tipo_pagamento VARCHAR(50) NOT NULL,
                nota_fiscal VARCHAR(50),
                data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cliente_id) REFERENCES clientes(id)
            )
        `;
        
        await connection.promise().query(createTableServicos);
        console.log('Tabela de serviços criada');

    } catch (error) {
        console.error('Erro na inicialização do banco:', error);
        process.exit(1);
    }
}

// Inicializar o banco de dados antes de iniciar o servidor
inicializarBancoDeDados().then(() => {
    // Rotas para clientes
    // Listar todos os clientes
    app.get('/api/clientes', (req, res) => {
        connection.query('SELECT * FROM clientes', (err, results) => {
            if (err) {
                console.error('Erro ao listar clientes:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(results);
        });
    });

    // Buscar cliente por ID
    app.get('/api/clientes/:id', (req, res) => {
        connection.query('SELECT * FROM clientes WHERE id = ?', [req.params.id], (err, results) => {
            if (err) {
                console.error('Erro ao buscar cliente:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(results[0]);
        });
    });

    // Adicionar novo cliente
    app.post('/api/clientes', (req, res) => {
        const cliente = req.body;
        connection.query('INSERT INTO clientes SET ?', cliente, (err, result) => {
            if (err) {
                console.error('Erro ao adicionar cliente:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: result.insertId, ...cliente });
        });
    });

    // Atualizar cliente
    app.put('/api/clientes/:id', (req, res) => {
        const cliente = req.body;
        connection.query('UPDATE clientes SET ? WHERE id = ?', [cliente, req.params.id], (err) => {
            if (err) {
                console.error('Erro ao atualizar cliente:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: req.params.id, ...cliente });
        });
    });

    // Deletar cliente
    app.delete('/api/clientes/:id', (req, res) => {
        connection.query('DELETE FROM clientes WHERE id = ?', [req.params.id], (err) => {
            if (err) {
                console.error('Erro ao deletar cliente:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Cliente deletado com sucesso' });
        });
    });

    // Buscar clientes por termo
    app.get('/api/clientes/busca/:termo', (req, res) => {
        const termo = `%${req.params.termo}%`;
        const query = `
            SELECT * FROM clientes 
            WHERE nome LIKE ? 
            OR cpf LIKE ? 
            OR telefone LIKE ? 
            OR email LIKE ?
        `;
        
        connection.query(query, [termo, termo, termo, termo], (err, results) => {
            if (err) {
                console.error('Erro ao buscar clientes:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(results);
        });
    });

    // Rotas para serviços
    // Listar todos os serviços
    app.get('/api/servicos', (req, res) => {
        const query = `
            SELECT s.*, c.nome as nome_cliente 
            FROM servicos s 
            JOIN clientes c ON s.cliente_id = c.id
            ORDER BY s.data_servico DESC
        `;
        connection.query(query, (err, results) => {
            if (err) {
                console.error('Erro ao listar serviços:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(results);
        });
    });

    // Buscar serviço por ID
    app.get('/api/servicos/:id', (req, res) => {
        const query = `
            SELECT s.*, c.nome as nome_cliente 
            FROM servicos s 
            JOIN clientes c ON s.cliente_id = c.id 
            WHERE s.id = ?
        `;
        connection.query(query, [req.params.id], (err, results) => {
            if (err) {
                console.error('Erro ao buscar serviço:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(results[0]);
        });
    });

    // Adicionar novo serviço
    app.post('/api/servicos', (req, res) => {
        const servico = req.body;
        connection.query('INSERT INTO servicos SET ?', servico, (err, result) => {
            if (err) {
                console.error('Erro ao adicionar serviço:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: result.insertId, ...servico });
        });
    });

    // Atualizar serviço
    app.put('/api/servicos/:id', (req, res) => {
        const servico = req.body;
        connection.query('UPDATE servicos SET ? WHERE id = ?', [servico, req.params.id], (err) => {
            if (err) {
                console.error('Erro ao atualizar serviço:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: req.params.id, ...servico });
        });
    });

    // Deletar serviço
    app.delete('/api/servicos/:id', (req, res) => {
        connection.query('DELETE FROM servicos WHERE id = ?', [req.params.id], (err) => {
            if (err) {
                console.error('Erro ao deletar serviço:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Serviço deletado com sucesso' });
        });
    });

    // Buscar serviços por cliente
    app.get('/api/servicos/cliente/:clienteId', (req, res) => {
        const query = `
            SELECT s.*, c.nome as nome_cliente 
            FROM servicos s 
            JOIN clientes c ON s.cliente_id = c.id 
            WHERE s.cliente_id = ?
            ORDER BY s.data_servico DESC
        `;
        connection.query(query, [req.params.clienteId], (err, results) => {
            if (err) {
                console.error('Erro ao buscar serviços do cliente:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(results);
        });
    });

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}); 