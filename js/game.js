// js/game.js

function clickGatherGold() {
    gameState.gold += 1;
    updateUI();
}

let lastTimestamp = Date.now();

function gameLoop() {
    const now = Date.now();
    const deltaSeconds = (now - lastTimestamp) / 1000;
    lastTimestamp = now;

    // Atualiza temporizadores de heróis (curas) e de missões
    updateAdventurersTimers(deltaSeconds);
    updateQuestsTimers(deltaSeconds);

    // Se estiver na aba ativa correspondente, re-renderiza a tela em tempo real
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        if (activeTab.id === 'tab-aventureiros') {
            renderAdventurers();
        } else if (activeTab.id === 'tab-missoes') {
            renderQuests();
        }
    }

    updateUI();
}

function initGame() {
    console.log("Guild Master iniciado com sucesso!");
    
    // Inicializa missões e recruta Aldric
    initQuests();
    recruitAldric();

    updateUI();
    renderAdventurers();

    setInterval(gameLoop, 100);
}

window.onload = initGame;
