/* ==========================================================================
   GAME.JS - LOOP PRINCIPAL DO JOGO E SINCRO
   ========================================================================== */

let lastTime = Date.now();

function gameLoop() {
    const now = Date.now();
    const dt = (now - lastTime) / 1000; // Delta time em segundos
    lastTime = now;

    // 1. Ganho de Ouro Passivo (GPS)
    if (typeof Adventurers !== 'undefined' && Adventurers.calculateTotalGPS) {
        const totalGPS = Adventurers.calculateTotalGPS();
        state.gold += totalGPS * dt;
    }

    // 2. Progresso das Missões Ativas
    if (typeof Quests !== 'undefined' && Quests.updateActiveQuests) {
        Quests.updateActiveQuests(dt);
    }

    // 3. Atualiza os elementos de UI a cada ciclo
    if (typeof UI !== 'undefined' && UI.update) {
        UI.update();
    }

    requestAnimationFrame(gameLoop);
}

// Inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    // Carrega o progresso salvo
    StateManager.load();

    // Renderiza e inicializa a interface
    if (typeof UI !== 'undefined' && UI.init) {
        UI.init();
    }

    // Auto-Save a cada 10 segundos
    setInterval(() => {
        StateManager.save();
    }, 10000);

    // Inicia o loop do jogo
    requestAnimationFrame(gameLoop);
});
