/* ==========================================================================
   GAME.JS - LOOP PRINCIPAL E INICIALIZAÇÃO DO JOGO
   ========================================================================== */

let lastTimestamp = 0;

/**
 * Loop principal do jogo executado continuamente.
 * @param {number} timestamp - Marca de tempo enviada pelo requestAnimationFrame
 */
function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    
    // Evita saltos enormes de tempo em abas inativas (máximo 1 segundo por frame)
    let deltaSeconds = (timestamp - lastTimestamp) / 1000;
    if (deltaSeconds > 1.0) deltaSeconds = 1.0;
    
    lastTimestamp = timestamp;

    // 1. Atualiza o tempo e progresso das missões ativas
    if (typeof updateQuests === 'function') {
        updateQuests(deltaSeconds);
    }

    // 2. Atualiza temporizadores dos aventureiros (cura e XP passivo)
    if (typeof updateAdventurersTimers === 'function') {
        updateAdventurersTimers(deltaSeconds);
    }

    // 3. Produção passiva de Ouro por segundo (Mural de Contratos)
    if (typeof calculateGoldPerSecond === 'function') {
        const gps = calculateGoldPerSecond();
        if (gps > 0 && !isNaN(gps)) {
            gameState.gold += gps * deltaSeconds;
        }
    }

    // 4. Atualiza a interface
    if (typeof updateUI === 'function') {
        updateUI();
    }
    if (typeof updateActiveQuestsUI === 'function') {
        updateActiveQuestsUI();
    }

    requestAnimationFrame(gameLoop);
}

// Inicialização assim que a página é carregada
window.addEventListener('DOMContentLoaded', () => {
    // Carrega os dados salvos do jogo
    if (typeof loadGame === 'function') {
        loadGame();
    }
    
    // Garante que o herói inicial Aldric exista
    if (typeof recruitAldric === 'function') {
        recruitAldric();
    }

    // Atualiza a UI inicial
    if (typeof updateUI === 'function') {
        updateUI();
    }

    // Autosave a cada 10 segundos
    setInterval(() => {
        if (typeof saveGame === 'function') saveGame();
    }, 10000);

    // Inicia o loop do jogo
    requestAnimationFrame(gameLoop);
});
