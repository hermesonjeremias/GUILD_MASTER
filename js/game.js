/* ==========================================================================
   GAME.JS - LOOP PRINCIPAL
   ========================================================================== */

let lastTime = Date.now();

function gameLoop() {
    const now = Date.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

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
