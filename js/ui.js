/* ==========================================================================
   UI.JS - GERENCIADOR DE INTERFACE DO USUÁRIO
   ========================================================================== */

/**
 * Efeito visual de erro: Faz o elemento tremer e piscar com borda vermelha
 * quando o jogador tenta realizar uma ação sem ter Gold suficiente.
 * @param {HTMLElement} element - O botão ou card clicado
 */
function triggerErrorEffect(element) {
    if (!element) return;
    element.classList.add('btn-error-shake');
    setTimeout(() => {
        element.classList.remove('btn-error-shake');
    }, 400);
}

/**
 * Controla a alternância entre as abas do jogo (Aventureiros, Missões, Construções).
 * @param {string} tabName - Nome do ID da aba a ser exibida ('adventurers', 'quests', 'buildings')
 */
function switchTab(tabName) {
    // Esconde todo o conteúdo de abas e desativa os botões de navegação
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    // Ativa a aba e o botão correspondente selecionado
    const selectedTab = document.getElementById(`tab-${tabName}`);
    const selectedBtn = document.getElementById(`btn-tab-${tabName}`);

    if (selectedTab) selectedTab.classList.add('active');
    if (selectedBtn) selectedBtn.classList.add('active');

    // Garante que a interface atualize ao mudar de aba
    updateUI();
}

/**
 * Função principal de atualização de interface.
 * Atualiza os recursos no topo e re-renderiza os componentes ativos.
 */
function updateUI() {
    // 1. Atualiza os recursos da barra superior
    const goldDisplay = document.getElementById('gold-value');
    if (goldDisplay && typeof gameData !== 'undefined') {
        goldDisplay.innerText = gameData.resources.gold;
    }

    // 2. Renderiza as seções dinâmicas
    renderTavern();
    renderAdventurers();
    renderQuests();
    renderBuildings();
}

/* ==========================================================================
   RENDERIZADORES DE SEÇÃO
   ========================================================================== */

/**
 * Renderiza os botões de recrutamento da Taverna na aba de Aventureiros.
 * Aplica visual escuro (.unaffordable) caso o jogador não tenha Gold suficiente.
 */
function renderTavern() {
    const tavernContainer = document.getElementById('tavern-buttons');
    if (!tavernContainer || typeof HERO_CLASSES === 'undefined') return;

    let html = '';

    for (const [classKey, heroClass] of Object.entries(HERO_CLASSES)) {
        const canAfford = gameData.resources.gold >= heroClass.cost;
        const btnClass = canAfford ? '' : 'unaffordable';

        html += `
            <button class="action-btn ${btnClass}" onclick="handleRecruitHero('${classKey}', event)">
                ${heroClass.icon} ${heroClass.name} (${heroClass.cost} Gold)
            </button>
        `;
    }

    tavernContainer.innerHTML = html;
}

/**
 * Manipulador para a tentativa de recrutamento de heróis na Taverna.
 */
function handleRecruitHero(classKey, event) {
    const heroClass = HERO_CLASSES[classKey];
    if (!heroClass) return;

    // Se não tiver Gold suficiente, pisca em vermelho sem exibir alertas
    if (gameData.resources.gold < heroClass.cost) {
        triggerErrorEffect(event.currentTarget);
        return;
    }

    // Executa a função lógica de recrutamento (presente no adventurers.js)
    if (typeof recruitHero === 'function') {
        recruitHero(classKey);
    }
}

/**
 * Renderiza a lista de aventureiros contratados na Guilda.
 */
function renderAdventurers() {
    const container = document.getElementById('adventurers-list');
    if (!container) return;

    if (!gameData.heroes || gameData.heroes.length === 0) {
        container.innerHTML = `<p class="empty-msg">Nenhum aventureiro contratado. Recrute um na Taverna acima!</p>`;
        return;
    }

    let html = '';
    gameData.heroes.forEach(hero => {
        // Mapeamento de badges de status
        let statusBadge = '<span class="badge available">Disponível</span>';
        if (hero.status === 'on-quest') statusBadge = '<span class="badge on-quest">Em Missão</span>';
        if (hero.status === 'injured') statusBadge = '<span class="badge injured">Ferido</span>';

        // Cálculo de progresso do XP
        const xpPercent = Math.min(100, Math.floor((hero.xp / hero.nextLevelXp) * 100));

        html += `
            <div class="hero-card">
                <div class="hero-header">
                    <h3>${hero.name} <small>Nv. ${hero.level} ${hero.className}</small></h3>
                    ${statusBadge}
                </div>
                <div class="hero-stats">
                    <span>⚔️ ATQ: ${hero.atk}</span>
                    <span>🛡️ DEF: ${hero.def}</span>
                    <span>❤️ HP: ${hero.currentHp}/${hero.maxHp}</span>
                </div>
                <div class="xp-bar-container" title="Experiência">
                    <div class="xp-bar-fill" style="width: ${xpPercent}%;"></div>
                </div>
                <div class="xp-text">XP: ${hero.xp} / ${hero.nextLevelXp}</div>
                ${
                    hero.status === 'injured' 
                    ? `<button class="action-btn heal-btn" onclick="handleHealHero(${hero.id})">Descansar / Curar</button>` 
                    : ''
                }
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Renderiza o mural de missões disponíveis e em andamento.
 */
function renderQuests() {
    const availableContainer = document.getElementById('quests-available');
    const activeContainer = document.getElementById('quests-active');

    if (!availableContainer || !activeContainer || typeof QUEST_LIST === 'undefined') return;

    // --- 1. MISSÕES DISPONÍVEIS ---
    let availableHtml = '';
    const availableHeroes = gameData.heroes.filter(h => h.status === 'available');

    QUEST_LIST.forEach(quest => {
        let selectOptions = `<option value="">Selecione um Herói...</option>`;
        availableHeroes.forEach(hero => {
            selectOptions += `<option value="${hero.id}">${hero.name} (Nv. ${hero.level} ${hero.className})</option>`;
        });

        const hasAvailableHeroes = availableHeroes.length > 0;

        availableHtml += `
            <div class="quest-card">
                <div class="quest-header">
                    <h4>${quest.title}</h4>
                    <span class="quest-duration">⏳ ${quest.duration}s</span>
                </div>
                <p class="quest-desc">${quest.description}</p>
                <div class="quest-rewards">
                    <span>💰 +${quest.rewardGold} Ouro</span>
                    <span>⭐ +${quest.rewardXp} XP</span>
                    <span class="risk-tag">⚠️ Risco: ${quest.risk}%</span>
                </div>
                <div class="quest-action">
                    <select id="select-quest-${quest.id}" ${!hasAvailableHeroes ? 'disabled' : ''}>
                        ${selectOptions}
                    </select>
                    <button class="action-btn" ${!hasAvailableHeroes ? 'disabled' : ''} onclick="handleStartQuest('${quest.id}')">
                        Enviar
                    </button>
                </div>
            </div>
        `;
    });

    availableContainer.innerHTML = availableHtml;

    // --- 2. MISSÕES ATIVAS / EM ANDAMENTO ---
    if (!gameData.activeQuests || gameData.activeQuests.length === 0) {
        activeContainer.innerHTML = `<p class="empty-msg">Nenhuma missão em andamento no momento.</p>`;
        return;
    }

    let activeHtml = '';
    gameData.activeQuests.forEach(active => {
        const questInfo = QUEST_LIST.find(q => q.id === active.questId);
        const heroInfo = gameData.heroes.find(h => h.id === active.heroId);

        if (!questInfo || !heroInfo) return;

        // Cálculo da porcentagem de conclusão
        const elapsed = (Date.now() - active.startTime) / 1000;
        const progressPercent = Math.min(100, Math.floor((elapsed / active.duration) * 100));
        const remainingSeconds = Math.max(0, Math.ceil(active.duration - elapsed));

        activeHtml += `
            <div class="quest-card active-quest-card">
                <div class="quest-header">
                    <h4>${questInfo.title}</h4>
                    <span class="quest-time">${remainingSeconds}s restantes</span>
                </div>
                <p class="quest-hero-tag">👤 Aventureiro: ${heroInfo.name}</p>
                <div class="quest-progress-container">
                    <div class="quest-progress-fill" style="width: ${progressPercent}%;"></div>
                </div>
            </div>
        `;
    });

    activeContainer.innerHTML = activeHtml;
}

/**
 * Dispara o início de uma missão a partir do seletor da UI.
 */
function handleStartQuest(questId) {
    const selectElem = document.getElementById(`select-quest-${questId}`);
    if (!selectElem) return;

    const heroId = parseInt(selectElem.value, 10);
    if (!heroId) {
        triggerErrorEffect(selectElem);
        return;
    }

    if (typeof startQuest === 'function') {
        startQuest(questId, heroId);
    }
}

/**
 * Renderiza a aba de construções e melhorias da guilda.
 */
function renderBuildings() {
    const container = document.getElementById('buildings-list');
    if (!container) return;

    const dorm = gameData.buildings.dormitory;
    const canAfford = gameData.resources.gold >= dorm.cost;
    const btnClass = canAfford ? '' : 'unaffordable';

    container.innerHTML = `
        <div class="building-card">
            <div class="building-header">
                <h3>🏠 Dormitório dos Aventureiros <small>(Nível ${dorm.level})</small></h3>
            </div>
            <p class="building-desc">Expande as acomodações para contratar mais aventureiros para sua guilda.</p>
            <p><strong>Capacidade Atual:</strong> ${dorm.maxHeroes} Aventureiros</p>
            <br>
            <button class="action-btn ${btnClass}" onclick="handleUpgradeBuilding('dormitory', event)">
                Evoluir para Nível ${dorm.level + 1} (${dorm.cost} Gold)
            </button>
        </div>
    `;
}

/**
 * Manipulador de melhoria de construções com tratamento visual de erro.
 */
function handleUpgradeBuilding(buildingKey, event) {
    const building = gameData.buildings[buildingKey];
    if (!building) return;

    if (gameData.resources.gold < building.cost) {
        triggerErrorEffect(event.currentTarget);
        return;
    }

    if (typeof upgradeBuilding === 'function') {
        upgradeBuilding(buildingKey);
    }
}
