/* ==========================================================================
   BUILDINGS.JS - CONSTRUÇÕES DA GUILDA
   ========================================================================== */

const Buildings = {
    list: [
        { id: 'tavern', name: 'Ampliar Taverna', baseCost: 100, mult: 1.5, desc: 'Aumenta a capacidade máxima da guilda em +2 membros.', icon: '🍺' },
        { id: 'training', name: 'Campo de Treinamento', baseCost: 300, mult: 1.8, desc: 'Melhora as instalações da guilda.', icon: '🎯' }
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
