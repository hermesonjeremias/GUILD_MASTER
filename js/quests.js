/* ==========================================================================
   QUESTS.JS - QUARTEL DE MISSÕES
   ========================================================================== */

const Quests = {
    available: [
        { id: 'rats', title: 'Caçar Ratos no Porão', duration: 5, rewardGold: 35, icon: '🐀' },
        { id: 'goblin', title: 'Patrulhar a Floresta', duration: 12, rewardGold: 120, icon: '🌲' },
        { id: 'escort', title: 'Escoltar Caravana', duration: 30, rewardGold: 400, icon: '🛒' }
    ],

    startQuest(questId) {
        if (!state.adventurers || state.adventurers.length === 0) {
            alert("Você precisa de pelo menos 1 herói para enviar em uma missão!");
            return;
        }

        const template = this.available.find(q => q.id === questId);
        if (!template) return;

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

            if (q.elapsed >= q.duration) {
                state.gold += q.rewardGold;
                state.activeQuests.splice(i, 1);
            }
        }
    },

    render() {
        // ID exato do index.html: quests-container
        const container = document.getElementById('quests-container');
        if (!container) return;

        let html = '<h3>📜 Mural de Missões</h3>';

        this.available.forEach(quest => {
            html += `
                <div class="quest-card">
                    <h4>${quest.icon} ${quest.title}</h4>
                    <div class="rewards">
                        <span>⏱️ Duração: ${quest.duration}s</span>
                        <span>🪙 Recompensa: +${quest.rewardGold} Ouro</span>
                    </div>
                    <button class="action-btn" onclick="Quests.startQuest('${quest.id}')">
                        Enviar Herói
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};
