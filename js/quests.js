/* ==========================================================================
   QUESTS.JS - QUARTEL DE MISSÕES
   ========================================================================== */

const Quests = {
    available: [
        { id: 'rats', title: 'Caçar Ratos no Porão', duration: 5, rewardGold: 35, reqLevel: 1, icon: '🐀' },
        { id: 'goblin', title: 'Patrulhar a Floresta', duration: 12, rewardGold: 120, reqLevel: 1, icon: '🌲' },
        { id: 'escort', title: 'Escoltar Caravana', duration: 30, rewardGold: 400, reqLevel: 1, icon: '🛒' }
    ],

    startQuest(questId) {
        if (!state.adventurers || state.adventurers.length === 0) {
            alert("Você precisa de pelo menos 1 herói para enviar em uma missão!");
            return;
        }

        const template = this.available.find(q => q.id === questId);
        if (!template) return;

        // Adiciona à lista de missões ativas
        state.activeQuests.push({
            ...template,
            instanceId: Date.now(),
            elapsed: 0,
            heroName: state.adventurers[0].name
        });

        if (typeof UI !== 'undefined') UI.update();
    },

    updateActiveQuests(dt) {
        if (!state.activeQuests) return;

        for (let i = state.activeQuests.length - 1; i >= 0; i--) {
            const q = state.activeQuests[i];
            q.elapsed += dt;

            // Missão Concluída
            if (q.elapsed >= q.duration) {
                state.gold += q.rewardGold;
                state.activeQuests.splice(i, 1);
            }
        }
    },

    render() {
        const container = document.getElementById('quests-list') || document.getElementById('tab-quests');
        if (!container) return;

        let html = '<h2>📜 Missões Disponíveis</h2><div class="cards-grid">';

        this.available.forEach(quest => {
            html += `
                <div class="card">
                    <div class="card-icon">${quest.icon}</div>
                    <h3>${quest.title}</h3>
                    <p>Duração: ${quest.duration}s</p>
                    <p>Recompensa: 💰 ${quest.rewardGold} Ouro</p>
                    <button class="action-btn" onclick="Quests.startQuest('${quest.id}')">
                        Enviar Herói
                    </button>
                </div>
            `;
        });

        html += '</div><div id="active-quests-container"></div>';
        container.innerHTML = html;
    }
};
