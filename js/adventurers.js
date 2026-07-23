// js/adventurers.js

// Recruta o herói inicial (Aldric)
function recruitAldric() {
    // Verifica se já não foi recrutado
    const hasAldric = gameState.adventurers.some(hero => hero.id === "aldric_1");
    
    if (!hasAldric) {
        const aldric = new Hero("aldric_1", "Aldric", "Guerreiro");
        gameState.adventurers.push(aldric);
    }
}

// Recruta heróis genéricos pagando ouro
function hireAdventurer(name, heroClass, cost) {
    if (gameState.gold < cost) {
        alert("Ouro insuficiente para contratar este aventureiro!");
        return;
    }

    if (gameState.adventurers.length >= gameState.maxMembers) {
        alert("Sua guilda não tem dormitórios suficientes! Expanda sua guilda na aba Construções.");
        return;
    }

    gameState.gold -= cost;
    const newId = `hero_${Date.now()}`;
    const newHero = new Hero(newId, name, heroClass);
    gameState.adventurers.push(newHero);
    
    updateUI();
    renderAdventurers();
}

// Atualiza contadores de ferimentos dos heróis (executado a cada segundo no game loop)
function updateAdventurersTimers(deltaSeconds) {
    gameState.adventurers.forEach(hero => {
        if (hero.status === "injured") {
            hero.injuryTimer -= deltaSeconds;
            
            // Se o tempo de cura acabou, volta ao status disponível
            if (hero.injuryTimer <= 0) {
                hero.injuryTimer = 0;
                hero.status = "available";
                console.log(`${hero.name} recuperou-se dos ferimentos!`);
            }
        }
    });
}
