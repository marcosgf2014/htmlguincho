# Sistema de Gerenciamento de Guincho

Sistema web para gerenciamento de serviços de guincho, desenvolvido com Node.js, Express e MySQL.

## Requisitos

- Node.js
- MySQL Server
- npm (Node Package Manager)

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_SEU_REPOSITORIO]
cd guincho
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o banco de dados:
- Importe o arquivo `database_backup.sql` para seu MySQL
- O arquivo contém toda a estrutura necessária do banco de dados

4. Configure as credenciais do banco de dados:
- As configurações padrão são:
  - Host: localhost
  - Usuário: root
  - Senha: 102020
  - Banco: guincho_db
- Se necessário, ajuste estas configurações no arquivo `server.js`

## Executando o projeto

Para desenvolvimento (com auto-reload):
```bash
npm run dev
```

Para produção:
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

## Estrutura do Banco de Dados

O sistema utiliza duas tabelas principais:

1. `clientes`: Armazena informações dos clientes
2. `servicos`: Registra os serviços prestados

## Funcionalidades

- Cadastro e gerenciamento de clientes
- Registro e controle de serviços
- Busca de clientes
- Relatórios de serviços

## Suporte

Para suporte ou dúvidas, entre em contato através de [seu-email] 