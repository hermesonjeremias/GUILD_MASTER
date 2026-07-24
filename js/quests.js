/* ==========================================================================
   QUESTS.JS - QUARTEL DE MISSÕES (COM AS 5 ESCALAS DE CORES)
   ========================================================================== */

const Quests = {
    list: [
        { id: 'q1', title: 'Caçar Ratos no Porão', duration: 8, rewardGold: 45, reqPower: 8, icon: '🐀' },
        { id: 'q2', title: 'Patrulhar as Estradas', duration: 15, rewardGold: 120, reqPower: 15, icon: '🌲' },
        { id: 'q3', title: 'Limpar Acampamento Goblin', duration: 30, rewardGold: 350, reqPower: 30, icon: '👺' },
        { id: 'q4', title: 'Investigar Caverna Sombria', duration: 60, rewardGold: 1000, reqPower: 60, icon: '🦇' }
    ],

    getSuccessChance(heroPower, reqPower) {
        if (!heroPower) return 0;
        const ratio = heroPower / reqPower;
        let chance = Math.floor(ratio * 75);
        return Math.min(100, Math.max(5, chance));
    },

    getChanceClass(chance) {
        if (chance >= 96) return 'chance-blue';
        if (chance >= 76) return 'chance-green';
        if (chance >= 51) return 'chance-yellow';
        if (chance >= 26) return 'chance-orange';
        return 'chance-red';
    },

    startQuest(questId) {
        const selectElem = document.getElementById(`select-hero-${questId}`);
        if (!selectElem) return;

        const heroId = Number(selectElem.value);
        const hero = (state.adventurers || []).find(a => a.id === heroId);
        const quest = this.list.find(q => q.id === questId);

        if (!hero || !quest || hero.status !== 'available') return;

        hero.status = 'on-quest';
        state.activeQuests.push({
            ...quest,
            instanceId: Date.now(),
            heroId: hero.id,
            heroName: hero.name,
            heroPower: hero.power,
            elapsed: 0
        });

        if (typeof Adventurers !== 'undefined') Adventurers.render();
        this.render();
        if (typeof UI !== 'undefined') UI.update();
    },

    updateActiveQuests(dt) {
        if (!state.activeQuests) return;

        for (let i = state.activeQuests.length - 1; i >= 0; i--) {
            const q = state.activeQuests[i];
            q.elapsed += dt;

            if (q.elapsed >= q.duration) {
                const hero = (state.adventurers || []).find(a => a.id === q.heroId);
                const chance = this.getSuccessChance(q.heroPower, q.reqPower);
                const roll = Math.random() * 100;

                if (roll <= chance) {
                    state.gold += q.rewardGold;
                    if (hero) {
                        hero.status = 'available';
                        hero.level += 1;
                        hero.power += 2;
                    }
                } else {
                    if (hero) hero.status = 'injured';
                }

                state.activeQuests.splice(i, 1);
                if (typeof Adventurers !== 'undefined') Adventurers.render();
                this.render();
            }
        }
    },

    render() {
        const container = document.getElementById('quests-container');
        if (!container) return;

        let html = '<h3>📜 Mural de Missões</h3>';
        const availableHeroes = (state.adventurers || []).filter(a => a.status === 'available');

        this.list.forEach(quest => {
            html += `
                <div class="quest-card">
                    <h4>${quest.icon} ${quest.title}</h4>
                    <div class="rewards">
                        <span>⏱️ Duração: ${quest.duration}s</span>
                        <span>🪙 Recompensa: +${quest.rewardGold} Ouro</span>
                        <span>⚔️ Requerido: ${quest.reqPower} Poder</span>
                    </div>
                    <div class="quest-actions">
                        <select id="select-hero-${quest.id}" ${availableHeroes.length === 0 ? 'disabled' : ''}>
                            ${availableHeroes.length === 0 ? '<option>Nenhum herói disponível</option>' : ''}
                            ${availableHeroes.map(h => {
                                const chance = this.getSuccessChance(h.power, quest.reqPower);
                                return `<option value="${h.id}">${h.name} (Poder: ${h.power} | Sucesso: ${chance}%)</option>`;
                            }).join('')}
                        </select>
                        <button class="action-btn" onclick="Quests.startQuest('${quest.id}')" ${availableHeroes.length === 0 ? 'disabled' : ''}>
                            Iniciar
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};
