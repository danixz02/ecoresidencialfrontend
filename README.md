# EcoResidencial - Plataforma de Reciclagem

## 📋 Sobre o Projeto
O EcoResidencial é uma plataforma web que conecta condomínios e recicladores, facilitando a gestão e comercialização de materiais recicláveis. O projeto visa promover a sustentabilidade e a economia circular através da tecnologia. <br>
Preview: https://ecoresidencial.vercel.app/

## 🚀 Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- MongoDB
- Multer (para upload de imagens)
- Bcrypt (para criptografia de senhas)
- CORS

### Frontend
- HTML5
- CSS3
- JavaScript
- Vercel (deploy)

## 🔧 Funcionalidades Principais

### Usuários
- Registro de usuários (condomínios e recicladores)
- Login com autenticação
- Perfil personalizado com foto
- Atualização de dados do perfil

### Materiais
- Cadastro de materiais recicláveis
- Upload de imagens dos materiais
- Listagem de materiais disponíveis
- Remoção de materiais
- Detalhes como quantidade, valor e descrição

## 🔐 Segurança
- Senhas criptografadas com bcrypt
- Validação de tipos de usuário
- Upload de imagens com validação de tipo e tamanho
- Proteção contra acessos não autorizados

## 🚀 Deploy
- Backend: Render
- Frontend: Vercel
- Banco de Dados: MongoDB Atlas

## 📝 Requisitos do Sistema
- Node.js
- MongoDB
- NPM ou Yarn

## 🔧 Instalação e Execução

### Backend
```bash
# Instalar dependências
npm init -y
npm install express dotenv multer path cors bcrypt mongoose

# Configurar variáveis de ambiente
# Criar arquivo .env com as configurações necessárias 

# Iniciar servidor
npm start
```

### package.json
```bash
# Adicione esse script para a inicialização do servidor 

"scripts": {
    "start": "node server.js",
}
```


## Este projeto foi desenvolvido como trabalho acadêmico.

## 👥 Autores
Arthur Grama Pedrosa, Barbara Kezia Moreira dos Santos, Daniel Friedrich de Moura, Emerson Matias de Lima, Jean Carlos Mendes dos Santos e Karen Waynne Lemos Araújo
