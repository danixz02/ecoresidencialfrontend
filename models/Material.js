const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  quantidade: {
    type: Number,
    required: true
  },
  valor: {
    type: Number,
    required: true
  },
  tipo: {
    type: String,
    required: true
  },
  contato: {
    type: String,
    required: true
  },
  imagem: {
    type: String
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', materialSchema); 