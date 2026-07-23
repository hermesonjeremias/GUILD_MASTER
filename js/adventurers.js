// js/adventurers.js - Cuida do recrutamento e atualização dos heróis

function recruitAldric() {
    const hasAldric = gameState.adventurers.some(hero => hero.id === "aldric_1");
    if (!hasAldric) {
        const aldric = new Hero("aldric_1", "Aldric", "Guerreiro");
        gameState.adventurers.push(aldric);
    }
}

const recruitNames = ["Gideon", "Lyra", "Eldrin", "Valerie", "Kaelen", "Soren", "Thorne", "Aria"];

function hireAdventurer(heroClass, cost, event) {
    if (gameState.gold < cost) {
        if (event && event.currentTarget) triggerErrorEffect(event.currentTarget);
        return;
    }

    if (gameState.adventurers.length >= gameState.maxMembers) {
        if (event && event.currentTarget) triggerErrorEffect(event.currentTarget);
        return;
    }

    const randomName = recruitNames[Math.floor(Math.random() * recruitNames.length)];
    const uniqueId = `hero_${Date.now()}`;

    gameState.gold -= cost;

    const newHero = new Hero(uniqueId, randomName, heroClass);
    gameState.adventurers.push(newHero);

    if (typeof saveGame === 'function') saveGame();
    updateUI();
    renderAdventurers();
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
    updateUI();
    renderAdventurers();
}

// Atualiza o tempo de recuperação e ganho de XP passivo
function updateAdventurersTimers(deltaSeconds) {
    const infirmaryLevel = typeof getBuildingLevel === 'function' ? getBuildingLevel('infirmary') : 0;
    // Cada nível da enfermaria faz o tempo passar 25% mais rápido
    const timeSpeedup = 1 + (infirmaryLevel * 0.25);

    const trainingLevel = typeof getBuildingLevel === 'function' ? getBuildingLevel('training_hall') : 0;

    gameState.adventurers.forEach(hero => {
        // Redução do tempo de ferida
        if (hero.status === "injured") {
            hero.injuryTimer -= (deltaSeconds * timeSpeedup);
            if (hero.injuryTimer <= 0) {
                hero.injuryTimer = 0;
                hero.status = "available";
                renderAdventurers();
            }
        }

        // XP Passivo do Centro de Treinamento
        if (hero.status === "available" && trainingLevel > 0) {
            const xpGained = trainingLevel * deltaSeconds;
            hero.gainXp(xpGained);
        }
    });
}

// Calcula o Ouro gerado por segundo com base no Poder Total dos aventureiros
function calculateGoldPerSecond() {
    const contractBoardLevel = typeof getBuildingLevel === 'function' ? getBuildingLevel('contract_board') : 0;
    if (contractBoardLevel === 0) return 0;

    // Soma o poder de todos os heróis da guilda
    const totalPower = gameState.adventurers.reduce((sum, hero) => sum + (hero.stats.power || 0), 0);
    
    // Cada nível do Mural gera 20% do Poder em Ouro por segundo (ex: 50 Poder * Lvl 1 * 0.2 = 10 Ouro/s)
    return totalPower * contractBoardLevel * 0.2;
}
