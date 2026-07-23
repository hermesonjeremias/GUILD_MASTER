/* ==========================================================================
   ADVENTURERS.JS - RECRUTAMENTO, HERÓIS E ATUALIZAÇÃO PASSIVA
   ========================================================================== */

/**
 * Garante que o herói inicial Aldric seja recrutado no primeiro início do jogo.
 */
function recruitAldric() {
    const hasAldric = gameState.adventurers.some(hero => hero.id === "aldric_1");
    if (!hasAldric) {
        const aldric = new Hero("aldric_1", "Aldric", "Guerreiro");
        gameState.adventurers.push(aldric);
    }
}

// Lista de nomes aleatórios para novos recrutas
const recruitNames = ["Gideon", "Lyra", "Eldrin", "Valerie", "Kaelen", "Soren", "Thorne", "Aria"];

/**
 * Contrata um novo aventureiro para a guilda.
 * @param {string} heroClass - Classe do aventureiro ('Guerreiro', 'Mago', 'Padre', 'Arqueiro')
 * @param {number} cost - Custo em ouro do recrutamento
 * @param {Event} event - Evento de clique para feedback de erro
 */
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

/**
 * Permite curar instantaneamente um herói ferido pagando uma quantia em ouro.
 * @param {string} heroId - ID do herói
 * @param {number} cost - Custo da cura
 * @param {Event} event - Evento de clique
 */
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

/**
 * Atualiza o temporizador de ferimentos e concede XP passivo do Centro de Treinamento.
 * @param {number} deltaSeconds - Tempo em segundos decorrido no frame do jogo
 */
function updateAdventurersTimers(deltaSeconds) {
    const infirmaryLevel = typeof getBuildingLevel === 'function' ? getBuildingLevel('infirmary') : 0;
    const timeSpeedup = 1 + (infirmaryLevel * 0.25);

    const trainingLevel = typeof getBuildingLevel === 'function' ? getBuildingLevel('training_hall') : 0;

    gameState.adventurers.forEach(hero => {
        // Redução do tempo de cura
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
            if (typeof hero.gainXp === 'function') {
                hero.gainXp(xpGained);
            }
        }
    });
}

/**
 * Calcula a renda passiva de ouro gerada por segundo (Gold/s) com base no Mural de Contratos.
 * @returns {number} Ouro por segundo gerado
 */
function calculateGoldPerSecond() {
    const contractBoardLevel = typeof getBuildingLevel === 'function' ? getBuildingLevel('contract_board') : 0;
    if (contractBoardLevel === 0) return 0;

    // Soma o poder de todos os heróis da guilda com validação
    const totalPower = gameState.adventurers.reduce((sum, hero) => {
        const power = (hero.stats && typeof hero.stats.power === 'number') ? hero.stats.power : 10;
        return sum + power;
    }, 0);
    
    // Cada nível do Mural gera 20% do Poder em Ouro por segundo
    return totalPower * contractBoardLevel * 0.2;
}
