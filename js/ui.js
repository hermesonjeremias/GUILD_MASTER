/* ==========================================================================
   UI.JS - GERENCIAMENTO DE INTERFACE
   ========================================================================== */

const UI = {
    init() {
        this.renderAll();
        this.update();
    },

    renderAll() {
        if (typeof Adventurers !== 'undefined' && Adventurers.render) Adventurers.render();
        if (typeof Quests !== 'undefined' && Quests.render) Quests.render();
        if (typeof Buildings !== 'undefined' && Buildings.render) Buildings.render();
    },

    update() {
        const goldElem = document.getElementById('gold-display');
        const gpsElem = document.getElementById('gps-display');
        const prestigeElem = document.getElementById('prestige-display');
        const membersElem = document.getElementById('members-display');

        const gps = (typeof Adventurers !== 'undefined' && Adventurers.calculateTotalGPS) 
            ? Adventurers.calculateTotalGPS() 
            : 0;

        if (goldElem) goldElem.innerText = Math.floor(state.gold || 0).toLocaleString('pt-BR');
        if (gpsElem) gpsElem.innerText = gps.toFixed(1);
        if (prestigeElem) prestigeElem.innerText = (state.prestige || 0).toLocaleString('pt-BR');
        if (membersElem) membersElem.innerText = `${(state.adventurers || []).length}/${state.maxMembers || 5}`;

        this.updateButtonsState();
        this.updateActiveQuestsUI();
    },

    updateButtonsState() {
        const actionButtons = document.querySelectorAll('.action-btn[data-cost]');
        actionButtons.forEach(btn => {
            const cost = Number(btn.getAttribute('data-cost')) || 0;
            btn.disabled = (state.gold || 0) < cost;
        });
    },

    updateActiveQuestsUI() {
        const container = document.getElementById('active-quests-container');
        if (!container) return;

        if (!state.activeQuests || state.activeQuests.length === 0) {
            container.innerHTML = '<p class="empty-msg">Nenhuma missão em andamento no momento.</p>';
            return;
        }

        let html = '<h3>📜 Missões em Andamento</h3>';

        state.activeQuests.forEach(quest => {
            const progressPct = Math.min(100, Math.max(0, (quest.elapsed / quest.duration) * 100));
            const remaining = Math.max(0, Math.ceil(quest.duration - quest.elapsed));

            html += `
                <div class="active-quest-item" style="margin-bottom: 10px;">
                    <div>
                        <strong>${quest.title}</strong> (${quest.heroName})
                        <br><small>Tempo restante: ${remaining}s</small>
                    </div>
                    <div style="width: 100%; background: #1a1a24; border-radius: 4px; overflow: hidden; height: 12px; margin-top: 4px;">
                        <div style="width: ${progressPct}%; background: #ffa502; height: 100%;"></div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.classList.add('active');

    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }
}
