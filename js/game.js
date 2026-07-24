/* ==========================================================================
   GAME.JS - LOOP PRINCIPAL DE TEMPO REAL
   ========================================================================== */

function gameLoop() {
    const now = Date.now();
    // Delta Time: tempo decorrido desde a última atualização em segundos
    const dt = (now - state.lastUpdate) / 1000; 
    state.lastUpdate = now;

    // 1. Ganho passivo de Ouro (GPS)
    if (typeof Adventurers !== 'undefined' && typeof Adventurers.calculateTotalGPS === 'function') {
        const gps = Adventurers.calculateTotalGPS();
        state.gold += gps * dt;
    }

    // 2. Atualizar progresso das Missões ativas
    if (typeof Quests !== 'undefined' && typeof Quests.updateActiveQuests === 'function') {
        Quests.updateActiveQuests(dt);
    }

    // 3. Atualizar a Interface do Usuário (Mostra os números na tela)
    if (typeof UI !== 'undefined' && typeof UI.update === 'function') {
        UI.update();
    }

    // Chama o próximo frame
    requestAnimationFrame(gameLoop);
}

// Inicializa quando o HTML estiver totalmente carregado na tela
document.addEventListener('DOMContentLoaded', () => {
    // Carrega dados salvos do navegador se existirem
    if (typeof loadGame === 'function') {
        loadGame();
    }

    // Renderiza a estrutura da UI
    if (typeof UI !== 'undefined') {
        UI.init();
    }

    // Inicia o Loop principal do jogo
    state.lastUpdate = Date.now();
    requestAnimationFrame(gameLoop);
});
