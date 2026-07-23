// js/ui.js - Responsável por desenhar todos os elementos visuais da interface

// Atualiza contadores numéricos do topo da tela
function updateUI() {
    document.getElementById('gold-display').innerText = Math.floor(gameState.gold); // Exibe o ouro atual
    document.getElementById('prestige-display').innerText = gameState.prestige; // Exibe o prestígio
    document.getElementById('members-display').innerText = `${gameState.adventurers.length} / ${gameState.maxMembers}`; // Exibe quantidade de membros/limite
}

// Alterna a exibição das abas
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content'); // Seleciona todas as seções de abas
    tabs.forEach(tab => tab.classList.remove('active')); // Oculta todas

    const buttons = document.querySelectorAll('.nav-btn'); // Seleciona todos os botões
    buttons.forEach(btn => btn.classList.remove('active')); // Desmarca todos

    const activeTab = document.getElementById(`tab-${tabName}`); // Pega a aba selecionada
    if (activeTab) activeTab.classList.add('active'); // Torna a aba visível

    const clickedBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick').includes(tabName));
    if (clickedBtn) clickedBtn.classList.add('active'); // Destaca o botão do menu

    // Executa a função de desenho correspondente à aba aberta
    if (tabName === 'aventureiros') {
        renderAdventurers();
    } else if (tabName === 'missoes') {
        renderQuests();
    } else if (tabName === 'construcoes') {
        renderBuildings();
    }
}

// Renderiza os heróis e a área de recrutamento
function renderAdventurers() {
    const listContainer = document.getElementById('adventurers-list'); // Localiza o contêiner
    if (!listContainer) return;

    listContainer.innerHTML = ''; // Limpa o conteúdo

    // HTML do painel da Taverna de Recrutamento
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
    listContainer.innerHTML = recruitPanelHtml; // Insere o painel no início da lista

    if (gameState.adventurers.length === 0) {
        listContainer.innerHTML += '<p class="empty-msg">Nenhum aventureiro contratado ainda.</p>';
        return;
    }

    // Desenha o card individual de cada herói
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
        listContainer.innerHTML += cardHtml; // Adiciona o card do herói
    });
}

// Renderiza o mural de contratos de missões
function renderQuests() {
    const listContainer = document.getElementById('quests-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    // 1. Renderiza missões ativas em andamento
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

    // 2. Renderiza contratos disponíveis para contratação
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

// Renderiza os prédios e melhorias da guilda na aba Construções
function renderBuildings() {
    const listContainer = document.getElementById('buildings-list'); // Pega o contêiner
    if (!listContainer) return;

    listContainer.innerHTML = ''; // Limpa o contêiner

    // Percorre cada construção disponível na lista
    availableBuildings.forEach(building => {
        // Calcula o custo com base na fórmula exponencial do nível
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
        listContainer.innerHTML += cardHtml; // Insere o card da construção
    });
}
