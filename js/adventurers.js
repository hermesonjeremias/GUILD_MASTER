/* ==========================================================================
   ADVENTURERS.JS - RECRUTAMENTO E LÓGICA PASSIVA
   ========================================================================== */

function recruitAldric() {
    const hasAldric = gameState.adventurers.some(hero => hero.id === "aldric_1");
    if (!hasAldric) {
        const aldric = new Hero("aldric_1", "Aldric", "Guerreiro");
        gameState.adventurers.push(aldric);
    }
}

const recruitNames = ["Gideon", "Lyra", "Eldrin", "Valerie", "Kaelen", "Soren", "Thorne", "Aria"];

function hireAdventurer(heroClass, cost, event) {
    if (gameState.gold < cost || gameState.adventurers.length >= gameState.maxMembers) {
        if (event && event.currentTarget) triggerErrorEffect(event.currentTarget);
        return;
    }

    const randomName = recruitNames[Math.floor(Math.random() * recruitNames.length)];
    const uniqueId = `hero_${Date.now()}`;

    gameState.gold -= cost;

    const newHero = new Hero(uniqueId, randomName, heroClass);
    gameState.adventurers.push(newHero);

    if (typeof saveGame === 'function') saveGame();
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderAdventurers === 'function') renderAdventurers();
}

function healHero(heroId, cost = 15, event) {
    const hero = gameState.adventurers.find(h => h.id === heroId);
    if (!hero) return;

    if (gameState.gold < cost) {
        if (event && event.currentTarget) triggerErrorEffect(event.currentTarget);
        return;
    }

    gameState.gold -= cost;
    hero.status = "available";
    hero.injuryTimer = 0;

    if (typeof saveGame === 'function') saveGame();
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderAdventurers === 'function') renderAdventurers();
}

function updateAdventurersTimers(deltaSeconds) {
    const infirmaryLevel = typeof getBuildingLevel === 'function' ? getBuildingLevel('infirmary') : 0;
    const timeSpeedup = 1 + (infirmaryLevel * 0.25);
    const trainingLevel = typeof getBuildingLevel === 'function' ? getBuildingLevel('training_hall') : 0;

    if (!Array.isArray(gameState.adventurers)) return;

    let shouldRender = false;

    gameState.adventurers.forEach(hero => {
        // Redução do tempo de cura
        if (hero.status === "injured") {
            hero.injuryTimer -= (deltaSeconds * timeSpeedup);
            if (hero.injuryTimer <= 0) {
                hero.injuryTimer = 0;
                hero.status = "available";
                shouldRender = true;
            }
        }

        // XP Passivo do Centro de Treinamento
        if (hero.status === "available" && trainingLevel > 0) {
            // Cada nível do Centro de Treinamento dá 1 XP/s por herói
            const xpGained = trainingLevel * deltaSeconds;
            if (typeof hero.gainXp === 'function') {
                hero.gainXp(xpGained);
                shouldRender = true;
            }
        }
    });

    // Atualiza a tela de heróis se estiver na aba Aventureiros
    if (shouldRender) {
        const activeTab = document.getElementById('tab-aventureiros');
        if (activeTab && activeTab.classList.contains('active') && typeof renderAdventurers === 'function') {
            renderAdventurers();
        }
    }
}

function calculateGoldPerSecond() {
    const contractBoardLevel = typeof getBuildingLevel === 'function' ? getBuildingLevel('contract_board') : 0;
    if (contractBoardLevel <= 0 || !Array.isArray(gameState.adventurers)) return 0;

    const totalPower = gameState.adventurers.reduce((sum, hero) => {
        const power = (hero && hero.stats && typeof hero.stats.power === 'number') ? hero.stats.power : 10;
        return sum + power;
    }, 0);

    return totalPower * contractBoardLevel * 0.2;
}
