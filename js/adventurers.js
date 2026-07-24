/* ==========================================================================
   ADVENTURERS.JS - CLASSES, EXP, LEVEL UP E PODER
   ========================================================================== */

const Adventurers = {
    classes: [
        { id: 'guerreiro', name: 'Guerreiro', baseCost: 50, power: 10, icon: '⚔️', desc: 'Passiva: +10% Poder por Nível' },
        { id: 'arqueiro', name: 'Arqueiro', baseCost: 50, power: 10, icon: '🏹', desc: 'Passiva: -10% Tempo da Missão por Arqueiro' },
        { id: 'mago', name: 'Mago', baseCost: 50, power: 10, icon: '🔮', desc: 'Passiva: +15% Ouro por Mago' },
        { id: 'clerigo', name: 'Clérigo', baseCost: 50, power: 10, icon: '✨', desc: 'Passiva: +10% Chance de Sucesso por Clérigo' }
    ],

    getMaxPartySize() {
        const tableLvl = (state.buildings && state.buildings.strategyTable) || 0;
        return Math.min(4, 1 + tableLvl); // Começa com 1, vai até 4
    },

    calculateNextXp(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    },

    getEffectivePower(adv) {
        const basePower = adv.power || 10;
        const level = adv.level || 1;
        
        const levelMult = adv.classId === 'guerreiro' ? 0.10 : 0.05;
        const levelBonus = 1 + ((level - 1) * levelMult);

        const trainingLvl = (state.buildings && state.buildings.training) || 0;
        const buildingBonus = 1 + (trainingLvl * 0.10);

        return Math.floor(basePower * levelBonus * buildingBonus);
    },

    calculateTotalGuildPower() {
        if (!state.adventurers) return 0;
        return state.adventurers.reduce((total, adv) => {
            if (adv.status === 'injured') return total;
            return total + this.getEffectivePower(adv);
        }, 0);
    },

    addXP(hero, amount) {
        if (!hero) return;
        hero.xp = (hero.xp || 0) + amount;

        while (hero.xp >= hero.maxXp) {
            hero.xp -= hero.maxXp;
            hero.level += 1;
            hero.maxXp = this.calculateNextXp(hero.level);
        }
    },

    hire(classId) {
        const template = this.classes.find(c => c.id === classId);
        if (!template) return;

        const totalHired = (state.adventurers || []).length;
        const cost = Math.floor(template.baseCost * Math.pow(1.25, totalHired));

        if (state.gold >= cost && totalHired < state.maxMembers) {
            state.gold -= cost;
            state.adventurers.push({
                id: Date.now(),
                classId: template.id,
                name: `${template.name} #${totalHired + 1}`,
                power: template.power,
                level: 1,
                xp: 0,
                maxXp: this.calculateNextXp(1),
                status: 'available'
            });

            this.render();
            if (typeof UI !== 'undefined') UI.update();
            if (typeof Quests !== 'undefined') Quests.render();
        }
    },

    heal(heroId) {
        const hero = state.adventurers.find(a => a.id === heroId);
        if (!hero || hero.status !== 'injured') return;

        const healCost = hero.level * 15;
        if (state.gold >= healCost) {
            state.gold -= healCost;
            hero.status = 'available';
            this.render();
            if (typeof UI !== 'undefined') UI.update();
            if (typeof Quests !== 'undefined') Quests.render();
        }
    },

    render() {
        const container = document.getElementById('adventurers-container');
        if (!container) return;

        let html = `<h2>👥 Recrutamento (Limite do Grupo: ${this.getMaxPartySize()}/4)</h2><div class="cards-grid">`;

        const totalHired = (state.adventurers || []).length;

        this.classes.forEach(cls => {
            const cost = Math.floor(cls.baseCost * Math.pow(1.25, totalHired));
            const canAfford = state.gold >= cost;
            const hasSpace = totalHired < state.maxMembers;

            html += `
                <div class="card">
                    <div class="card-icon">${cls.icon}</div>
                    <h3>${cls.name}</h3>
                    <p style="font-size: 0.85rem; color: #aaa;">${cls.desc}</p>
                    <p>Poder Base: ⚔️ ${cls.power}</p>
                    <button class="action-btn" 
                            data-cost="${cost}"
                            onclick="Adventurers.hire('${cls.id}')" 
                            ${(!canAfford || !hasSpace) ? 'disabled' : ''}>
                        Recrutar (${cost} 🪙)
                    </button>
                </div>
            `;
        });

        html += '</div><hr><h3>Membros da Guilda</h3>';

        if (state.adventurers && state.adventurers.length > 0) {
            html += '<ul class="member-list">';
            state.adventurers.forEach(adv => {
                const effectivePower = this.getEffectivePower(adv);
                let statusTxt = 'Disponível';
                let healAction = '';

                if (adv.status === 'on-quest') statusTxt = 'Em Missão';
                if (adv.status === 'injured') {
                    const healCost = adv.level * 15;
                    statusTxt = '<span style="color:#e74c3c">Ferido 🩹</span>';
                    healAction = `<button class="action-btn heal-btn" onclick="Adventurers.heal(${adv.id})">Tratar (${healCost} 🪙)</button>`;
                }

                const xpPct = Math.floor((adv.xp / adv.maxXp) * 100);

                html += `
                    <li>
                        <div style="flex: 1; margin-right: 15px;">
                            <strong>${adv.name}</strong> (Nível ${adv.level}) — Poder: ⚔️ ${effectivePower} | Status: <em>${statusTxt}</em>
                            <div class="xp-bar-container" title="XP: ${adv.xp}/${adv.maxXp}">
                                <div class="xp-bar-fill" style="width: ${xpPct}%;"></div>
                            </div>
                        </div>
                        ${healAction}
                    </li>`;
            });
            html += '</ul>';
        } else {
            html += '<p class="empty-msg">Nenhum herói contratado ainda.</p>';
        }

        container.innerHTML = html;
    }
};
