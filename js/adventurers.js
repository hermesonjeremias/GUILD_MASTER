/* ==========================================================================
   ADVENTURERS.JS - RECRUTAMENTO E TRATAMENTO DE HERÓIS
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
    const infirmaryLevel = getBuildingLevel('infirmary');
    const timeSpeedup = 1 + (infirmaryLevel * 0.25);
    const trainingLevel = getBuildingLevel('training_hall');

    if (!Array.isArray(gameState.adventurers)) return;

    gameState.adventurers.forEach(hero => {
        if (hero.status === "injured") {
            hero.injuryTimer -= (deltaSeconds * timeSpeedup);
            if (hero.injuryTimer <= 0) {
                hero.injuryTimer = 0;
                hero.status = "available";
                if (typeof renderAdventurers === 'function') renderAdventurers();
            }
        }

        if (hero.status === "available" && trainingLevel > 0) {
            if (typeof hero.gainXp === 'function') {
                hero.gainXp(trainingLevel * deltaSeconds);
            }
        }
    });
}

function calculateGoldPerSecond() {
    const contractBoardLevel = getBuildingLevel('contract_board');
    if (contractBoardLevel <= 0 || !Array.isArray(gameState.adventurers)) return 0;

    const totalPower = gameState.adventurers.reduce((sum, hero) => {
        const power = (hero && hero.stats && typeof hero.stats.power === 'number') ? hero.stats.power : 10;
        return sum + power;
    }, 0);

    return totalPower * contractBoardLevel * 0.2;
}
