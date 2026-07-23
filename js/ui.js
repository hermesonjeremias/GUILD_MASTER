// js/ui.js - Desenha todos os elementos visuais da interface

function triggerErrorEffect(element) {
    if (!element) return;
    element.classList.add('btn-error-shake');
    setTimeout(() => {
        element.classList.remove('btn-error-shake');
    }, 400);
}

function updateUI() {
    const goldElem = document.getElementById('gold-display');
    const prestigeElem = document.getElementById('prestige-display');
    const membersElem = document.getElementById('members-display');

    if (goldElem) goldElem.innerText = Math.floor(gameState.gold);
    if (prestigeElem) prestigeElem.innerText = gameState.prestige;
    if (membersElem) membersElem.innerText = `${gameState.adventurers.length} / ${gameState.maxMembers}`;
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) activeTab.classList.add('active');

    const clickedBtn = Array.from(buttons).find(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        return onclickAttr && onclickAttr.includes(tabName);
    });
    if (clickedBtn) clickedBtn.classList.add('active');

    if (tabName === 'aventureiros') {
        renderAdventurers();
    } else if (tabName === 'missoes') {
        renderQuests();
    } else if (tabName === 'construcoes') {
        renderBuildings();
    }
}

function renderAdventurers() {
    const listContainer = document.getElementById('adventurers-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    // Verifica capacidade e Gold
    const isFull = gameState.adventurers.length >= gameState.maxMembers;
    const recruitCost = 40;
    const canAffordRecruit = gameState.gold >= recruitCost && !isFull;
    const recruitBtnClass = canAffordRecruit ? '' : 'unaffordable';

    const recruitPanelHtml = `
        <div class="recruit-panel">
            <h3>Taverna de Recrutamento</h3>
            <p>Contrate novos aventureiros para a guilda (Custo: ${recruitCost} Ouro):</p>
            <div class="recruit-buttons">
                <button class="action-btn ${recruitBtnClass}" onclick="hireAdventurer('Guerreiro', ${recruitCost}, event)">🛡️ Guerreiro</button>
                <button class="action-btn ${recruitBtnClass}" onclick="hireAdventurer('Mago', ${recruitCost}, event)">🔮 Mago</button>
                <button class="action-btn ${recruitBtnClass}" onclick="hireAdventurer('Padre', ${recruitCost}, event)">✨ Padre</button>
                <button class="action-btn ${recruitBtnClass}" onclick="hireAdventurer('Arqueiro', ${recruitCost}, event)">🏹 Arqueiro</button>
            </div>
        </div>
        <hr class="divider">
    `;
    listContainer.innerHTML = recruitPanelHtml;

    if (gameState.adventurers.length === 0) {
        listContainer.innerHTML += '<p class="empty-msg">Nenhum aventureiro contratado ainda.</p>';
        return;
    }

    gameState.adventurers.forEach(hero => {
        let statusBadge = '';
        let healButtonHtml = '';

        if (hero.status === 'available') {
            statusBadge = '<span class="badge available">Pronto</span>';
        } else if (hero.status === 'on_quest') {
            statusBadge = '<span class="badge on-quest">Em Missão</span>';
        } else if (hero.status === 'injured') {
            statusBadge = `<span class="badge injured">Ferido (${Math.ceil(hero.injuryTimer)}s)</span>`;
            
            const healCost = 15;
            const canAffordHeal = gameState.gold >= healCost;
            const healBtnClass = canAffordHeal ? '' : 'unaffordable';

            healButtonHtml = `
                <button class="action-btn heal-btn ${healBtnClass}" onclick="healHero('${hero.id}', ${healCost}, event)">
                    🧪 Curar Instantaneamente (🪙 ${healCost} Ouro)
                </button>
            `;
        }

        const cardHtml = `
            <div class="hero-card">
                <div class="hero-header">
                    <h3>${hero.name} <small>Nv. ${hero.level} ${hero.heroClass}</small></h3>
                    ${statusBadge}
                </div>
                <div class="hero-stats">
                    <span>⚔️ Poder: ${hero.stats.power}</span>
                    <span>🛡️ Defesa: ${hero.stats.defense}</span>
                    <span>⚡ Vel: ${hero.stats.speed}</span>
                </div>
                <div class="xp-bar-container">
                    <div class="xp-bar-fill" style="width: ${(hero.xp / hero.maxXp) * 100}%"></div>
                </div>
                <small class="xp-text">XP: ${hero.xp} / ${hero.maxXp}</small>
                ${healButtonHtml}
            </div>
        `;
        listContainer.innerHTML += cardHtml;
    });
}

function renderQuests() {
    const listContainer = document.getElementById('quests-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (gameState.activeQuests && gameState.activeQuests.length > 0) {
        listContainer.innerHTML += `<h3 class="section-title">Missões em Andamento</h3>`;
        
        gameState.activeQuests.forEach(quest => {
            const progressPercent = ((quest.duration - quest.timeRemaining) / quest.duration) * 100;
            const cardHtml = `
                <div class="quest-card active-quest-card" id="active-quest-card-${quest.id}">
                    <div class="quest-header">
                        <h4>${quest.title}</h4>
                        <span class="quest-hero-tag">⚔️ ${quest.heroName}</span>
                    </div>
                    <div class="quest-progress-container">
                        <div class="quest-progress-fill" id="progress-fill-${quest.id}" style="width: ${progressPercent}%"></div>
                    </div>
                    <small class="quest-time" id="quest-time-${quest.id}">Tempo restante: ${Math.ceil(quest.timeRemaining)}s</small>
                </div>
            `;
            listContainer.innerHTML += cardHtml;
        });
    }

    listContainer.innerHTML += `<h3 class="section-title">Contratos Disponíveis</h3>`;

    availableQuestsList.forEach(quest => {
        const availableHeroes = gameState.adventurers.filter(h => h.status === 'available');
        
        let selectOptions = `<option value="">Selecione um Herói...</option>`;
        availableHeroes.forEach(h => {
            selectOptions += `<option value="${h.id}">${h.name} (Nv. ${h.level} ${h.heroClass})</option>`;
        });

        const isHeroAvailable = availableHeroes.length > 0;

        const questCardHtml = `
            <div class="quest-card">
                <div class="quest-header">
                    <h4>${quest.title}</h4>
                    <span class="quest-duration">⏳ ${quest.duration}s</span>
                </div>
                <p class="quest-desc">${quest.description}</p>
                <div class="quest-rewards">
                    <span>🪙 +${quest.goldReward} Ouro</span>
                    <span>⭐ +${quest.xpReward} XP</span>
                    <span>👑 +${quest.prestigeReward} Prestígio</span>
                    <span class="risk-tag">⚠️ Risco: ${quest.injuryChance * 100}%</span>
                </div>
                <div class="quest-action">
                    <select id="select-hero-${quest.id}" ${!isHeroAvailable ? 'disabled' : ''}>
                        ${selectOptions}
                    </select>
                    <button class="action-btn" ${!isHeroAvailable ? 'disabled' : ''} 
                        onclick="handleStartQuestClick('${quest.id}', event)">
                        Enviar
                    </button>
                </div>
            </div>
        `;
        listContainer.innerHTML += questCardHtml;
    });
}

function updateActiveQuestsUI() {
    if (!gameState.activeQuests) return;

    gameState.activeQuests.forEach(quest => {
        const fillElem = document.getElementById(`progress-fill-${quest.id}`);
        const timeElem = document.getElementById(`quest-time-${quest.id}`);

        if (fillElem && timeElem) {
            const progressPercent = ((quest.duration - quest.timeRemaining) / quest.duration) * 100;
            fillElem.style.width = `${progressPercent}%`;
            timeElem.innerText = `Tempo restante: ${Math.ceil(quest.timeRemaining)}s`;
        }
    });
}

function handleStartQuestClick(questId, event) {
    const selectElem = document.getElementById(`select-hero-${questId}`);
    if (!selectElem || !selectElem.value) {
        triggerErrorEffect(event ? event.currentTarget : null);
        return;
    }
    startQuest(questId, selectElem.value);
}

function renderBuildings() {
    const listContainer = document.getElementById('buildings-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (typeof availableBuildings === 'undefined') return;

    availableBuildings.forEach(building => {
        const cost = Math.floor(building.baseCost * Math.pow(building.costMultiplier, building.level));
        const canAfford = gameState.gold >= cost;
        const btnClass = canAfford ? '' : 'unaffordable';

        const cardHtml = `
            <div class="building-card">
                <div class="building-header">
                    <h3>${building.name} <small>Nível ${building.level}</small></h3>
                </div>
                <p class="building-desc">${building.description}</p>
                <div class="building-action">
                    <button class="action-btn ${btnClass}" onclick="upgradeBuilding('${building.id}', event)">
                        Evoluir (🪙 ${cost} Ouro)
                    </button>
                </div>
            </div>
        `;
        listContainer.innerHTML += cardHtml;
    });
}
