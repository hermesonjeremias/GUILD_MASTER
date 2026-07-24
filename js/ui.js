/* ==========================================================================
   UI.JS - RENDERIZAÇÃO E INTERAÇÃO COM A TELA
   ========================================================================== */

function triggerErrorEffect(element) {
    if (!element) return;
    element.classList.add('btn-error-shake');
    setTimeout(() => element.classList.remove('btn-error-shake'), 400);
}

function updateUI() {
    const goldElem = document.getElementById('gold-display');
    const prestigeElem = document.getElementById('prestige-display');
    const membersElem = document.getElementById('members-display');
    const gpsElem = document.getElementById('gps-display');

    const currentGold = Number(gameState.gold) || 0;
    const gps = typeof calculateGoldPerSecond === 'function' ? calculateGoldPerSecond() : 0;

    if (goldElem) goldElem.innerText = Math.floor(currentGold).toLocaleString();
    if (gpsElem) gpsElem.innerText = gps.toFixed(1);
    if (prestigeElem) prestigeElem.innerText = gameState.prestige;
    if (membersElem) membersElem.innerText = `${gameState.adventurers.length}/${gameState.maxMembers}`;
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) activeTab.classList.add('active');

    if (event && event.currentTarget) event.currentTarget.classList.add('active');

    if (tabName === 'aventureiros') renderAdventurers();
    if (tabName === 'missoes') renderQuests();
    if (tabName === 'construcoes') renderBuildings();
}

function renderAdventurers() {
    const container = document.getElementById('adventurers-container');
    if (!container) return;

    const recruitCost = 40;
    let html = `
        <div class="recruit-panel">
            <h3>Taverna de Recrutamento</h3>
            <p>Contrate novos aventureiros (Custo: 🪙 ${recruitCost} Ouro)</p>
            <div class="recruit-buttons">
                <button class="action-btn" onclick="hireAdventurer('Guerreiro', ${recruitCost}, event)">🛡️ Guerreiro</button>
                <button class="action-btn" onclick="hireAdventurer('Mago', ${recruitCost}, event)">🔮 Mago</button>
                <button class="action-btn" onclick="hireAdventurer('Padre', ${recruitCost}, event)">✨ Padre</button>
                <button class="action-btn" onclick="hireAdventurer('Arqueiro', ${recruitCost}, event)">🏹 Arqueiro</button>
            </div>
        </div>
        <hr>
        <div class="adventurers-list">
    `;

    gameState.adventurers.forEach(hero => {
        let statusBadge = '<span class="badge available">Pronto</span>';
        let healBtn = '';

        if (hero.status === 'on_quest') {
            statusBadge = '<span class="badge on-quest">Em Missão</span>';
        } else if (hero.status === 'injured') {
            statusBadge = `<span class="badge injured">Ferido (${Math.ceil(hero.injuryTimer)}s)</span>`;
            healBtn = `<button class="action-btn" onclick="healHero('${hero.id}', 15, event)">🧪 Curar (🪙 15)</button>`;
        }

        html += `
            <div class="hero-card">
                <div class="hero-header">
                    <h4>${hero.name} <small>(Nv. ${hero.level} ${hero.heroClass})</small></h4>
                    ${statusBadge}
                </div>
                <div class="hero-stats">
                    <span>⚔️ Poder: ${hero.stats.power}</span>
                    <span>🛡️ Defesa: ${hero.stats.defense}</span>
                </div>
                <div class="xp-container">
                    <small>XP: ${Math.floor(hero.xp)} / ${hero.maxXp}</small>
                </div>
                ${healBtn}
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function renderQuests() {
    const container = document.getElementById('quests-container');
    if (!container) return;

    let html = '';
    const availableHeroes = gameState.adventurers.filter(h => h.status === 'available');

    availableQuestsList.forEach(quest => {
        let selectOptions = availableHeroes.length > 0 
            ? availableHeroes.map(h => `<option value="${h.id}">${h.name} (Nv. ${h.level})</option>`).join('')
            : '<option value="">Nenhum herói disponível</option>';

        const disabled = availableHeroes.length === 0 ? 'disabled' : '';

        html += `
            <div class="quest-card">
                <h4>${quest.title} <small>⏳ ${quest.duration}s</small></h4>
                <p>${quest.description}</p>
                <div class="rewards">
                    <span>🪙 +${quest.goldReward}</span>
                    <span>⭐ +${quest.xpReward} XP</span>
                </div>
                <div class="quest-actions">
                    <select id="select-hero-${quest.id}" ${disabled}>${selectOptions}</select>
                    <button class="action-btn" ${disabled} onclick="handleStartQuestClick('${quest.id}')">Enviar</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function handleStartQuestClick(questId) {
    const select = document.getElementById(`select-hero-${questId}`);
    if (select && select.value) {
        startQuest(questId, select.value);
    }
}

function updateActiveQuestsUI() {
    const container = document.getElementById('active-quests-container');
    if (!container) return;

    if (!gameState.activeQuests || gameState.activeQuests.length === 0) {
        container.innerHTML = '<p class="empty-msg">Nenhuma missão em andamento.</p>';
        return;
    }

    container.innerHTML = '<h3>Missões em Andamento</h3>' + gameState.activeQuests.map(q => `
        <div class="active-quest-item">
            <span>⚔️ <strong>${q.heroName}</strong> em "${q.title}"</span>
            <span>⏳ ${Math.ceil(q.timeRemaining)}s restante</span>
        </div>
    `).join('');
}

function renderBuildings() {
    const container = document.getElementById('buildings-container');
    if (!container) return;

    let html = '';
    availableBuildings.forEach(b => {
        const cost = Math.floor(b.baseCost * Math.pow(b.costMultiplier, b.level));
        html += `
            <div class="building-card">
                <h4>${b.name} <small>(Nível ${b.level})</small></h4>
                <p>${b.description}</p>
                <button class="action-btn" onclick="upgradeBuilding('${b.id}', event)">
                    ${b.level === 0 ? 'Construir' : 'Evoluir'} (🪙 ${cost})
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
}
