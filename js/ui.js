// js/ui.js - Responsável por desenhar todos os elementos visuais da interface

// Atualiza contadores numéricos do topo da tela
function updateUI() {
    const goldElem = document.getElementById('gold-display');
    const prestigeElem = document.getElementById('prestige-display');
    const membersElem = document.getElementById('members-display');

    if (goldElem) goldElem.innerText = Math.floor(gameState.gold);
    if (prestigeElem) prestigeElem.innerText = gameState.prestige;
    if (membersElem) membersElem.innerText = `${gameState.adventurers.length} / ${gameState.maxMembers}`;
}

// Alterna a exibição das abas
function switchTab(tabName) {
    console.log("Alternando para a aba:", tabName);

    // 1. Esconde todas as abas
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // 2. Desmarca todos os botões do menu
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 3. Mostra a aba clicada
    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
        activeTab.classList.add('active');
    } else {
        console.error(`Aba #tab-${tabName} não foi encontrada no HTML!`);
    }

    // 4. Marca o botão selecionado
    const clickedBtn = Array.from(buttons).find(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        return onclickAttr && onclickAttr.includes(tabName);
    });
    if (clickedBtn) clickedBtn.classList.add('active');

    // 5. Executa a função de renderização da aba correspondente
    if (tabName === 'aventureiros') {
        renderAdventurers();
    } else if (tabName === 'missoes') {
        renderQuests();
    } else if (tabName === 'construcoes') {
        if (typeof renderBuildings === 'function') {
            renderBuildings();
        } else {
            console.error("A função renderBuildings() não existe! Verifique se o js/buildings.js foi carregado corretamente.");
        }
    }
}

// Renderiza os heróis e a área de recrutamento
function renderAdventurers() {
    const listContainer = document.getElementById('adventurers-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    // Painel da Taverna de Recrutamento
    const recruitPanelHtml = `
        <div class="recruit-panel">
            <h3>Taverna de Recrutamento</h3>
            <p>Contrate novos aventureiros para a guilda (Custo: 40 Ouro):</p>
            <div class="recruit-buttons">
                <button class="action-btn" onclick="hireAdventurer('Guerreiro', 40)">🛡️ Guerreiro</button>
                <button class="action-btn" onclick="hireAdventurer('Mago', 40)">🔮 Mago</button>
                <button class="action-btn" onclick="hireAdventurer('Padre', 40)">✨ Padre</button>
                <button class="action-btn" onclick="hireAdventurer('Arqueiro', 40)">🏹 Arqueiro</button>
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

// Renderiza o mural de contratos de missões
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
                        onclick="handleStartQuestClick('${quest.id}')">
                        Enviar
                    </button>
                </div>
            </div>
        `;
        listContainer.innerHTML += questCardHtml;
    });
}

// Atualiza dinamicamente as barras de progresso sem reconstruir a tela
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

// Trata a seleção do herói ao clicar em enviar missão
function handleStartQuestClick(questId) {
    const selectElem = document.getElementById(`select-hero-${questId}`);
    if (!selectElem || !selectElem.value) {
        alert("Por favor, selecione um herói disponível!");
        return;
    }
    startQuest(questId, selectElem.value);
}

// Renderiza os prédios e melhorias na aba Construções
function renderBuildings() {
    const listContainer = document.getElementById('buildings-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (typeof availableBuildings === 'undefined') {
        listContainer.innerHTML = '<p class="empty-msg">Erro: Lista de construções não carregada.</p>';
        return;
    }

    availableBuildings.forEach(building => {
        const cost = Math.floor(building.baseCost * Math.pow(building.costMultiplier, building.level));

        const cardHtml = `
            <div class="building-card">
                <div class="building-header">
                    <h3>${building.name} <small>Nível ${building.level}</small></h3>
                </div>
                <p class="building-desc">${building.description}</p>
                <div class="building-action">
                    <button class="action-btn" onclick="upgradeBuilding('${building.id}')">
                        Evoluir (🪙 ${cost} Ouro)
                    </button>
                </div>
            </div>
        `;
        listContainer.innerHTML += cardHtml;
    });
}
