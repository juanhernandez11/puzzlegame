const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();
const SECRET = process.env.SECRET || 'fallback-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://puzzleuser:SecurePass2024@cluster0.u6d6hwd.mongodb.net/puzzle-game';

// Conectar a MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB conectado'))
    .catch(err => console.error('❌ Error MongoDB:', err.message));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Middleware de autenticación
function auth(req, res, next) {
    const token = req.headers.authorization;
    if(!token) return res.status(401).json({error: 'No autorizado'});
    
    try {
        const decoded = jwt.verify(token, SECRET);
        req.userId = decoded.id;
        next();
    } catch(e) {
        res.status(401).json({error: 'Token inválido'});
    }
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/register', async (req, res) => {
    const {username, password} = req.body;
    
    if(!username || !password) {
        return res.status(400).json({error: 'Faltan datos'});
    }
    
    try {
        const existingUser = await User.findOne({username});
        if(existingUser) {
            return res.status(409).json({error: 'Usuario ya existe'});
        }
        
        const hash = await bcrypt.hash(password, 10);
        const user = new User({username, password: hash});
        await user.save();
        
        const token = jwt.sign({id: user._id}, SECRET);
        res.json({token});
    } catch(e) {
        res.status(500).json({error: 'Error al registrar'});
    }
});

app.post('/api/login', async (req, res) => {
    const {username, password} = req.body;
    
    try {
        const user = await User.findOne({username});
        if(!user) return res.status(404).json({error: 'Usuario no encontrado'});
        
        const valid = await bcrypt.compare(password, user.password);
        if(!valid) return res.status(401).json({error: 'Contraseña incorrecta'});
        
        const token = jwt.sign({id: user._id}, SECRET);
        res.json({token});
    } catch(e) {
        res.status(500).json({error: 'Error al iniciar sesión'});
    }
});

app.get('/api/game', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if(!user) return res.status(404).json({error: 'Usuario no encontrado'});
        
        res.json({username: user.username, gameState: user.gameState});
    } catch(e) {
        res.status(500).json({error: 'Error al cargar juego'});
    }
});

app.post('/api/save', auth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.userId, {gameState: req.body.gameState});
        res.json({success: true});
    } catch(e) {
        res.status(500).json({error: 'Error al guardar'});
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const users = await User.find({'gameState.score': {$gt: 0}})
            .select('username gameState.level gameState.xp gameState.score')
            .sort({'-gameState.score': -1})
            .limit(10);
        
        const leaderboard = users.map(u => ({
            username: u.username,
            level: u.gameState.level || 1,
            xp: u.gameState.xp || 0,
            score: u.gameState.score || 0
        }));
        
        res.json(leaderboard);
    } catch(e) {
        res.json([]);
    }
});

// Servir archivos estáticos
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📊 Usando MongoDB Atlas`);
});