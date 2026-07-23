// js/game.js

function clickGatherGold() {
    gameState.gold += 1;
    updateUI();
}

// LOOP PRINCIPAL DO JOGO (Roda 10 vezes por segundo)
let lastTimestamp = Date.now();

function gameLoop() {
    const now = Date.now();
    const deltaSeconds = (now - lastTimestamp) / 1000; // Tempo em segundos desde o último tick
    lastTimestamp = now;

    // Atualiza contadores dos heróis (ferimentos)
    updateAdventurersTimers(deltaSeconds);

    // Se estivermos na aba de aventureiros, atualizamos a tela para ver o timer de ferimentos rodar
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab && activeTab.id === 'tab-aventureiros') {
        renderAdventurers();
    }

    updateUI();
}

function initGame() {
    console.log("Guild Master iniciado com sucesso!");
    
    // Contrata o herói lendário inicial Aldric
    recruitAldric();

    updateUI();
    renderAdventurers();

    // Loop a cada 100ms
    setInterval(gameLoop, 100);
}

window.onload = initGame;
