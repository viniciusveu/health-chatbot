![Node.js](https://img.shields.io/badge/Node.js-22.x-green)
![NestJS](https://img.shields.io/badge/NestJS-Framework-red)
![Status](https://img.shields.io/badge/status-em%20testes-blue)

# 🏥 Health Chatbot

Este projeto é um chatbot modular e escalável para comunicação automatizada com pacientes em serviços de saúde. Ele é baseado em eventos e pode ser facilmente adaptado para outros tipos de negócio que demandem notificações personalizadas e automatizadas (como CRMs, sistemas de agendamento, etc).

---

## 📁 Estrutura do Projeto

```
health-chatbot/
│
├── apps/
│   ├── chatbot/         # Serviço principal de chatbot com lógica de envio e geração de mensagens
│   ├── event-worker/    # Serviço que processa eventos do sistema e transforma em comandos
│   └── message-worker/  # Serviço responsável por enviar mensagens
│
├── libs/
│   ├── auth/            # Biblioteca de autenticação
│   ├── database/        # Biblioteca de banco de dados
│   ├── logging/         # Biblioteca de logging
│   ├── queue/           # Biblioteca de fila de mensagens
│   └── shared/          # Biblioteca compartilhada contendo DTOs, interfaces, helpers, etc.
│
├── docker-compose.yml   # Orquestração de serviços com Docker
├── package.json         # Dependências e scripts da monorepo
└── README.md
```

---

## ✏️ Detalhes Técnicos

O repositório é um monorepo baseado em NestJS, com três serviços principais:

- `chatbot`
- `event-worker`
- `message-worker`

O **event-worker** expõe uma API pública para receber eventos externos de sistemas integrados (CRM, ERP, sistemas de agendamento etc). Esses eventos são enviados para uma fila identificada por tópicos definidos em `ContextOptions`.

O **chatbot** é o serviço principal, desenvolvido com clean architecture. Ele consome eventos, executa casos de uso, acessa dados e gera mensagens personalizadas. Também se comunica com as filas internas definidas por `InternalContextOptions`, como `send-message` e `message-received`.

O **message-worker** lida com o envio e o recebimento de mensagens com usuários via APIs externas como o Twilio. Ele publica mensagens recebidas em `message-received` e consome de `send-message` para disparo.

---

## ⚙️ Tecnologias Utilizadas

- **Node.js / NestJS** – Estrutura modular e robusta
- **PostgreSQL + Prisma ORM** – Banco de dados relacional
- **RabbitMQ** – Comunicação assíncrona entre serviços
- **Docker** – Containerização para fácil deploy
- **Twilio API** – Envio de mensagens via WhatsApp
- **Gemini API (Google)** – IA generativa para criação de mensagens

---

## 🚀 Como Subir o Projeto

1. Crie um arquivo `.env` com as variáveis de ambiente necessárias (veja `.env.example`).
2. Execute:

```bash
docker-compose up --build
```

3. A API estará acessível em `http://localhost:3000`.

---

## 🧩 Funcionalidades Implementadas

- ✉️ Envio de confirmação de consulta
- 🧠 Geração de mensagens com Gemini
- 📤 Disparo via WhatsApp (Twilio)
- 🔁 Consumo e publicação de eventos via RabbitMQ
- 🧪 Testes unitários (`*.spec.ts`)
- 📡 Comunicação desacoplada entre serviços via filas

---

## 🧠 Adicionando Novas Funcionalidades

1. Crie um novo caso de uso em `apps/chatbot/src/application/use-cases/`
2. Adicione um novo evento no enum `ContextOptions`
4. Teste e documente a nova funcionalidade

---

## 🔌 Integração com Outros Sistemas

- REST API via `event-worker`
- Publicação direta na fila RabbitMQ
- Triggers de banco que disparam eventos

---

## 🔐 Segurança

- Conformidade com LGPD (dados anonimizados)
- Autenticação via middleware (lib `auth`)
- Arquitetura orientada a eventos para isolamento e escalabilidade

---

## 📄 Licença

MIT — Sinta-se livre para usar, modificar e adaptar este projeto.

---

> Desenvolvido com ♥ por Vinícius Vedovotto – MBA Engenharia de Software – ESALQ/USP - 2025