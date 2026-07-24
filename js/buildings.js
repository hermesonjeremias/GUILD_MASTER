/* ==========================================================================
   BUILDINGS.JS - CONSTRUÇÕES E MELHORIAS DA GUILDA
   ========================================================================== */

const Buildings = {
    list: [
        { id: 'tavern', name: 'Ampliar Taverna', baseCost: 100, mult: 1.5, desc: 'Aumenta o limite máximo de membros na guilda (+2 por nível).', icon: '🍺' },
        { id: 'training', name: 'Centro de Treinamento', baseCost: 300, mult: 1.8, desc: 'Melhora o poder base de novos aventureiros.', icon: '🎯' },
        { id: 'infirmary', name: 'Enfermaria', baseCost: 500, mult: 2.0, desc: 'Acelera a recuperação de heróis feridos.', icon: '🏥' }
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
            if (typeof UI !== 'undefined') UI.update();
        }
    },

    render() {
        const container = document.getElementById('buildings-container');
        if (!container) return;

        let html = '<h3>🏛️ Edifícios e Infraestrutura</h3>';

        this.list.forEach(b => {
            const lvl = state.buildings[b.id] || 0;
            const cost = Math.floor(b.baseCost * Math.pow(b.mult, lvl));
            const canAfford = state.gold >= cost;

            html += `
                <div class="building-card">
                    <h4>${b.icon} ${b.name} (Nível ${lvl})</h4>
                    <p style="margin: 8px 0; color: #bbb;">${b.desc}</p>
                    <button class="action-btn" data-cost="${cost}" onclick="Buildings.upgrade('${b.id}')" ${!canAfford ? 'disabled' : ''}>
                        Melhorar (${cost} 🪙)
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};
