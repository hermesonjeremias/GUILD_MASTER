/* ==========================================================================
   GAME.JS - INICIALIZAÇÃO E LOOP PRINCIPAL
   ========================================================================== */

let lastTimestamp = 0;

function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    
    let deltaSeconds = (timestamp - lastTimestamp) / 1000;
    if (deltaSeconds > 1.0) deltaSeconds = 1.0; // Previne saltos ao trocar de aba
    
    lastTimestamp = timestamp;

    // 1. Atualiza Missões
    if (typeof updateQuests === 'function') {
        updateQuests(deltaSeconds);
    }

    // 2. Atualiza Heróis (Cura / XP)
    if (typeof updateAdventurersTimers === 'function') {
        updateAdventurersTimers(deltaSeconds);
    }

    // 3. Incremento Passivo de Ouro
    if (typeof calculateGoldPerSecond === 'function') {
        const gps = calculateGoldPerSecond();
        if (gps > 0) {
            gameState.gold += gps * deltaSeconds;
        }
    }

    // 4. Atualizações de Interface
    if (typeof updateUI === 'function') updateUI();
    if (typeof updateActiveQuestsUI === 'function') updateActiveQuestsUI();

    requestAnimationFrame(gameLoop);
}

window.addEventListener('DOMContentLoaded', () => {
    if (typeof loadGame === 'function') loadGame();
    if (typeof recruitAldric === 'function') recruitAldric();

    if (typeof updateUI === 'function') updateUI();
    if (typeof renderAdventurers === 'function') renderAdventurers();

    // Autosave a cada 10 segundos
    setInterval(() => {
        if (typeof saveGame === 'function') saveGame();
    }, 10000);

    requestAnimationFrame(gameLoop);
});
