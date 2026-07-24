/* ==========================================================================
   ADVENTURERS.JS - RECRUTAMENTO E GERENCIAMENTO DE HERÓIS
   ========================================================================== */

const Adventurers = {
    // Tipos de Heróis disponíveis para contratação
    types: [
        { id: 'novice', name: 'Novato', baseCost: 50, baseGps: 1, costMult: 1.15, icon: '🗡️' },
        { id: 'archer', name: 'Arqueiro', baseCost: 200, baseGps: 5, costMult: 1.15, icon: '🏹' },
        { id: 'mage', name: 'Mago', baseCost: 800, baseGps: 22, costMult: 1.15, icon: '🔮' },
        { id: 'knight', name: 'Cavaleiro', baseCost: 3500, baseGps: 90, costMult: 1.15, icon: '🛡️' }
    ],

    // Calcula o ganho total de ouro por segundo (GPS)
    calculateTotalGPS() {
        if (!state.adventurers) return 0;
        return state.adventurers.reduce((total, adv) => total + (adv.gps || 0), 0);
    },

    // Contrata um herói
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

    // Renderiza a lista de heróis e a loja de recrutamento
    render() {
        const container = document.getElementById('adventurers-list') || document.getElementById('tab-adventurers');
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

        html += '</div>';

        // Lista de Membros Atuais
        html += '<h3 style="margin-top: 20px;">Guilda Atual</h3><ul class="member-list">';
        if (state.adventurers && state.adventurers.length > 0) {
            state.adventurers.forEach(adv => {
                html += `<li><span>${adv.name}</span> <span>+${adv.gps} GPS</span></li>`;
            });
        } else {
            html += '<p class="empty-msg">Nenhum herói contratado ainda.</p>';
        }
        html += '</ul>';

        container.innerHTML = html;
    }
};
