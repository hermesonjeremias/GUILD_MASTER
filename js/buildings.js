/* ==========================================================================
   BUILDINGS.JS - CONSTRUÇÕES DA GUILDA
   ========================================================================== */

const Buildings = {
    list: [
        { id: 'tavern', name: 'Ampliar Taverna', baseCost: 100, mult: 1.5, desc: 'Aumenta limite máximo de membros da guilda em +2.', icon: '🍺' },
        { id: 'training', name: 'Campo de Treinamento', baseCost: 200, mult: 1.6, desc: 'Aumenta o Poder de Luta de todos os heróis em +10% por nível.', icon: '🎯' },
        { id: 'strategyTable', name: 'Salão de Estratégia', baseCost: 150, mult: 2.0, desc: 'Aumenta a capacidade de heróis em uma mesma Party (Max 4).', icon: '🗺️' },
        { id: 'officers', name: 'Quartel de Oficiais', baseCost: 300, mult: 2.2, desc: 'Desbloqueia a opção de Automação de Missões.', icon: '📜' },
        { id: 'tactics', name: 'Academia de Táticas', baseCost: 500, mult: 2.5, desc: 'Reduz a penalidade de tempo de missões automáticas em -25%.', icon: '📚' },
        { id: 'rescue', name: 'Equipe de Resgate', baseCost: 800, mult: 3.0, desc: 'Cura e resgata automaticamente heróis em missões automáticas falhas.', icon: '🚑' }
    ],

    upgrade(buildingId) {
        const b = this.list.find(x => x.id === buildingId);
        if (!b) return;

        const currentLvl = state.buildings[buildingId] || 0;
        const cost = Math.floor(b.baseCost * Math.pow(b.mult, currentLvl));

        if (state.gold >= cost) {
            state.gold -= cost;
            state.buildings[buildingId] = currentLvl + 1;

            if (buildingId === 'tavern') {
                state.maxMembers += 2;
            }

            this.render();
            if (typeof Adventurers !== 'undefined') Adventurers.render();
            if (typeof Quests !== 'undefined') Quests.render();
            if (typeof UI !== 'undefined') UI.update();
        }
    },

    render() {
        const container = document.getElementById('buildings-container');
        if (!container) return;

        let html = '<h2>🏰 Edifícios da Guilda</h2><div class="cards-grid">';

        this.list.forEach(b => {
            const lvl = state.buildings[b.id] || 0;
            const cost = Math.floor(b.baseCost * Math.pow(b.mult, lvl));
            const canAfford = state.gold >= cost;

            html += `
                <div class="card">
                    <div class="card-icon">${b.icon}</div>
                    <h3>${b.name} (Nível ${lvl})</h3>
                    <p>${b.desc}</p>
                    <button class="action-btn" 
                            data-cost="${cost}"
                            onclick="Buildings.upgrade('${b.id}')" 
                            ${!canAfford ? 'disabled' : ''}>
                        Evoluir (${cost} Ouro)
                    </button>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }
};
