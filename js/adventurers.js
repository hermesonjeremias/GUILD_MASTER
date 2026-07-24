/* ==========================================================================
   ADVENTURERS.JS - HERÓIS E RECRUTAMENTO
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

    // Retorna o poder total considerando o bônus do Campo de Treinamento
    getEffectivePower(adv) {
        const trainingLvl = state.buildings.training || 0;
        const bonusMult = 1 + (trainingLvl * 0.10); // +10% de poder por nível do prédio
        return Math.floor(adv.power * bonusMult);
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

    // Ação para curar herói ferido (Custo proporcional ao nível)
    heal(heroId) {
        const hero = state.adventurers.find(a => a.id === heroId);
        if (!hero || hero.status !== 'injured') return;

        const healCost = hero.level * 20;
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
                    <p>Poder Base: ⚔️ ${cls.power}</p>
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
                const effectivePower = this.getEffectivePower(adv);
                let statusTxt = 'Disponível';
                let healAction = '';

                if (adv.status === 'on-quest') statusTxt = 'Em Missão';
                if (adv.status === 'injured') {
                    const healCost = adv.level * 20;
                    statusTxt = '<span style="color:#e74c3c">Ferido 🩹</span>';
                    healAction = `<button class="action-btn heal-btn" onclick="Adventurers.heal(${adv.id})">Tratar (${healCost} 🪙)</button>`;
                }

                html += `
                    <li>
                        <div>
                            <strong>${adv.name}</strong> (Nível ${adv.level}) — 
                            Poder: ⚔️ ${effectivePower} | 
                            GPS: +${adv.gps} | 
                            Status: <em>${statusTxt}</em>
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
