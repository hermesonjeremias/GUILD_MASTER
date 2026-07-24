/* ==========================================================================
   BUILDINGS.JS - MELHORIAS DA GUILDA
   ========================================================================== */

const Buildings = {
    list: [
        { id: 'tavern', name: 'Taverna Ampliada', baseCost: 100, desc: 'Aumenta a capacidade máxima da guilda em +2 membros.', icon: '🍺' },
        { id: 'training', name: 'Campo de Treino', baseCost: 300, desc: 'Aumenta a eficiência de ganho de ouro dos heróis.', icon: '🎯' }
    ],

    upgrade(buildingId) {
        const b = this.list.find(x => x.id === buildingId);
        if (!b) return;

        const currentLvl = state.buildings[buildingId] || 0;
        const cost = Math.floor(b.baseCost * Math.pow(1.5, currentLvl));

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
        const container = document.getElementById('buildings-list') || document.getElementById('tab-buildings');
        if (!container) return;

        let html = '<h2>🏰 Edifícios da Guilda</h2><div class="cards-grid">';

        this.list.forEach(b => {
            const lvl = state.buildings[b.id] || 0;
            const cost = Math.floor(b.baseCost * Math.pow(1.5, lvl));
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
