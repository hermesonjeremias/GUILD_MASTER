/* ==========================================================================
   ADVENTURERS.JS - RECRUTAMENTO E GERENCIAMENTO DE HERÓIS
   ========================================================================== */

const Adventurers = {
    types: [
        { id: 'novice', name: 'Novato', baseCost: 50, baseGps: 1, costMult: 1.15, icon: '🗡️' },
        { id: 'archer', name: 'Arqueiro', baseCost: 200, baseGps: 5, costMult: 1.15, icon: '🏹' },
        { id: 'mage', name: 'Mago', baseCost: 800, baseGps: 22, costMult: 1.15, icon: '🔮' },
        { id: 'knight', name: 'Cavaleiro', baseCost: 3500, baseGps: 90, costMult: 1.15, icon: '🛡️' }
    ],

    calculateTotalGPS() {
        if (!state.adventurers) return 0;
        return state.adventurers.reduce((total, adv) => total + (adv.gps || 0), 0);
    },

    hire(typeId) {
        const template = this.types.find(t => t.id === typeId);
        if (!template) return;

        const count = state.adventurers.filter(a => a.typeId === typeId).length;
        const currentCost = Math.floor(template.baseCost * Math.pow(template.costMult, count));

        if (state.gold >= currentCost && state.adventurers.length < state.maxMembers) {
            state.gold -= currentCost;
            state.adventurers.push({
                id: Date.now(),
                typeId: template.id,
                name: `${template.name} #${count + 1}`,
                gps: template.baseGps,
                level: 1
            });

            this.render();
            if (typeof UI !== 'undefined') UI.update();
        }
    },

    render() {
        // ID exato do index.html: adventurers-container
        const container = document.getElementById('adventurers-container');
        if (!container) return;

        let html = '<div class="recruit-panel"><h3>👥 Taverna de Recrutamento</h3><p>Contrate aventureiros para gerar ouro passivo para a guilda.</p></div>';

        this.types.forEach(type => {
            const count = (state.adventurers || []).filter(a => a.typeId === type.id).length;
            const cost = Math.floor(type.baseCost * Math.pow(type.costMult, count));
            const canAfford = state.gold >= cost;
            const hasSpace = (state.adventurers || []).length < state.maxMembers;

            html += `
                <div class="hero-card">
                    <div class="hero-header">
                        <h4>${type.icon} ${type.name}</h4>
                        <span class="badge available">Possuídos: ${count}</span>
                    </div>
                    <div class="hero-stats">
                        <span>Rendimento: +${type.baseGps} Ouro/s</span>
                    </div>
                    <button class="action-btn" 
                            data-cost="${cost}"
                            onclick="Adventurers.hire('${type.id}')" 
                            ${(!canAfford || !hasSpace) ? 'disabled' : ''}>
                        Contratar (${cost} Ouro)
                    </button>
                </div>
            `;
        });

        html += '<hr><h3>Membros da Guilda</h3>';
        if (state.adventurers && state.adventurers.length > 0) {
            state.adventurers.forEach(adv => {
                html += `
                    <div class="hero-card" style="padding: 10px; margin-bottom: 8px;">
                        <strong>${adv.name}</strong> — Rendimento: +${adv.gps} Ouro/s
                    </div>
                `;
            });
        } else {
            html += '<p class="empty-msg">Nenhum herói contratado ainda.</p>';
        }

        container.innerHTML = html;
    }
};
