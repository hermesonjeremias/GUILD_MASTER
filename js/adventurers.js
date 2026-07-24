/* ==========================================================================
   ADVENTURERS.JS - RECRUTAMENTO, EQUIPAMENTOS E TAVERNA
   ========================================================================== */

const Adventurers = {
    classes: [
        { id: 'guuerreiro', name: 'Guerreiro', baseCost: 50, baseGps: 1.5, power: 10, icon: '⚔️' },
        { id: 'arqueiro', name: 'Arqueiro', baseCost: 150, baseGps: 4.0, power: 8, icon: '🏹' },
        { id: 'mago', name: 'Mago', baseCost: 400, baseGps: 12.0, power: 15, icon: '🔮' },
        { id: 'clérigo', name: 'Clérigo', baseCost: 1000, baseGps: 30.0, power: 7, icon: '✨' }
    ],

    calculateTotalGPS() {
        if (!state.adventurers) return 0;
        return state.adventurers.reduce((total, adv) => {
            if (adv.status === 'injured') return total;
            let bonus = adv.equipBonus || 0;
            return total + (adv.gps || 0) + bonus;
        }, 0);
    },

    hire(classId) {
        const cls = this.classes.find(c => c.id === classId);
        if (!cls) return;

        const count = state.adventurers.filter(a => a.classId === classId).length;
        const currentCost = Math.floor(cls.baseCost * Math.pow(1.2, count));

        if (state.gold >= currentCost && state.adventurers.length < state.maxMembers) {
            state.gold -= currentCost;
            state.adventurers.push({
                id: Date.now(),
                classId: cls.id,
                name: `${cls.name} #${count + 1}`,
                gps: cls.baseGps,
                power: cls.power,
                level: 1,
                status: 'available', // available, on-quest, injured
                equipment: null,
                equipBonus: 0
            });

            this.render();
            if (typeof UI !== 'undefined') UI.update();
        }
    },

    equipItem(heroId, itemId) {
        const hero = state.adventurers.find(a => a.id === heroId);
        if (!hero) return;

        if (!itemId) {
            hero.equipment = null;
            hero.equipBonus = 0;
        } else {
            const item = (state.inventory || []).find(i => i.id === itemId);
            if (item) {
                hero.equipment = item.name;
                hero.equipBonus = item.bonus || 2;
            }
        }
        this.render();
        if (typeof UI !== 'undefined') UI.update();
    },

    render() {
        const container = document.getElementById('adventurers-container');
        if (!container) return;

        let html = `
            <div class="recruit-panel">
                <h3>🍺 Taverna & Recrutamento</h3>
                <p>Contrate aventureiros para gerar ouro passivo e realizar missões perigosas.</p>
                <div class="recruit-buttons">
        `;

        this.classes.forEach(cls => {
            const count = (state.adventurers || []).filter(a => a.classId === cls.id).length;
            const cost = Math.floor(cls.baseCost * Math.pow(1.2, count));
            const canAfford = state.gold >= cost;
            const hasSpace = (state.adventurers || []).length < state.maxMembers;

            html += `
                <button class="action-btn" data-cost="${cost}" onclick="Adventurers.hire('${cls.id}')" ${(!canAfford || !hasSpace) ? 'disabled' : ''}>
                    ${cls.icon} ${cls.name} (${cost} 🪙)
                </button>
            `;
        });

        html += `</div></div><hr><h3>👥 Membros da Guilda</h3>`;

        if (!state.adventurers || state.adventurers.length === 0) {
            html += '<p class="empty-msg">Nenhum aventureiro contratado ainda.</p>';
        } else {
            state.adventurers.forEach(hero => {
                let statusBadge = '<span class="badge available">Disponível</span>';
                if (hero.status === 'on-quest') statusBadge = '<span class="badge on-quest">Em Missão</span>';
                if (hero.status === 'injured') statusBadge = '<span class="badge injured">Ferido</span>';

                html += `
                    <div class="hero-card">
                        <div class="hero-header">
                            <h4>${hero.name} (Nível ${hero.level})</h4>
                            ${statusBadge}
                        </div>
                        <div class="hero-stats">
                            <span>🪙 GPS: +${(hero.gps + (hero.equipBonus || 0)).toFixed(1)}/s</span>
                            <span>⚔️ Poder: ${hero.power}</span>
                        </div>
                        <div class="equipment-box">
                            <small>Equipamento: ${hero.equipment || 'Nenhum'}</small>
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    }
};