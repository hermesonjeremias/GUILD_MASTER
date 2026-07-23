// js/adventurers.js - Cuida do recrutamento, cura e atualização dos heróis

// Recruta o herói inicial Aldric (executado apenas se não houver save salvo)
function recruitAldric() {
    const hasAldric = gameState.adventurers.some(hero => hero.id === "aldric_1");
    if (!hasAldric) {
        const aldric = new Hero("aldric_1", "Aldric", "Guerreiro");
        gameState.adventurers.push(aldric);
    }
}

const recruitNames = ["Gideon", "Lyra", "Eldrin", "Valerie", "Kaelen", "Soren", "Thorne", "Aria"];

// Contrata um novo herói pagando a taxa
function hireAdventurer(heroClass, cost) {
    if (gameState.gold < cost) {
        alert("Ouro insuficiente na guilda para recrutar!");
        return;
    }

    if (gameState.adventurers.length >= gameState.maxMembers) {
        alert("Dormitórios cheios! Expanda a guilda na aba Construções para abrigar mais membros.");
        return;
    }

    const randomName = recruitNames[Math.floor(Math.random() * recruitNames.length)];
    const uniqueId = `hero_${Date.now()}`;

    gameState.gold -= cost;

    const newHero = new Hero(uniqueId, randomName, heroClass);
    gameState.adventurers.push(newHero);

    saveGame(); // Salva automaticamente ao recrutar
    updateUI();
    renderAdventurers();
}

// Paga tratamento para curar instantaneamente um herói ferido (Custo: 15 Ouro)
function healHero(heroId, cost = 15) {
    const hero = gameState.adventurers.find(h => h.id === heroId);
    if (!hero) return;

    if (gameState.gold < cost) {
        alert("Ouro insuficiente para pagar a poção de cura!");
        return;
    }

    gameState.gold -= cost; // Deduz custo do tratamento
    hero.status = "available"; // Restaura status
    hero.injuryTimer = 0; // Zera o tempo

    saveGame(); // Salva estado
    updateUI();
    renderAdventurers();
}

// Atualiza o tempo de recuperação dos heróis feridos no ciclo
function updateAdventurersTimers(deltaSeconds) {
    gameState.adventurers.forEach(hero => {
        if (hero.status === "injured") {
            hero.injuryTimer -= deltaSeconds;
            if (hero.injuryTimer <= 0) {
                hero.injuryTimer = 0;
                hero.status = "available";
                renderAdventurers(); // Atualiza a lista quando alguém sara
            }
        }
    });
}
