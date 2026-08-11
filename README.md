# Weliton Alves Imóveis – Sistema Web Imobiliário

Sistema web profissional desenvolvido para corretor de imóveis com foco exclusivo em venda de imóveis na cidade de Vila Velha.

O projeto segue arquitetura moderna desacoplada utilizada por startups.

---

## Arquitetura

Frontend (Vercel)  
→ API Node.js + Express (Render)  
→ MongoDB Atlas  
→ Cloudinary (armazenamento de imagens)

---

## Funcionalidades

### Área Pública

- Landing page com listagem de imóveis
- Filtro por tipo e valor
- Página institucional
- Página de contato

### Área Administrativa (/admin)

- Login seguro com JWT
- Senhas criptografadas com bcrypt
- Cadastro de imóveis
- Edição de imóveis
- Upload de imagens
- Atualização automática na landing page

---

## Tecnologias Utilizadas

Backend:

- Node.js
- Express
- MongoDB (Mongoose)
- JWT
- bcrypt
- Cloudinary

Frontend:

- HTML
- CSS
- JavaScript

Infraestrutura:

- Vercel 
- Render
- MongoDB Atlas

---

## Estrutura do Projeto

/backend
/frontend
/docs
README.md

---

## Segurança

- Autenticação via JWT
- Senhas criptografadas
- Rotas protegidas por middleware
- Variáveis sensíveis armazenadas em .env

---

## Regras de Negócio

- Sistema exclusivo para venda (sem aluguel)
- Apenas imóveis ativos aparecem na landing
---

## Objetivo do Projeto

Criar uma plataforma profissional para captação de clientes e gerenciamento interno de imóveis, destacando a experiência jurídica do corretor como diferencial competitivo.
