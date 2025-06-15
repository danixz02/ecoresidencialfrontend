const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['condominio', 'reciclador', 'admin', 'usuario'],
    required: true
  },
  fotoPerfil: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Usuario', usuarioSchema); 