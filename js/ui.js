/* ==========================================================================
   UI.JS - MANIPULAÇÃO E ATUALIZAÇÃO DA INTERFACE DO USUÁRIO
   ========================================================================== */

function updateUI() {
    // Garante conversão numérica na exibição
    const goldDisplay = document.getElementById("gold-display");
    if (goldDisplay) {
        const goldVal = Number(gameState.gold) || 0;
        goldDisplay.textContent = Math.floor(goldVal).toLocaleString();
    }

    const prestigeDisplay = document.getElementById("prestige-display");
    if (prestigeDisplay) {
        prestigeDisplay.textContent = Math.floor(Number(gameState.prestige) || 0);
    }

    const membersDisplay = document.getElementById("members-display");
    if (membersDisplay) {
        const count = Array.isArray(gameState.adventurers) ? gameState.adventurers.length : 0;
        membersDisplay.textContent = `${count}/${gameState.maxMembers || 4}`;
    }

    const gpsDisplay = document.getElementById("gps-display");
    if (gpsDisplay && typeof calculateGoldPerSecond === 'function') {
        const gps = calculateGoldPerSecond();
        gpsDisplay.textContent = gps.toFixed(1);
    }
}

function renderQuests() {
    const container = document.getElementById("quests-container");
    if (!container) return;

    container.innerHTML = "";

    if (typeof availableQuestsList === 'undefined' || !Array.isArray(availableQuestsList)) return;

    availableQuestsList.forEach(quest => {
        const card = document.createElement("div");
        card.className = "quest-card";

        // Busca heróis realmente disponíveis
        const availableHeroes = gameState.adventurers.filter(h => h.status === "available");

        let selectHTML = "";
        if (availableHeroes.length > 0) {
            selectHTML = `<select id="select-hero-${quest.id}" class="hero-select">
                ${availableHeroes.map(h => `<option value="${h.id}">${h.name} (${h.heroClass})</option>`).join('')}
            </select>`;
        } else {
            selectHTML = `<select class="hero-select" disabled><option>Nenhum herói disponível</option></select>`;
        }

        const btnDisabled = availableHeroes.length === 0 ? "disabled" : "";

        card.innerHTML = `
            <h3>${quest.title}</h3>
            <p>${quest.description}</p>
            <div class="quest-details">
                <span>⏱️ ${quest.duration}s</span>
                <span>🪙 +${quest.goldReward}</span>
                <span>⭐ +${quest.xpReward} XP</span>
            </div>
            <div class="quest-actions">
                ${selectHTML}
                <button class="btn-primary" ${btnDisabled} onclick="handleStartQuestClick('${quest.id}')">Iniciar</button>
            </div>
        `;

        container.appendChild(card);
    });
}

/**
 * Captura o clique no botão de iniciar missão e pega o ID do herói selecionado
 */
function handleStartQuestClick(questId) {
    const selectElem = document.getElementById(`select-hero-${questId}`);
    if (!selectElem || !selectElem.value) return;

    const selectedHeroId = selectElem.value;
    if (typeof startQuest === 'function') {
        startQuest(questId, selectedHeroId);
    }
}

function renderAdventurers() {
    const container = document.getElementById("adventurers-container");
    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(gameState.adventurers)) return;

    gameState.adventurers.forEach(hero => {
        const card = document.createElement("div");
        card.className = `hero-card status-${hero.status}`;

        let statusText = "Disponível";
        if (hero.status === "on_quest") statusText = "Em Missão";
        if (hero.status === "injured") statusText = `Ferido (${Math.ceil(hero.injuryTimer || 0)}s)`;

        card.innerHTML = `
            <h4>${hero.name}</h4>
            <p>Classe: ${hero.heroClass} | Nível: ${hero.level || 1}</p>
            <p>Poder: ${hero.stats ? hero.stats.power : 10}</p>
            <p class="status-badge status-${hero.status}">${statusText}</p>
        `;

        container.appendChild(card);
    });
}

function updateActiveQuestsUI() {
    const container = document.getElementById("active-quests-container");
    if (!container) return;

    if (!Array.isArray(gameState.activeQuests) || gameState.activeQuests.length === 0) {
        container.innerHTML = "<p>Nenhuma missão em andamento.</p>";
        return;
    }

    container.innerHTML = gameState.activeQuests.map(q => `
        <div class="active-quest-item">
            <span><strong>${q.title}</strong> (${q.heroName})</span>
            <span>⏱️ ${Math.max(0, Math.ceil(q.timeRemaining))}s</span>
        </div>
    `).join('');
}

function triggerErrorEffect(element) {
    if (!element) return;
    element.classList.add("shake-error");
    setTimeout(() => element.classList.remove("shake-error"), 500);
}
