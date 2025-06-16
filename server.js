const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const fs = require('fs');

const Usuario = require('./models/Usuario');
const Material = require('./models/Material');

const app = express();
const PORT = 3000;

// ==== Conexão MongoDB ====
const MONGODB_URI = 'mongodb+srv://user2:SuiOkTiofXefPKcQ@cluster0.geqy8ja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const UPLOAD_DIR = path.join(__dirname, 'uploads');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB conectado'))
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  });

// ==== Middlewares ====
app.use(cors({
  origin: ['https://ecoresidencialapi.onrender.com', 'https://ecoresidencial.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ==== Multer Config ====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const nomeUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, nomeUnico);
  }
});
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // limite de 5MB
  },
  fileFilter: (req, file, cb) => {
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file.originalname);
    if (!isImage) {
      return cb(new Error('Apenas imagens são permitidas!'), false);
    }
    cb(null, true);
  }
});

// ==== Middlewares Auxiliares ====
const verificarTipoUsuario = (req, res, next) => {
  let { usuario } = req.body;
  if (!usuario) return res.status(400).json({ mensagem: 'Usuário não fornecido' });

  if (typeof usuario === 'string') {
    try {
      usuario = JSON.parse(usuario);
      req.body.usuario = usuario;
    } catch {
      return res.status(400).json({ mensagem: 'Usuário inválido' });
    }
  }

  if (!['condominio', 'reciclador'].includes(usuario.tipo)) {
    return res.status(403).json({ mensagem: 'Acesso negado' });
  }

  next();
};

// ==== Rotas ====

app.post('/registro', upload.single('fotoPerfil'), async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;
    if (!nome || !email || !senha || !tipo)
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });

    const existe = await Usuario.findOne({ email });
    if (existe) return res.status(400).json({ mensagem: 'Email já cadastrado' });

    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const usuario = new Usuario({
      nome,
      email,
      senha: senhaCriptografada,
      tipo,
      fotoPerfil: req.file?.filename || null
    });

    await usuario.save();
    res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao registrar usuário' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha)
      return res.status(400).json({ mensagem: 'Email e senha são obrigatórios' });

    const usuario = await Usuario.findOne({ email });
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ mensagem: 'Email ou senha inválidos' });
    }

    const { senha: _, ...usuarioSemSenha } = usuario.toObject();
    res.json(usuarioSemSenha);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao fazer login' });
  }
});

app.post('/adicionar', upload.single('imagem'), verificarTipoUsuario, async (req, res) => {
  try {
    const { nome, descricao, quantidade, contato, usuario, valor, tipo } = req.body;
    if (!nome || !descricao || !quantidade || !contato || !valor || !tipo)
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });

    const novoMaterial = new Material({
      nome,
      descricao,
      quantidade: Number(quantidade),
      valor: Number(valor),
      tipo,
      contato,
      imagem: req.file?.filename || null,
      usuarioId: usuario.id || usuario._id
    });

    await novoMaterial.save();
    res.json({ mensagem: 'Material salvo com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao salvar material' });
  }
});

app.get('/materiais', async (req, res) => {
  try {
    const materiais = await Material.find()
      .populate('usuarioId', 'nome email tipo fotoPerfil')
      .sort({ createdAt: -1 });

    res.json(materiais);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao carregar materiais' });
  }
});

app.put('/atualizar-perfil', async (req, res) => {
  try {
    const { id, nome, email, senha, tipo } = req.body;
    if (!id || !nome || !email || !tipo)
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });

    const emailExiste = await Usuario.findOne({ email, _id: { $ne: id } });
    if (emailExiste) return res.status(400).json({ mensagem: 'Email já está em uso' });

    const updateData = { nome, email, tipo };
    if (senha) updateData.senha = await bcrypt.hash(senha, 10);

    const atualizado = await Usuario.findByIdAndUpdate(id, updateData, { new: true });
    if (!atualizado) return res.status(404).json({ mensagem: 'Usuário não encontrado' });

    const { senha: _, ...usuarioSemSenha } = atualizado.toObject();
    res.json(usuarioSemSenha);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao atualizar perfil' });
  }
});

app.post('/atualizar-foto-perfil', upload.single('fotoPerfil'), async (req, res) => {
  try {
    const { usuarioId } = req.body;
    
    // Validação mais rigorosa do ID do usuário
    if (!usuarioId || typeof usuarioId !== 'string' || usuarioId.trim() === '' || usuarioId === "undefined") {
      if (req.file) {
        const caminhoArquivo = path.join(UPLOAD_DIR, req.file.filename);
        if (fs.existsSync(caminhoArquivo)) {
          fs.unlinkSync(caminhoArquivo);
        }
      }
      return res.status(400).json({ mensagem: 'ID do usuário inválido ou não fornecido' });
    }

    // Verifica se o ID é um ObjectId válido do MongoDB
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      if (req.file) {
        const caminhoArquivo = path.join(UPLOAD_DIR, req.file.filename);
        if (fs.existsSync(caminhoArquivo)) {
          fs.unlinkSync(caminhoArquivo);
        }
      }
      return res.status(400).json({ mensagem: 'ID do usuário inválido' });
    }

    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      if (req.file) {
        const caminhoArquivo = path.join(UPLOAD_DIR, req.file.filename);
        if (fs.existsSync(caminhoArquivo)) {
          fs.unlinkSync(caminhoArquivo);
        }
      }
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    // Remove a foto antiga se existir
    if (usuario.fotoPerfil) {
      const caminhoAntigo = path.join(UPLOAD_DIR, usuario.fotoPerfil);
      if (fs.existsSync(caminhoAntigo)) {
        fs.unlinkSync(caminhoAntigo);
      }
    }

    usuario.fotoPerfil = req.file.filename;
    await usuario.save();

    res.json({ 
      mensagem: 'Foto atualizada com sucesso', 
      fotoPerfil: req.file.filename,
      urlFoto: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    // Remove o arquivo em caso de erro
    if (req.file) {
      const caminhoArquivo = path.join(UPLOAD_DIR, req.file.filename);
      if (fs.existsSync(caminhoArquivo)) {
        fs.unlinkSync(caminhoArquivo);
      }
    }
    console.error('Erro ao atualizar foto:', error);
    res.status(500).json({ 
      mensagem: 'Erro ao atualizar foto de perfil',
      erro: error.message
    });
  }
});

app.delete('/remover-material/:id', verificarTipoUsuario, async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario } = req.body;

    const usuarioId = usuario.id || usuario._id;
    const material = await Material.findOne({ _id: id, usuarioId });
    if (!material) return res.status(404).json({ mensagem: 'Material não encontrado ou acesso negado' });

    if (material.imagem) {
      const caminhoImagem = path.join(UPLOAD_DIR, material.imagem);
      if (fs.existsSync(caminhoImagem)) fs.unlinkSync(caminhoImagem);
    }

    await Material.findByIdAndDelete(id);
    res.json({ mensagem: 'Material removido com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro ao remover material' });
  }
});

// ==== Inicialização do Servidor ====
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
