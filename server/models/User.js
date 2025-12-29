const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gameState: {
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        currentPuzzle: { type: Number, default: 1 },
        moves: { type: Number, default: 0 },
        grid: { type: Array, default: [] },
        emptyPos: { type: Number, default: 8 },
        gridSize: { type: Number, default: 3 },
        score: { type: Number, default: 0 },
        hints: { type: Number, default: 3 },
        achievements: { type: Array, default: [] }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
