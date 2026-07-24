/* ==========================================================================
   UI.JS - GERENCIAMENTO E RENDERIZAÇÃO DA INTERFACE DO USUÁRIO
   ========================================================================== */

const UI = {
    // Inicialização da interface na primeira carga
    init() {
        this.renderAll();
        this.update();
    },

    // Renderiza o conteúdo inicial de todas as abas
    renderAll() {
        if (typeof Adventurers !== 'undefined' && typeof Adventurers.render === 'function') {
            Adventurers.render();
        }
        if (typeof Quests !== 'undefined' && typeof Quests.render === 'function') {
            Quests.render();
        }
        if (typeof Buildings !== 'undefined' && typeof Buildings.render === 'function') {
            Buildings.render();
        }
        if (typeof Items !== 'undefined' && typeof Items.render === 'function') {
            Items.render();
        }
    },

    // Atualização constante (chamada no gameLoop a cada quadro/segundo)
    update() {
        // 1. Atualiza o Painel Superior de Recursos
        const goldElem = document.getElementById('gold-display');
        const gpsElem = document.getElementById('gps-display');
        const prestigeElem = document.getElementById('prestige-display');
        const membersElem = document.getElementById('members-display');

        const currentGold = Number(state.gold) || 0;
        const currentPrestige = Number(state.prestige) || 0;
        const currentMembers = Array.isArray(state.adventurers) ? state.adventurers.length : 0;
        const maxMembers = Number(state.maxMembers) || 5;

        // Calcula o GPS (Ouro por Segundo)
        const gps = (typeof Adventurers !== 'undefined' && typeof Adventurers.calculateTotalGPS === 'function')
            ? Adventurers.calculateTotalGPS()
            : 0;

        if (goldElem) goldElem.innerText = Math.floor(currentGold).toLocaleString('pt-BR');
        if (gpsElem) gpsElem.innerText = gps.toFixed(1);
        if (prestigeElem) prestigeElem.innerText = currentPrestige.toLocaleString('pt-BR');
        if (membersElem) membersElem.innerText = `${currentMembers}/${maxMembers}`;

        // 2. Atualiza botões e missões ativas
        this.updateButtonsState();
        this.updateActiveQuestsUI();
    },

    // Habilita ou desabilita botões dinamicamente dependendo do Ouro do jogador
    updateButtonsState() {
        const currentGold = Number(state.gold) || 0;
        const actionButtons = document.querySelectorAll('.action-btn[data-cost]');

        actionButtons.forEach(btn => {
            const cost = Number(btn.getAttribute('data-cost')) || 0;
            btn.disabled = currentGold < cost;
        });
    },

    // Atualiza a exibição e o progresso visual das missões em andamento
    updateActiveQuestsUI() {
        const container = document.getElementById('active-quests-container');
        if (!container) return;

        if (!Array.isArray(state.activeQuests) || state.activeQuests.length === 0) {
            container.innerHTML = '<p class="empty-msg">Nenhuma missão em andamento no momento.</p>';
            return;
        }

        let html = '<h3>📜 Missões em Andamento</h3>';

        state.activeQuests.forEach(quest => {
            const duration = Number(quest.duration) || 1;
            const elapsed = Number(quest.elapsed) || 0;
            const remaining = Math.max(0, Math.ceil(duration - elapsed));
            const progressPct = Math.min(100, Math.max(0, (elapsed / duration) * 100));

            html += `
                <div class="active-quest-item">
                    <div>
                        <strong>${quest.title}</strong> <small>(${quest.heroName || 'Aventureiro'})</small>
                        <br><small>Tempo restante: ${remaining}s</small>
                    </div>
                    <div style="width: 40%; background: #1a1a24; border-radius: 4px; overflow: hidden; height: 14px; margin-top: 6px;">
                        <div style="width: ${progressPct}%; background: #ffa502; height: 100%; transition: width 0.2s linear;"></div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};

/* ==========================================================================
   SISTEMA DE TROCA DE ABAS
   ========================================================================== */

function switchTab(tabName) {
    // Esconde todo o conteúdo das abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Desativa todos os botões da barra de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Ativa a aba selecionada (aceita nomes como 'aventureiros', 'loja', etc)
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Marca o botão clicado como ativo
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }

    // Renderiza o conteúdo da aba selecionada para garantir dados atualizados
    if (tabName === 'aventureiros' && typeof Adventurers !== 'undefined' && Adventurers.render) {
        Adventurers.render();
    } else if (tabName === 'missoes' && typeof Quests !== 'undefined' && Quests.render) {
        Quests.render();
    } else if (tabName === 'construcoes' && typeof Buildings !== 'undefined' && Buildings.render) {
        Buildings.render();
    } else if ((tabName === 'loja' || tabName === 'mercado') && typeof Items !== 'undefined' && Items.render) {
        Items.render();
    }

    // Atualiza o estado visual dos botões
    UI.updateButtonsState();
}

// Efeito visual de erro ao tentar realizar uma ação sem ouro
function triggerErrorEffect(element) {
    if (!element) return;
    element.classList.add('btn-error-shake');
    setTimeout(() => element.classList.remove('btn-error-shake'), 400);
}
