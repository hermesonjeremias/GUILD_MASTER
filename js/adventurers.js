// js/adventurers.js - Cuida do recrutamento e atualização dos heróis

function recruitAldric() {
    const hasAldric = gameState.adventurers.some(hero => hero.id === "aldric_1");
    if (!hasAldric) {
        const aldric = new Hero("aldric_1", "Aldric", "Guerreiro");
        gameState.adventurers.push(aldric);
    }
}

const recruitNames = ["Gideon", "Lyra", "Eldrin", "Valerie", "Kaelen", "Soren", "Thorne", "Aria"];

// Contrata um novo herói
function hireAdventurer(heroClass, cost, event) {
    // 1. Validação de Gold: Se não tiver, aplica o efeito visual no botão e cancela sem pop-up
    if (gameState.gold < cost) {
        if (event && event.currentTarget) triggerErrorEffect(event.currentTarget);
        return;
    }

    // 2. Validação de Limite de Dormitórios: Aplica o efeito visual no botão e cancela sem pop-up
    if (gameState.adventurers.length >= gameState.maxMembers) {
        if (event && event.currentTarget) triggerErrorEffect(event.currentTarget);
        return;
    }

    const randomName = recruitNames[Math.floor(Math.random() * recruitNames.length)];
    const uniqueId = `hero_${Date.now()}`;

    // Desconta o ouro
    gameState.gold -= cost;

    // Cria o herói
    const newHero = new Hero(uniqueId, randomName, heroClass);
    gameState.adventurers.push(newHero);

    if (typeof saveGame === 'function') saveGame();
    updateUI();
    renderAdventurers();
}

// Cura o herói ferido
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

// Atualiza o tempo de recuperação dos heróis feridos
function updateAdventurersTimers(deltaSeconds) {
    gameState.adventurers.forEach(hero => {
        if (hero.status === "injured") {
            hero.injuryTimer -= deltaSeconds;
            if (hero.injuryTimer <= 0) {
                hero.injuryTimer = 0;
                hero.status = "available";
                renderAdventurers();
            }
        }
    });
}
