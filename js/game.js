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
    const deltaSeconds = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    // 1. Atualiza o tempo e progresso das missões ativas
    if (typeof updateQuests === 'function') {
        updateQuests(deltaSeconds);
    }

    // 2. Atualiza temporizadores dos aventureiros (cura de ferimentos e XP passivo do Treinamento)
    if (typeof updateAdventurersTimers === 'function') {
        updateAdventurersTimers(deltaSeconds);
    }

    // 3. Produção passiva de Ouro por segundo (Mural de Contratos)
    if (typeof calculateGoldPerSecond === 'function') {
        const gps = calculateGoldPerSecond();
        if (gps > 0) {
            gameState.gold += gps * deltaSeconds;
        }
    }

    // 4. Atualiza os marcadores e progresso na interface
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
