/* ==========================================================================
   ADVENTURERS.JS - GERENCIAMENTO E RECRUTAMENTO DE AVENTUREIROS
   ========================================================================== */

const Adventurers = {
    classes: [
        { id: 'guerreiro', name: 'Guerreiro', baseCost: 50, baseGps: 1, power: 10, icon: '⚔️' },
        { id: 'arqueiro', name: 'Arqueiro', baseCost: 200, baseGps: 5, power: 25, icon: '🏹' },
        { id: 'mago', name: 'Mago', baseCost: 800, baseGps: 22, power: 70, icon: '🔮' },
        { id: 'clerigo', name: 'Clérigo', baseCost: 3500, baseGps: 90, power: 200, icon: '✨' }
    ],

    calculateTotalGPS() {
        if (!state.adventurers) return 0;
        return state.adventurers.reduce((total, adv) => {
            if (adv.status === 'injured') return total;
            return total + (adv.gps || 0);
        }, 0);
    },

    hire(classId) {
        const template = this.classes.find(c => c.id === classId);
        if (!template) return;

        const count = state.adventurers.filter(a => a.classId === classId).length;
        const cost = Math.floor(template.baseCost * Math.pow(1.15, count));

        if (state.gold >= cost && state.adventurers.length < state.maxMembers) {
            state.gold -= cost;
            state.adventurers.push({
                id: Date.now(),
                classId: template.id,
                name: `${template.name} #${count + 1}`,
                gps: template.baseGps,
                power: template.power,
                level: 1,
                status: 'available'
            });

            this.render();
            if (typeof UI !== 'undefined') UI.update();
        }
    },

    render() {
        const container = document.getElementById('adventurers-container');
        if (!container) return;

        let html = '<h2>👥 Taverna de Recrutamento</h2><div class="cards-grid">';

        this.classes.forEach(cls => {
            const count = (state.adventurers || []).filter(a => a.classId === cls.id).length;
            const cost = Math.floor(cls.baseCost * Math.pow(1.15, count));
            const canAfford = state.gold >= cost;
            const hasSpace = (state.adventurers || []).length < state.maxMembers;

            html += `
                <div class="card">
                    <div class="card-icon">${cls.icon}</div>
                    <h3>${cls.name}</h3>
                    <p>Rendimento: +${cls.baseGps} Ouro/s</p>
                    <p>Poder de Luta: ⚔️ ${cls.power}</p>
                    <p>Contratados: <strong>${count}</strong></p>
                    <button class="action-btn" 
                            data-cost="${cost}"
                            onclick="Adventurers.hire('${cls.id}')" 
                            ${(!canAfford || !hasSpace) ? 'disabled' : ''}>
                        Contratar (${cost} Ouro)
                    </button>
                </div>
            `;
        });

        html += '</div><hr><h3>Membros da Guilda</h3>';

        if (state.adventurers && state.adventurers.length > 0) {
            html += '<ul class="member-list">';
            state.adventurers.forEach(adv => {
                let statusTxt = 'Disponível';
                if (adv.status === 'on-quest') statusTxt = 'Em Missão';
                if (adv.status === 'injured') statusTxt = 'Ferido 🩹';

                html += `<li><strong>${adv.name}</strong> (Nível ${adv.level}) — Poder: ${adv.power} | GPS: +${adv.gps} | Status: <em>${statusTxt}</em></li>`;
            });
            html += '</ul>';
        } else {
            html += '<p class="empty-msg">Nenhum herói contratado ainda.</p>';
        }

        container.innerHTML = html;
    }
};
