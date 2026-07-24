/* ==========================================================================
   GAME.JS - LOOP PRINCIPAL DO JOGO
   ========================================================================== */

let lastTime = Date.now();

function gameLoop() {
    const now = Date.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    if (typeof Adventurers !== 'undefined' && Adventurers.calculateTotalGPS) {
        const totalGPS = Adventurers.calculateTotalGPS();
        state.gold += totalGPS * dt;
    }

    if (typeof Quests !== 'undefined' && Quests.updateActiveQuests) {
        Quests.updateActiveQuests(dt);
    }

    if (typeof UI !== 'undefined' && UI.update) {
        UI.update();
    }

    requestAnimationFrame(gameLoop);
}

window.addEventListener('DOMContentLoaded', () => {
    StateManager.load();

    if (typeof UI !== 'undefined' && UI.init) {
        UI.init();
    }

    setInterval(() => {
        StateManager.save();
    }, 10000);

    requestAnimationFrame(gameLoop);
});
