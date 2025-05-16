const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('teste', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    port: 3306
});

const Imagens = sequelize.define('Imagens', {
    nome: { type: DataTypes.STRING, allowNull: false },
    dados: { type: DataTypes.BLOB('long'), allowNull: false },
    tipo: { type: DataTypes.STRING, allowNull: false }
});

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());

app.post('/', upload.single('imagem'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Imagem não enviada' });

    const novaImagem = await Imagens.create({
        nome: req.file.originalname,
        dados: req.file.buffer,
        tipo: req.file.mimetype
    });

    res.status(201).json({ id: novaImagem.id, nome: novaImagem.nome });
});

app.get('/', async (req, res) => {
    // Retorna só id, nome e tipo para listar sem enviar blob pesado
    const imagens = await Imagens.findAll({
        attributes: ['id', 'nome', 'tipo']
    });
    res.json(imagens);
});

app.get('/:id', async (req, res) => {
    const imagem = await Imagens.findByPk(req.params.id);
    if (!imagem) return res.status(404).send('Imagem não encontrada');

    res.set('Content-Type', imagem.tipo);
    res.send(imagem.dados);
});

sequelize.sync({ alter: true }).then(() => {
    app.listen(3000, () => console.log('API rodando em http://localhost:3000'));
});
