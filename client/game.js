const API_URL = 'https://puzzlegame-tau.vercel.app/api';
let token = localStorage.getItem('token');
let gameState = {
    level: 1,
    xp: 0,
    currentPuzzle: 1,
    moves: 0,
    grid: [],
    emptyPos: 8,
    gridSize: 3,
    score: 0,
    hints: 3,
    achievements: []
};
let timerInterval = null;
let startTime = 0;
let combo = 0;
let lastCompletionTime = Date.now();
let skipTimeout = null;
let skipCountdown = null;
let skipsUsed = 0;
let lastSkipTime = 0;

// Logros disponibles
const achievements = [
    {id: 'first_win', name: 'Primera Victoria', desc: 'Completa tu primer puzzle', icon: '🏆'},
    {id: 'speed_demon', name: 'Demonio Veloz', desc: 'Completa un puzzle en menos de 30 segundos', icon: '⚡'},
    {id: 'efficient', name: 'Eficiente', desc: 'Completa un 3x3 en menos de 20 movimientos', icon: '🎯'},
    {id: 'level_5', name: 'Veterano', desc: 'Alcanza nivel 5', icon: '⭐'},
    {id: 'master', name: 'Maestro', desc: 'Completa un 5x5', icon: '👑'},
    {id: 'combo_king', name: 'Rey del Combo', desc: 'Consigue un combo x5', icon: '🔥'},
    {id: 'perfectionist', name: 'Perfeccionista', desc: 'Completa un puzzle con puntuación perfecta', icon: '💎'}
];

function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

async function testConnection() {
    const testBtn = event.target;
    const originalText = testBtn.textContent;
    testBtn.textContent = '🔄 Probando...';
    testBtn.disabled = true;
    
    const results = [];
    
    try {
        // Test 1: Basic connectivity
        results.push('\n🌐 PRUEBA DE CONEXIÓN:');
        results.push('User Agent: ' + navigator.userAgent);
        results.push('Online: ' + navigator.onLine);
        
        // Test 2: API Health Check
        try {
            const start = Date.now();
            const res = await fetch(`${API_URL}/health`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            const time = Date.now() - start;
            const data = await res.json();
            results.push(`\n✅ API Health: OK (${time}ms)`);
            results.push('Status: ' + res.status);
            results.push('Response: ' + JSON.stringify(data));
        } catch (e) {
            results.push('\n❌ API Health: FAILED');
            results.push('Error: ' + e.message);
        }
        
        // Test 3: CORS Test
        try {
            const res = await fetch(`${API_URL}/leaderboard`);
            const data = await res.json();
            results.push(`\n✅ CORS Test: OK`);
            results.push('Leaderboard entries: ' + data.length);
        } catch (e) {
            results.push('\n❌ CORS Test: FAILED');
            results.push('Error: ' + e.message);
        }
        
        // Test 4: POST Test
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'test', password: 'test' })
            });
            const data = await res.json();
            results.push(`\n✅ POST Test: OK`);
            results.push('Status: ' + res.status);
            results.push('Response: ' + JSON.stringify(data));
        } catch (e) {
            results.push('\n❌ POST Test: FAILED');
            results.push('Error: ' + e.message);
        }
        
    } catch (e) {
        results.push('\n❌ General Error: ' + e.message);
    }
    
    // Show results
    const resultText = results.join('\n');
    console.log(resultText);
    
    // Create modal to show results
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:white;padding:20px;border-radius:10px;max-width:90%;max-height:80%;overflow-y:auto;">
            <h3>Resultados del Test de Conexión</h3>
            <pre style="font-size:12px;white-space:pre-wrap;">${resultText}</pre>
            <button onclick="this.parentElement.parentElement.remove()" style="margin-top:10px;padding:10px;background:#007bff;color:white;border:none;border-radius:5px;">Cerrar</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    testBtn.textContent = originalText;
    testBtn.disabled = false;
}

async function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    
    if(!username || !password) {
        showNotification('Completa todos los campos', 'error');
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();
        if(data.token) {
            token = data.token;
            localStorage.setItem('token', token);
            showNotification('✅ Cuenta creada!', 'success');
            loadGame();
        } else {
            showNotification(data.error || 'Error al registrar', 'error');
        }
    } catch(e) {
        showNotification('Error de conexión: ' + e.message, 'error');
    }
}

async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    console.log('Login attempt:', {username, hasPassword: !!password});
    
    if(!username || !password) {
        showNotification('Completa todos los campos', 'error');
        return;
    }
    
    // Mostrar loading
    const loginBtn = document.querySelector('#login-form button');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'Iniciando...';
    loginBtn.disabled = true;
    
    try {
        console.log('Sending login request to:', `${API_URL}/login`);
        
        // Simplified fetch for mobile compatibility
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        });
        
        console.log('Response status:', res.status);
        
        const data = await res.json();
        console.log('Login response:', {hasToken: !!data.token, error: data.error});
        
        if(data.token) {
            token = data.token;
            localStorage.setItem('token', token);
            showNotification('✅ Bienvenido de vuelta!', 'success');
            await loadGame();
        } else {
            showNotification(data.error || 'Credenciales incorrectas', 'error');
        }
    } catch(e) {
        console.error('Login error:', e);
        showNotification(`Error: ${e.message}`, 'error');
    } finally {
        loginBtn.textContent = originalText;
        loginBtn.disabled = false;
    }
}

async function loadGame() {
    console.log('Loading game with token:', !!token);
    
    try {
        const res = await fetch(`${API_URL}/game`, {
            headers: {
                'Authorization': token
            }
        });
        
        console.log('Game load response status:', res.status);
        
        const data = await res.json();
        console.log('Game data received:', {hasGameState: !!data.gameState, username: data.username});
        
        if(data.error) {
            console.log('Game load error:', data.error);
            logout();
            return;
        }
        
        gameState = data.gameState;
        gameState.gridSize = gameState.gridSize || 3;
        gameState.score = gameState.score || 0;
        gameState.hints = gameState.hints || 3;
        gameState.achievements = gameState.achievements || [];
        gameState.level = gameState.level || 1;
        gameState.xp = gameState.xp || 0;
        
        document.getElementById('player-name').textContent = data.username;
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        
        updateUI();
        initPuzzle();
        loadLeaderboard();
        updateSkipButton();
        
        console.log('Game loaded successfully');
    } catch(e) {
        console.error('Load game error:', e);
        showNotification(`Error al cargar: ${e.message}`, 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    token = null;
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('auth-screen').classList.add('active');
}

function updateUI() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('xp').textContent = gameState.xp;
    const xpNeeded = gameState.level * 100;
    document.getElementById('xp-needed').textContent = xpNeeded;
    document.getElementById('xp-progress').style.width = (gameState.xp / xpNeeded * 100) + '%';
    document.getElementById('puzzle-number').textContent = gameState.currentPuzzle;
    document.getElementById('moves').textContent = gameState.moves;
    document.getElementById('score').textContent = gameState.score || 0;
    document.getElementById('hint-count').textContent = gameState.hints || 0;
}

function initPuzzle() {
    gameState.moves = 0;
    cancelSkip();
    const size = gameState.gridSize || 3;
    const total = size * size;
    gameState.grid = Array.from({length: total}, (_, i) => i === total - 1 ? 0 : i + 1);
    gameState.emptyPos = total - 1;
    shufflePuzzle();
    renderPuzzle();
    startTimer();
    
    const diffNames = {3: 'Fácil', 4: 'Medio', 5: 'Difícil'};
    document.getElementById('current-difficulty').textContent = diffNames[size];
}

function setDifficulty(size) {
    if(gameState.moves > 0) {
        if(!confirm('¿Cambiar dificultad? Perderás el progreso actual.')) return;
        combo = 0;
    }
    gameState.gridSize = size;
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size == size);
    });
    
    const diffNames = {3: 'Fácil', 4: 'Medio', 5: 'Difícil'};
    document.getElementById('current-difficulty').textContent = diffNames[size];
    
    initPuzzle();
}

function startTimer() {
    if(timerInterval) clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        document.getElementById('timer').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    if(timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function shufflePuzzle() {
    const size = gameState.gridSize || 3;
    const minMoves = size === 3 ? 50 : size === 4 ? 80 : 120;
    
    do {
        for(let i = 0; i < minMoves; i++) {
            const validMoves = getValidMoves();
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            swapTiles(gameState.emptyPos, randomMove);
        }
    } while(checkWin());
    gameState.moves = 0;
}

function getValidMoves() {
    const moves = [];
    const size = gameState.gridSize || 3;
    const row = Math.floor(gameState.emptyPos / size);
    const col = gameState.emptyPos % size;
    
    if(row > 0) moves.push(gameState.emptyPos - size);
    if(row < size - 1) moves.push(gameState.emptyPos + size);
    if(col > 0) moves.push(gameState.emptyPos - 1);
    if(col < size - 1) moves.push(gameState.emptyPos + 1);
    
    return moves;
}

function swapTiles(pos1, pos2) {
    [gameState.grid[pos1], gameState.grid[pos2]] = [gameState.grid[pos2], gameState.grid[pos1]];
    gameState.emptyPos = pos2;
}

function renderPuzzle() {
    const grid = document.getElementById('puzzle-grid');
    const size = gameState.gridSize || 3;
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    grid.innerHTML = '';
    
    gameState.grid.forEach((num, idx) => {
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile' + (num === 0 ? ' empty' : '');
        tile.textContent = num || '';
        tile.onclick = () => moveTile(idx);
        grid.appendChild(tile);
    });
    
    updateUI();
}

function moveTile(idx) {
    const validMoves = getValidMoves();
    if(!validMoves.includes(idx)) return;
    
    swapTiles(gameState.emptyPos, idx);
    gameState.moves++;
    
    renderPuzzle();
    
    if(checkWin()) {
        handleWin();
    }
}

function checkWin() {
    const size = gameState.gridSize || 3;
    const total = size * size;
    
    for(let i = 0; i < total - 1; i++) {
        if(gameState.grid[i] !== i + 1) return false;
    }
    return gameState.grid[total - 1] === 0;
}

function handleWin() {
    stopTimer();
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const size = gameState.gridSize || 3;
    
    // Calcular puntos
    let points = size === 3 ? 100 : size === 4 ? 200 : 300;
    if(elapsed < 60) points *= 2;
    if(gameState.moves < size * 10) points *= 1.5;
    
    gameState.score += Math.floor(points);
    gameState.xp += 50;
    gameState.currentPuzzle++;
    
    // Verificar logros
    checkAchievements(elapsed, gameState.moves, size);
    
    // Subir nivel
    const xpNeeded = gameState.level * 100;
    if(gameState.xp >= xpNeeded) {
        gameState.level++;
        gameState.xp = 0;
        gameState.hints += 2;
        showNotification(`🎉 ¡Nivel ${gameState.level}! +2 pistas`, 'success');
    }
    
    showNotification(`✅ ¡Completado! +${Math.floor(points)} puntos`, 'success');
    saveGame();
    
    setTimeout(() => {
        initPuzzle();
    }, 2000);
}

function checkAchievements(elapsed, moves, size) {
    gameState.achievements = gameState.achievements || [];
    
    const checks = {
        'first_win': () => gameState.currentPuzzle > 1,
        'speed_demon': () => elapsed < 30,
        'efficient': () => size === 3 && moves < 20,
        'level_5': () => gameState.level >= 5,
        'master': () => size === 5,
        'combo_king': () => combo >= 5,
        'perfectionist': () => (1000 - moves * 10 - elapsed * 2) >= 1000
    };
    
    achievements.forEach(ach => {
        if(!gameState.achievements.includes(ach.id) && checks[ach.id] && checks[ach.id]()) {
            gameState.achievements.push(ach.id);
            showAchievement(ach);
        }
    });
}

function showAchievement(ach) {
    const div = document.getElementById('achievements');
    const badge = document.createElement('div');
    badge.className = 'achievement-badge';
    badge.innerHTML = `${ach.icon} ${ach.name}<br><small>${ach.desc}</small>`;
    div.appendChild(badge);
    setTimeout(() => badge.classList.add('show'), 10);
    setTimeout(() => badge.remove(), 5000);
}

function showHint() {
    if(gameState.hints <= 0) {
        showNotification('❌ Sin pistas disponibles', 'error');
        return;
    }
    
    gameState.hints--;
    updateUI();
    
    const validMoves = getValidMoves();
    if(validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        const tile = document.querySelectorAll('.puzzle-tile')[randomMove];
        tile.style.background = '#4CAF50';
        setTimeout(() => {
            tile.style.background = '';
        }, 2000);
        showNotification('💡 Mueve esta ficha', 'info');
    }
    saveGame();
}

function skipPuzzle() {
    const skipBtn = document.querySelector('.skip-btn');
    
    // Verificar límites
    if(skipsUsed >= 3) {
        showNotification('❌ Límite alcanzado: 3 saltos por sesión', 'error');
        return;
    }
    
    const timeSinceLastSkip = Date.now() - lastSkipTime;
    const cooldownTime = 120000; // 2 minutos
    if(timeSinceLastSkip < cooldownTime && lastSkipTime > 0) {
        const remainingTime = Math.ceil((cooldownTime - timeSinceLastSkip) / 1000);
        showNotification(`⏰ Espera ${remainingTime}s para usar otro salto`, 'error');
        return;
    }
    
    const timeOnPuzzle = Math.floor((Date.now() - startTime) / 1000);
    if(timeOnPuzzle < 30) {
        showNotification(`⏱️ Debes intentar al menos 30 segundos (${30 - timeOnPuzzle}s restantes)`, 'error');
        return;
    }
    
    if(gameState.moves < 10) {
        showNotification(`🎯 Debes hacer al menos 10 movimientos (${10 - gameState.moves} restantes)`, 'error');
        return;
    }
    
    if(skipTimeout) {
        showNotification('⚠️ Ya está en proceso de saltar', 'error');
        return;
    }
    
    skipBtn.disabled = true;
    let countdown = 10;
    skipBtn.textContent = `⏳ Saltando en ${countdown}s`;
    
    skipCountdown = setInterval(() => {
        countdown--;
        if(countdown > 0) {
            skipBtn.textContent = `⏳ Saltando en ${countdown}s`;
        }
    }, 1000);
    
    skipTimeout = setTimeout(() => {
        skipsUsed++;
        lastSkipTime = Date.now();
        updateSkipButton();
        autoSolvePuzzle();
    }, 10000);
    
    showNotification(`⏳ Puzzle se resolverá en 10s (${3 - skipsUsed} saltos restantes)`, 'info');
}

function updateSkipButton() {
    const skipBtn = document.querySelector('.skip-btn');
    const remaining = 3 - skipsUsed;
    
    if(remaining > 0) {
        skipBtn.disabled = false;
        skipBtn.textContent = `⏭️ Saltar (${remaining} restantes)`;
    } else {
        skipBtn.disabled = true;
        skipBtn.textContent = '🚫 Sin saltos';
    }
}

function cancelSkip() {
    if(skipTimeout) {
        clearTimeout(skipTimeout);
        skipTimeout = null;
    }
    if(skipCountdown) {
        clearInterval(skipCountdown);
        skipCountdown = null;
    }
    updateSkipButton();
}

function autoSolvePuzzle() {
    const size = gameState.gridSize || 3;
    const total = size * size;
    
    gameState.grid = Array.from({length: total}, (_, i) => i === total - 1 ? 0 : i + 1);
    gameState.emptyPos = total - 1;
    
    renderPuzzle();
    
    setTimeout(() => {
        handleWin();
    }, 500);
}

function resetPuzzle() {
    if(confirm('¿Reiniciar el puzzle? Perderás el progreso actual.')) {
        combo = 0;
        cancelSkip();
        initPuzzle();
    }
}

async function saveGame() {
    if(!token) return;
    
    try {
        await fetch(`${API_URL}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({gameState})
        });
    } catch(e) {
        console.log('Error al guardar:', e);
    }
}

async function loadLeaderboard() {
    try {
        const res = await fetch(`${API_URL}/leaderboard`);
        const data = await res.json();
        
        const list = document.getElementById('leaderboard-list');
        if(list) {
            list.innerHTML = data.map((player, idx) => `
                <div class="leaderboard-item">
                    <span>${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1 + '.'} ${player.username}</span>
                    <span>Nv.${player.level} | ${player.score || 0} pts</span>
                </div>
            `).join('');
        }
    } catch(e) {
        console.log('Error al cargar leaderboard:', e);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if(document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Inicializar cuando carga la página
console.log('Page loaded, token exists:', !!token);
console.log('API_URL:', API_URL);
console.log('User agent:', navigator.userAgent);

if(token) {
    console.log('Auto-loading game with existing token');
    loadGame();
} else {
    console.log('No token, showing auth screen');
    document.getElementById('auth-screen').classList.add('active');
}

// Auto-guardar cada 30 segundos
setInterval(() => {
    if(token) saveGame();
}, 30000);

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}

// PWA Install Prompt
let deferredPrompt;
let installPromptShown = false;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar prompt después de 10 segundos si no se ha mostrado
    if (!installPromptShown) {
        setTimeout(() => {
            if (deferredPrompt && !installPromptShown) {
                showInstallBanner();
            }
        }, 10000);
    }
});

function showInstallBanner() {
    if (installPromptShown) return;
    
    const banner = document.createElement('div');
    banner.className = 'install-prompt show';
    banner.innerHTML = `
        <div>
            <strong>📱 ¡Instala Puzzle Quest!</strong><br>
            <small>Juega offline y accede rápidamente</small>
        </div>
        <div>
            <button onclick="installFromBanner()">Instalar</button>
            <button onclick="dismissBanner()">Ahora no</button>
        </div>
    `;
    document.body.appendChild(banner);
    installPromptShown = true;
    
    // Auto-dismiss después de 15 segundos
    setTimeout(() => {
        if (document.body.contains(banner)) {
            banner.remove();
        }
    }, 15000);
}

function installFromBanner() {
    const banner = document.querySelector('.install-prompt');
    if (banner) banner.remove();
    installApp();
}

function dismissBanner() {
    const banner = document.querySelector('.install-prompt');
    if (banner) banner.remove();
}

function installApp() {
    if(deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showNotification('✅ App instalada correctamente', 'success');
                // Ocultar botón de instalación
                const installBtn = document.getElementById('install-btn');
                if (installBtn) installBtn.style.display = 'none';
            }
            deferredPrompt = null;
        });
    } else {
        // Fallback para navegadores que no soportan beforeinstallprompt
        showInstallInstructions();
    }
}

function showInstallInstructions() {
    const instructions = `
        Para instalar la app:
        
        📱 Móvil:
        - Chrome: Menú → "Instalar app"
        - Safari: Compartir → "Añadir a inicio"
        
        💻 PC:
        - Chrome: Ícono de instalación en la barra
        - Edge: Menú → "Instalar aplicación"
    `;
    alert(instructions);
}

function dismissInstall() {
    const prompt = document.querySelector('.install-prompt');
    if(prompt) prompt.remove();
}