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

    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.currentTarget.classList.add('active');

    // Se mudou para a aba aventureiros, atualiza a lista visualmente
    if (tabName === 'aventureiros') {
        renderAdventurers();
    }
}

// Renderiza os heróis contratados na tela de Aventureiros
function renderAdventurers() {
    const listContainer = document.getElementById('adventurers-list');
    listContainer.innerHTML = ''; // Limpa a lista antes de desenhar

    if (gameState.adventurers.length === 0) {
        listContainer.innerHTML = '<p class="empty-msg">Nenhum aventureiro contratado ainda.</p>';
        return;
    }

    gameState.adventurers.forEach(hero => {
        // Define texto e cor da tag de status
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
