// js/ui.js - Responsável pela renderização de elementos visuais no HTML

// Atualiza contadores do topo da tela
function updateUI() {
    document.getElementById('gold-display').innerText = Math.floor(gameState.gold); // Exibe o ouro sem casas decimais
    document.getElementById('prestige-display').innerText = gameState.prestige; // Exibe o prestígio
    document.getElementById('members-display').innerText = `${gameState.adventurers.length} / ${gameState.maxMembers}`; // Exibe membros/limite
}

// Troca de aba visível
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content'); // Seleciona todas as seções de abas
    tabs.forEach(tab => tab.classList.remove('active')); // Oculta todas

    const buttons = document.querySelectorAll('.nav-btn'); // Seleciona todos os botões do menu
    buttons.forEach(btn => btn.classList.remove('active')); // Desmarca todos

    const activeTab = document.getElementById(`tab-${tabName}`); // Pega a aba desejada pelo ID
    if (activeTab) activeTab.classList.add('active'); // Torna a aba visível

    // Encontra o botão correspondente e adiciona a classe ativa
    const clickedBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick').includes(tabName));
    if (clickedBtn) clickedBtn.classList.add('active');

    // Executa a renderização do conteúdo da aba aberta
    if (tabName === 'aventureiros') {
        renderAdventurers();
    } else if (tabName === 'missoes') {
        renderQuests();
    }
}

// Renderiza os cards dos aventureiros
function renderAdventurers() {
    const listContainer = document.getElementById('adventurers-list'); // Obtém o container no HTML
    if (!listContainer) return;

    listContainer.innerHTML = ''; // Limpa o conteúdo atual

    if (gameState.adventurers.length === 0) {
        listContainer.innerHTML = '<p class="empty-msg">Nenhum aventureiro contratado ainda.</p>';
        return;
    }

    // Percorre cada herói para gerar o card
    gameState.adventurers.forEach(hero => {
        let statusBadge = ''; // Prepara a tag de status
        if (hero.status === 'available') {
            statusBadge = '<span class="badge available">Pronto</span>';
        } else if (hero.status === 'on_quest') {
            statusBadge = '<span class="badge on-quest">Em Missão</span>';
        } else if (hero.status === 'injured') {
            statusBadge = `<span class="badge injured">Ferido (${Math.ceil(hero.injuryTimer)}s)</span>`;
        }

        // Monta o HTML do card do herói
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
        listContainer.innerHTML += cardHtml; // Insere o card na tela
    });
}

// Renderiza a estrutura da tela de Missões (chamado apenas ao trocar de aba ou enviar missão)
function renderQuests() {
    const listContainer = document.getElementById('quests-list'); // Obtém o container no HTML
    if (!listContainer) return;

    listContainer.innerHTML = ''; // Limpa o container

    // 1. ÁREA DE MISSÕES EM ANDAMENTO
    if (gameState.activeQuests && gameState.activeQuests.length > 0) {
        listContainer.innerHTML += `<h3 class="section-title">Missões em Andamento</h3>`;
        
        gameState.activeQuests.forEach(quest => {
            const progressPercent = ((quest.duration - quest.timeRemaining) / quest.duration) * 100; // Porcentagem do tempo
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
            listContainer.innerHTML += cardHtml; // Adiciona card em andamento
        });
    }

    // 2. MURAL DE CONTRATOS DISPONÍVEIS
    listContainer.innerHTML += `<h3 class="section-title">Contratos Disponíveis</h3>`;

    availableQuestsList.forEach(quest => {
        // Filtra aventureiros com status 'available'
        const availableHeroes = gameState.adventurers.filter(h => h.status === 'available');
        
        // Constrói as opções da caixa de seleção
        let selectOptions = `<option value="">Selecione um Herói...</option>`;
        availableHeroes.forEach(h => {
            selectOptions += `<option value="${h.id}">${h.name} (Nv. ${h.level})</option>`;
        });

        const isHeroAvailable = availableHeroes.length > 0; // Verifica se há alguém livre

        // Monta o HTML do contrato
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
        listContainer.innerHTML += questCardHtml; // Insere o contrato na tela
    });
}

// Atualiza APENAS as barras de progresso das missões ativas em tempo real (Sem piscar/fechar o menu)
function updateActiveQuestsUI() {
    if (!gameState.activeQuests) return;

    gameState.activeQuests.forEach(quest => {
        const fillElem = document.getElementById(`progress-fill-${quest.id}`); // Pega a barra de progresso
        const timeElem = document.getElementById(`quest-time-${quest.id}`); // Pega o texto do tempo

        if (fillElem && timeElem) {
            const progressPercent = ((quest.duration - quest.timeRemaining) / quest.duration) * 100; // Calcula %
            fillElem.style.width = `${progressPercent}%`; // Atualiza a largura da barra
            timeElem.innerText = `Tempo restante: ${Math.ceil(quest.timeRemaining)}s`; // Atualiza o texto do tempo
        }
    });
}

// Trata o clique no botão "Enviar" pegando o valor da seleção
function handleStartQuestClick(questId) {
    const selectElem = document.getElementById(`select-hero-${questId}`); // Localiza o <select>
    if (!selectElem || !selectElem.value) {
        alert("Por favor, selecione um herói disponível!");
        return;
    }
    startQuest(questId, selectElem.value); // Inicia a missão com o herói escolhido
}
