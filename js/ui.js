/* ==========================================================================
   UI.JS - GERENCIAMENTO E RENDERIZAÇÃO DA INTERFACE
   ========================================================================== */

const UI = {
    // Inicialização da interface na primeira carga
    init() {
        this.renderAll();
    },

    // Atualização constante (chamada dentro do Game Loop a cada segundo/frame)
    update() {
        // 1. Atualizar Painel de Recursos Superior
        const goldDisplay = document.getElementById('gold-display');
        const gpsDisplay = document.getElementById('gps-display');
        const prestigeDisplay = document.getElementById('prestige-display');
        const membersDisplay = document.getElementById('members-display');

        if (goldDisplay) {
            goldDisplay.textContent = Math.floor(state.gold).toLocaleString('pt-BR');
        }

        if (gpsDisplay) {
            const gps = (typeof Adventurers !== 'undefined' && Adventurers.calculateTotalGPS) 
                ? Adventurers.calculateTotalGPS() 
                : 0;
            gpsDisplay.textContent = gps.toFixed(1);
        }

        if (prestigeDisplay) {
            prestigeDisplay.textContent = (state.prestige || 0).toLocaleString('pt-BR');
        }

        if (membersDisplay) {
            const currentMembers = state.adventurers ? state.adventurers.length : 0;
            membersDisplay.textContent = `${currentMembers}/${state.maxMembers || 5}`;
        }

        // 2. Atualizar estado de botões e missões ativas
        this.updateButtonsState();
        this.updateActiveQuestsUI();
    },

    // Renderiza o conteúdo estático inicial de todas as abas
    renderAll() {
        if (typeof Adventurers !== 'undefined' && Adventurers.render) Adventurers.render();
        if (typeof Quests !== 'undefined' && Quests.render) Quests.render();
        if (typeof Buildings !== 'undefined' && Buildings.render) Buildings.render();
        if (typeof Shop !== 'undefined' && Shop.render) Shop.render();
    },

    // Atualiza progresso visual das missões em tempo real
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
                <div class="active-quest-item">
                    <div>
                        <strong>${quest.title}</strong> (${quest.heroName})
                        <br><small>Tempo restante: ${remaining}s</small>
                    </div>
                    <div style="width: 40%; background: #1a1a24; border-radius: 4px; overflow: hidden; height: 16px; margin-top: 5px;">
                        <div style="width: ${progressPct}%; background: #ffa502; height: 100%; transition: width 0.2s linear;"></div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // Desativa botões visualmente se o jogador não tiver ouro suficiente
    updateButtonsState() {
        const actionButtons = document.querySelectorAll('.action-btn[data-cost]');
        actionButtons.forEach(btn => {
            const cost = parseFloat(btn.getAttribute('data-cost'));
            if (!isNaN(cost)) {
                btn.disabled = state.gold < cost;
            }
        });
    }
};

// Lógica de Troca de Abas
function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.nav-btn');

    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));

    const selectedTab = document.getElementById(`tab-${tabId}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Ativa o botão correto da barra de navegação
    event.currentTarget.classList.add('active');
}
