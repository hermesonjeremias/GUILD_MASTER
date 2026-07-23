// js/game.js - Controla o loop principal e salvamento periódico

function clickGatherGold() {
    gameState.gold += 1;
    updateUI();
}

let lastTimestamp = Date.now();
let saveTimer = 0; // Temporizador para salvamento automático

function gameLoop() {
    const now = Date.now();
    const deltaSeconds = (now - lastTimestamp) / 1000;
    lastTimestamp = now;

    // Atualiza temporizadores dos sistemas
    updateAdventurersTimers(deltaSeconds);
    updateQuestsTimers(deltaSeconds);

    updateUI();
    updateActiveQuestsUI();

    // Auto-save a cada 5 segundos
    saveTimer += deltaSeconds;
    if (saveTimer >= 5) {
        saveGame();
        saveTimer = 0;
    }
}

function initGame() {
    console.log("Guild Master iniciado!");
    initQuests();

    // Tenta carregar o jogo salvo. Se não existir, inicia com o Aldric
    const loaded = loadGame();
    if (!loaded) {
        recruitAldric();
    }

    updateUI();
    renderAdventurers();
    renderQuests();

    setInterval(gameLoop, 100);
}

window.onload = initGame;
