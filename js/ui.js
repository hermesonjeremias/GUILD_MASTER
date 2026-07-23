// js/ui.js

function updateUI() {
    document.getElementById('gold-display').innerText = Math.floor(gameState.gold);
    document.getElementById('prestige-display').innerText = gameState.prestige;
    document.getElementById('members-display').innerText = `${gameState.adventurers.length} / ${gameState.maxMembers}`;
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) activeTab.classList.add('active');

    const clickedBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick').includes(tabName));
    if (clickedBtn) clickedBtn.classList.add('active');

    if (tabName === 'aventureiros') {
        renderAdventurers();
    } else if (tabName === 'missoes') {
        renderQuests();
    }
}

function renderAdventurers() {
    const listContainer = document.getElementById('adventurers-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (gameState.adventurers.length === 0) {
        listContainer.innerHTML = '<p class="empty-msg">Nenhum aventureiro contratado ainda.</p>';
        return;
    }

    gameState.adventurers.forEach(hero => {
        let statusBadge = '';
        if (hero.status === 'available') {
            statusBadge = '<span class="badge available">Pronto</span>';
        } else if (hero.status === 'on_quest') {
            statusBadge = '<span class="badge on-quest">Em Missão</span>';
        } else if (hero.status === 'injured') {
            statusBadge = `<span class="badge injured">Ferido (${Math.ceil(hero.injuryTimer)}s)</span>`;
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
            </div>
        `;
        listContainer.innerHTML += cardHtml;
    });
}

// Renderiza o Mural de Contratos e as Missões em andamento
function renderQuests() {
    const listContainer = document.getElementById('quests-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    // 1. Renderiza Missões Ativas (Em andamento)
    if (gameState.activeQuests && gameState.activeQuests.length > 0) {
        listContainer.innerHTML += `<h3 class="section-title">Missões em Andamento</h3>`;
        
        gameState.activeQuests.forEach(quest => {
            const progressPercent = ((quest.duration - quest.timeRemaining) / quest.duration) * 100;
            const cardHtml = `
                <div class="quest-card active-quest-card">
                    <div class="quest-header">
                        <h4>${quest.title}</h4>
                        <span class="quest-hero-tag">⚔️ ${quest.heroName}</span>
                    </div>
                    <div class="quest-progress-container">
                        <div class="quest-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <small class="quest-time">Tempo restante: ${Math.ceil(quest.timeRemaining)}s</small>
                </div>
            `;
            listContainer.innerHTML += cardHtml;
        });
    }

    // 2. Renderiza Mural de Missões Disponíveis
    listContainer.innerHTML += `<h3 class="section-title">Contratos Disponíveis</h3>`;

    availableQuestsList.forEach(quest => {
        // Encontra heróis disponíveis para realizar a missão
        const availableHeroes = gameState.adventurers.filter(h => h.status === 'available');
        
        let selectOptions = `<option value="">Selecione um Herói...</option>`;
        availableHeroes.forEach(h => {
            selectOptions += `<option value="${h.id}">${h.name} (Nv. ${h.level})</option>`;
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
                        onclick="handleStartQuestClick('${quest.id}')">
                        Enviar
                    </button>
                </div>
            </div>
        `;
        listContainer.innerHTML += questCardHtml;
    });
}

// Auxiliar para pegar o id do herói selecionado na combobox
function handleStartQuestClick(questId) {
    const selectElem = document.getElementById(`select-hero-${questId}`);
    if (!selectElem || !selectElem.value) {
        alert("Por favor, selecione um herói disponível!");
        return;
    }
    startQuest(questId, selectElem.value);
}
