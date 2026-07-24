/* ==========================================================================
   GAME.JS - LOOP PRINCIPAL E INICIALIZAÇÃO
   ========================================================================== */

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    const selectedTab = document.getElementById(`tab-${tabId}`);
    if (selectedTab) selectedTab.classList.add('active');

    const activeBtn = Array.from(document.querySelectorAll('.nav-btn'))
        .find(btn => btn.getAttribute('onclick').includes(tabId));
    if (activeBtn) activeBtn.classList.add('active');
}

// Inicialização quando a página carrega
window.addEventListener('DOMContentLoaded', () => {
    if (typeof UI !== 'undefined') UI.renderAll();

    // Loop do Jogo (10 vezes por segundo)
    let lastTime = Date.now();
    setInterval(() => {
        const now = Date.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        if (typeof Quests !== 'undefined') {
            Quests.updateActiveQuests(dt);
        }
    }, 100);
});
