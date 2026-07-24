/* ==========================================================================
   GAME.JS - LOOP PRINCIPAL E INICIALIZAÇÃO
   ========================================================================== */

// Função que roda a cada quadro do jogo (Loop)
function gameLoop() {
    const now = Date.now();
    const dt = (now - state.lastUpdate) / 1000; // Tempo passado em segundos
    state.lastUpdate = now;

    // 1. Calcula o Ganho Passivo de Ouro (GPS - Ouro por segundo)
    let totalGps = 0;
    if (typeof Adventurers !== 'undefined') {
        totalGps = Adventurers.calculateTotalGPS();
        state.gold += totalGps * dt;
    }

    // 2. Processa o progresso das Missões em andamento
    if (typeof Quests !== 'undefined') {
        Quests.updateActiveQuests(dt);
    }

    // 3. Atualiza os textos e botões na tela
    if (typeof UI !== 'undefined' && typeof UI.update === 'function') {
        UI.update();
    }

    // Salva o jogo automaticamente a cada segundo
    saveGame();

    // Chama o próximo quadro do loop
    requestAnimationFrame(gameLoop);
}

// Quando a página termina de carregar no navegador:
window.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega dados salvos (se existirem)
    loadGame();

    // 2. Renderiza a interface inicial completa
    if (typeof UI !== 'undefined') {
        UI.init();
        UI.update();
    }

    // 3. Inicia o loop contínuo do jogo
    requestAnimationFrame(gameLoop);
});
