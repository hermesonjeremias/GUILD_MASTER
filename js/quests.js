/* ==========================================================================
   QUESTS.JS - MISSÕES, AUTOMAÇÃO E RESGATE AUTOMÁTICO
   ========================================================================== */

const Quests = {
    available: [
        { id: 'tavern', title: 'Servir na Taverna (Anti-Deadlock)', duration: 5, rewardGold: 15, rewardXp: 15, reqPower: 0, safe: true, icon: '🍺' },
        { id: 'rats', title: 'Caçar Ratos no Porão', duration: 8, rewardGold: 45, rewardXp: 30, reqPower: 12, safe: false, icon: '🐀' },
        { id: 'goblin', title: 'Patrulhar a Floresta', duration: 15, rewardGold: 140, rewardXp: 80, reqPower: 30, safe: false, icon: '🌲' },
        { id: 'escort', title: 'Escoltar Caravana', duration: 30, rewardGold: 450, rewardXp: 220, reqPower: 80, safe: false, icon: '🛒' },
        { id: 'dragon', title: 'Investigar Caverna', duration: 60, rewardGold: 1500, rewardXp: 600, reqPower: 200, safe: false, icon: '🐉' }
    ],

    calculatePartyStats(heroIds, quest, isAuto = false) {
        const heroes = (state.adventurers || []).filter(a => heroIds.includes(a.id));
        if (heroes.length === 0) return null;

        let totalPower = 0;
        let archerCount = 0;
        let mageCount = 0;
        let clericCount = 0;

        heroes.forEach(h => {
            totalPower += Adventurers.getEffectivePower(h);
            if (h.classId === 'arqueiro') archerCount++;
            if (h.classId === 'mago') mageCount++;
            if (h.classId === 'clerigo') clericCount++;
        });

        // Passiva Arqueiro: -10% tempo por Arqueiro (max 50%)
        const timeReduc = Math.min(0.50, archerCount * 0.10);
        let durationMultiplier = (1 - timeReduc);

        // Penalidade de Automação: +100% de tempo, reduzido pelo nível da Academia de Táticas (-25% por nível)
        if (isAuto) {
            const tacticsLvl = (state.buildings && state.buildings.tactics) || 0;
            const autoPenalty = Math.max(0, 1.0 - (tacticsLvl * 0.25));
            durationMultiplier += autoPenalty;
        }

        const finalDuration = Math.max(2, Math.round(quest.duration * durationMultiplier));

        // Passiva Mago: +15% ouro por Mago
        const goldBonus = 1 + (mageCount * 0.15);
        const finalGold = Math.round(quest.rewardGold * goldBonus);

        // Passiva Clérigo: +10% de chance por Clérigo
        let chance = 100;
        if (quest.reqPower > 0) {
            const ratio = totalPower / quest.reqPower;
            chance = Math.floor(ratio * 75) + (clericCount * 10);
            chance = Math.min(100, Math.max(5, chance));
        }

        return { heroes, totalPower, finalDuration, finalGold, chance };
    },

    getSelectedHeroIds(questId) {
        const checkboxes = document.querySelectorAll(`.party-check-${questId}:checked`);
        return Array.from(checkboxes).map(cb => Number(cb.value));
    },

    toggleAuto(questId) {
        const current = state.autoQuestsConfig[questId] || false;
        state.autoQuestsConfig[questId] = !current;
        this.render();
    },

    startQuest(questId, isAutoTrigger = false) {
        const quest = this.available.find(q => q.id === questId);
        if (!quest) return;

        let selectedIds = this.getSelectedHeroIds(questId);
        if (isAutoTrigger && state.autoQuestsConfig[`${questId}_ids`]) {
            selectedIds = state.autoQuestsConfig[`${questId}_ids`];
        }

        const maxParty = Adventurers.getMaxPartySize();
        if (selectedIds.length === 0) {
            if (!isAutoTrigger) alert('Selecione pelo menos 1 herói!');
            return;
        }
        if (selectedIds.length > maxParty) {
            if (!isAutoTrigger) alert(`Você só pode enviar até ${maxParty} herói(s) por missão! Evolua o Salão de Estratégia.`);
            return;
        }

        // Salva seleção para o ciclo de automação
        if (!isAutoTrigger) {
            state.autoQuestsConfig[`${questId}_ids`] = selectedIds;
        }

        const isAutoActive = !!state.autoQuestsConfig[questId];
        const partyStats = this.calculatePartyStats(selectedIds, quest, isAutoActive);
        if (!partyStats) return;

        // Verificar disponibilidade dos heróis
        const unavailable = partyStats.heroes.some(h => quest.safe ? h.status === 'on-quest' : h.status !== 'available');
        if (unavailable) return;

        partyStats.heroes.forEach(h => h.status = 'on-quest');

        state.activeQuests.push({
            ...quest,
            instanceId: Date.now(),
            isAuto: isAutoActive,
            partyIds: selectedIds,
            partyNames: partyStats.heroes.map(h => h.name).join(', '),
            totalPower: partyStats.totalPower,
            finalGold: partyStats.finalGold,
            finalDuration: partyStats.finalDuration,
            chance: partyStats.chance,
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

            if (q.elapsed >= q.finalDuration) {
                const partyHeroes = (state.adventurers || []).filter(a => q.partyIds.includes(a.id));
                const roll = Math.random() * 100;
                const success = q.safe || roll <= q.chance;

                if (success) {
                    state.gold += q.finalGold;
                    partyHeroes.forEach(hero => {
                        hero.status = 'available';
                        Adventurers.addXP(hero, q.rewardXp);
                    });
                } else {
                    // Tratar Falha
                    const rescueLvl = (state.buildings && state.buildings.rescue) || 0;
                    let rescued = false;

                    // Tentar Resgate Automático se ativado e construído
                    if (q.isAuto && rescueLvl > 0) {
                        const costMult = Math.max(1.5, 3.0 - (rescueLvl * 0.5));
                        const totalHealCost = partyHeroes.reduce((sum, h) => sum + Math.floor(h.level * 15 * costMult), 0);

                        if (state.gold >= totalHealCost) {
                            state.gold -= totalHealCost;
                            rescued = true;
                            partyHeroes.forEach(hero => hero.status = 'available');
                        }
                    }

                    if (!rescued) {
                        partyHeroes.forEach(hero => hero.status = 'injured');
                        // Se falhou e não resgatou, desativa automação temporariamente
                        state.autoQuestsConfig[q.id] = false;
                    }
                }

                const wasAuto = q.isAuto;
                const questId = q.id;

                state.activeQuests.splice(i, 1);

                if (typeof Adventurers !== 'undefined') Adventurers.render();
                this.render();

                // Restart automático se a automação continuar ativa
                if (wasAuto && state.autoQuestsConfig[questId]) {
                    setTimeout(() => this.startQuest(questId, true), 500);
                }
            }
        }
    },

    render() {
        const container = document.getElementById('quests-container');
        if (!container) return;

        const maxParty = Adventurers.getMaxPartySize();
        const officersLvl = (state.buildings && state.buildings.officers) || 0;

        let html = `<h2>📜 Mural de Missões (Max/Party: ${maxParty})</h2><div class="cards-grid">`;
        
        this.available.forEach(quest => {
            const candidateHeroes = (state.adventurers || []).filter(a => 
                quest.safe ? a.status !== 'on-quest' : a.status === 'available'
            );

            let partyHtml = '';
            if (candidateHeroes.length > 0) {
                partyHtml = candidateHeroes.map(h => {
                    const power = Adventurers.getEffectivePower(h);
                    const isInjured = h.status === 'injured' ? ' (Ferido)' : '';
                    return `
                        <label class="party-item">
                            <input type="checkbox" class="party-check-${quest.id}" value="${h.id}">
                            <span>${h.name}${isInjured} - ⚔️${power}</span>
                        </label>
                    `;
                }).join('');
            } else {
                partyHtml = '<p class="empty-msg" style="font-size: 0.8rem;">Nenhum herói disponível.</p>';
            }

            const isAutoEnabled = !!state.autoQuestsConfig[quest.id];
            const autoUnlocked = officersLvl > 0;

            html += `
                <div class="card">
                    <div class="card-icon">${quest.icon}</div>
                    <h3>${quest.title}</h3>
                    <p>Duração: ${quest.duration}s | Recompensa: 💰 ${quest.rewardGold} | XP: ⭐ ${quest.rewardXp}</p>
                    <p>Poder Requerido: ⚔️ ${quest.reqPower}</p>
                    
                    <div class="party-selector">
                        <strong style="font-size: 0.8rem; display: block; margin-bottom: 4px;">Seleção de Party (Max ${maxParty}):</strong>
                        ${partyHtml}
                    </div>

                    <button class="action-btn" onclick="Quests.startQuest('${quest.id}')" ${candidateHeroes.length === 0 ? 'disabled' : ''}>
                        Enviar Grupo
                    </button>

                    ${autoUnlocked ? `
                        <div class="auto-toggle">
                            <input type="checkbox" id="auto-${quest.id}" ${isAutoEnabled ? 'checked' : ''} onchange="Quests.toggleAuto('${quest.id}')">
                            <label for="auto-${quest.id}">Repetir Auto ⚙️</label>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }
};
