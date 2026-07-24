/* ==========================================================================
   ADVENTURERS.JS - RECRUTAMENTO E GERENCIAMENTO DE HERÓIS
   ========================================================================== */

const Adventurers = {
    // Tipos de Heróis para contratação
    types: [
        { id: 'novice', name: 'Novato', baseCost: 50, baseGps: 1, costMult: 1.15, icon: '🗡️' },
        { id: 'archer', name: 'Arqueiro', baseCost: 200, baseGps: 5, costMult: 1.15, icon: '🏹' },
        { id: 'mage', name: 'Mago', baseCost: 800, baseGps: 22, costMult: 1.15, icon: '🔮' },
        { id: 'knight', name: 'Cavaleiro', baseCost: 3500, baseGps: 90, costMult: 1.15, icon: '🛡️' }
    ],

    // Calcula a soma do ganho de ouro por segundo de todos os heróis
    calculateTotalGPS() {
        if (!state.adventurers) return 0;
        return state.adventurers.reduce((total, adv) => total + (adv.gps || 0), 0);
    },

    // Função de contratar herói
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

    // Renderiza a lista de cards de recrutamento e lista de membros
    render() {
        const container = document.getElementById('adventurers-container');
        if (!container) return;

        let html = '<h2>👥 Recrutamento de Aventureiros</h2><div class="cards-grid">';

        this.types.forEach(type => {
            const count = (state.adventurers || []).filter(a => a.typeId === type.id).length;
            const cost = Math.floor(type.baseCost * Math.pow(type.costMult, count));
            const canAfford = state.gold >= cost;
            const hasSpace = (state.adventurers || []).length < state.maxMembers;

            html += `
                <div class="card">
                    <div class="card-icon">${type.icon}</div>
                    <h3>${type.name}</h3>
                    <p>Rendimento: +${type.baseGps} Ouro/s</p>
                    <p>Contratados: <strong>${count}</strong></p>
                    <button class="action-btn" 
                            data-cost="${cost}"
                            onclick="Adventurers.hire('${type.id}')" 
                            ${(!canAfford || !hasSpace) ? 'disabled' : ''}>
                        Contratar (${cost} Ouro)
                    </button>
                </div>
            `;
        });

        html += '</div><hr><h3>Membros na Guilda</h3>';

        if (state.adventurers && state.adventurers.length > 0) {
            html += '<ul class="member-list">';
            state.adventurers.forEach(adv => {
                html += `<li><strong>${adv.name}</strong> — Rendimento: +${adv.gps} GPS</li>`;
            });
            html += '</ul>';
        } else {
            html += '<p class="empty-msg">Nenhum herói contratado ainda.</p>';
        }

        container.innerHTML = html;
    }
};
