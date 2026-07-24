/* ==========================================================================
   BUILDINGS.JS - CONSTRUÇÕES DA GUILDA
   ========================================================================== */

const Buildings = {
    list: [
        { id: 'tavern', name: 'Ampliar Taverna', baseCost: 100, desc: 'Aumenta a capacidade de membros da guilda em +2.', icon: '🍺' },
        { id: 'training', name: 'Campo de Treinamento', baseCost: 300, desc: 'Melhora os equipamentos de treino do quartel.', icon: '🎯' }
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
        // ID exato do index.html: buildings-container
        const container = document.getElementById('buildings-container');
        if (!container) return;

        let html = '<h3>🏛️ Edifícios da Guilda</h3>';

        this.list.forEach(b => {
            const lvl = state.buildings[b.id] || 0;
            const cost = Math.floor(b.baseCost * Math.pow(1.5, lvl));
            const canAfford = state.gold >= cost;

            html += `
                <div class="building-card">
                    <h4>${b.icon} ${b.name} (Nível ${lvl})</h4>
                    <p style="margin: 8px 0; color: #ccc;">${b.desc}</p>
                    <button class="action-btn" 
                            data-cost="${cost}"
                            onclick="Buildings.upgrade('${b.id}')" 
                            ${!canAfford ? 'disabled' : ''}>
                        Evoluir (${cost} Ouro)
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};
