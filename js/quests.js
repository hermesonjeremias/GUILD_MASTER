/* ==========================================================================
   QUESTS.JS - MISSÕES E CHANCE DE SUCESSO
   ========================================================================== */

const Quests = {
    available: [
        { id: 'rats', title: 'Caçar Ratos no Porão', duration: 5, rewardGold: 35, reqPower: 8, icon: '🐀' },
        { id: 'goblin', title: 'Patrulhar a Floresta', duration: 12, rewardGold: 120, reqPower: 20, icon: '🌲' },
        { id: 'escort', title: 'Escoltar Caravana', duration: 25, rewardGold: 400, reqPower: 60, icon: '🛒' },
        { id: 'dragon', title: 'Investigar Caverna', duration: 50, rewardGold: 1200, reqPower: 150, icon: '🐉' }
    ],

    getSuccessChance(heroPower, reqPower) {
        if (!heroPower) return 0;
        const ratio = heroPower / reqPower;
        let chance = Math.floor(ratio * 75);
        return Math.min(100, Math.max(5, chance));
    },

    getChanceBadge(chance) {
        if (chance >= 95) return `<span class="badge" style="background: #2ed573; color: #fff;">Muito Fácil (${chance}%)</span>`;
        if (chance >= 75) return `<span class="badge" style="background: #1e90ff; color: #fff;">Fácil (${chance}%)</span>`;
        if (chance >= 50) return `<span class="badge" style="background: #ffa502; color: #fff;">Média (${chance}%)</span>`;
        if (chance >= 25) return `<span class="badge" style="background: #ff6348; color: #fff;">Difícil (${chance}%)</span>`;
        return `<span class="badge" style="background: #ff4757; color: #fff;">Muito Difícil (${chance}%)</span>`;
    },

    startQuest(questId) {
        const selectElem = document.getElementById(`select-hero-${questId}`);
        if (!selectElem) return;

        const heroId = Number(selectElem.value);
        const hero = (state.adventurers || []).find(a => a.id === heroId);
        const quest = this.available.find(q => q.id === questId);

        if (!hero || !quest || hero.status !== 'available') return;

        const effectivePower = Adventurers.getEffectivePower(hero);

        hero.status = 'on-quest';
        state.activeQuests.push({
            ...quest,
            instanceId: Date.now(),
            heroId: hero.id,
            heroName: hero.name,
            heroPower: effectivePower,
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
                        hero.power += 3;
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

        let html = '<h2>📜 Mural de Missões</h2><div class="cards-grid">';
        const availableHeroes = (state.adventurers || []).filter(a => a.status === 'available');

        this.available.forEach(quest => {
            let selectOptions = '<option value="">Nenhum herói disponível</option>';
            
            if (availableHeroes.length > 0) {
                selectOptions = availableHeroes.map(h => {
                    const power = Adventurers.getEffectivePower(h);
                    const chance = this.getSuccessChance(power, quest.reqPower);
                    return `<option value="${h.id}">${h.name} (Poder: ${power} | Chance: ${chance}%)</option>`;
                }).join('');
            }

            html += `
                <div class="card">
                    <div class="card-icon">${quest.icon}</div>
                    <h3>${quest.title}</h3>
                    <p>Duração: ${quest.duration}s | Recompensa: 💰 ${quest.rewardGold}</p>
                    <p>Poder Requerido: ⚔️ ${quest.reqPower}</p>
                    <div style="margin: 10px 0;">
                        <select id="select-hero-${quest.id}" style="padding: 5px; width: 100%; margin-bottom: 5px;" ${availableHeroes.length === 0 ? 'disabled' : ''}>
                            ${selectOptions}
                        </select>
                    </div>
                    <button class="action-btn" onclick="Quests.startQuest('${quest.id}')" ${availableHeroes.length === 0 ? 'disabled' : ''}>
                        Enviar Aventureiro
                    </button>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }
};
