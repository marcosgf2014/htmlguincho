-- Criar o banco de dados
CREATE DATABASE IF NOT EXISTS guincho_db_html;
USE guincho_db_html;

-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14),
    telefone VARCHAR(11),
    endereco TEXT,
    email VARCHAR(100),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de serviços
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
); 