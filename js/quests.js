/* ==========================================================================
   QUESTS.JS - LÓGICA DE MISSÕES COM TAXA DE SUCESSO E RISCO
   ========================================================================== */

const availableQuestsList = [
    {
        id: "rat_infestation",
        title: "Infestação na Taverna",
        description: "Livre o porão dos ratos gigantes. Missão simples para novatos.",
        baseDuration: 8,
        requiredPower: 10,
        goldReward: 25,
        xpReward: 15
    },
    {
        id: "goblin_patrol",
        title: "Patrulha de Goblins",
        description: "Goblins foram vistos perto da vila. Requer um pouco mais de força.",
        baseDuration: 15,
        requiredPower: 22,
        goldReward: 60,
        xpReward: 35
    },
    {
        id: "bandit_camp",
        title: "Acampamento de Salteadores",
        description: "Limpe a estrada comercial atacada por bandidos armados.",
        baseDuration: 25,
        requiredPower: 38,
        goldReward: 120,
        xpReward: 70
    },
    {
        id: "dungeon_boss",
        title: "Templo Esquecido",
        description: "Uma ameaça ancestral desperta. Alto risco de ferimentos!",
        baseDuration: 40,
        requiredPower: 60,
        goldReward: 280,
        xpReward: 160
    }
];

// Calcula a chance de sucesso (entre 10% e 100%)
function calculateSuccessChance(hero, quest) {
    if (!hero || !quest) return 0;
    const powerRatio = hero.stats.power / quest.requiredPower;
    let chance = Math.floor(powerRatio * 75); // Se tiver o poder exato = 75%
    return Math.max(10, Math.min(100, chance)); // Limita entre 10% e 100%
}

// Calcula a duração reduzida com base na Velocidade do Herói
function calculateQuestDuration(hero, quest) {
    if (!hero || !quest) return quest.baseDuration;
    const speedBonus = hero.stats.speed * 0.02; // Cada ponto reduz 2% do tempo
    const duration = quest.baseDuration / (1 + speedBonus);
    return Math.max(3, duration); // Tempo mínimo de 3 segundos
}

function startQuest(questId, heroId) {
    const quest = availableQuestsList.find(q => q.id === questId);
    const hero = gameState.adventurers.find(h => h.id === heroId);

    if (!quest || !hero || hero.status !== "available") return;

    hero.status = "on_quest";

    const duration = calculateQuestDuration(hero, quest);
    const successChance = calculateSuccessChance(hero, quest);

    gameState.activeQuests.push({
        id: quest.id,
        heroId: hero.id,
        heroName: hero.name,
        title: quest.title,
        duration: duration,
        timeRemaining: duration,
        goldReward: quest.goldReward,
        xpReward: quest.xpReward,
        successChance: successChance,
        requiredPower: quest.requiredPower
    });

    if (typeof saveGame === 'function') saveGame();
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderQuests === 'function') renderQuests();
    if (typeof renderAdventurers === 'function') renderAdventurers();
}

function updateQuests(deltaSeconds) {
    if (!Array.isArray(gameState.activeQuests) || gameState.activeQuests.length === 0) return;

    let updated = false;

    for (let i = gameState.activeQuests.length - 1; i >= 0; i--) {
        const active = gameState.activeQuests[i];
        active.timeRemaining -= deltaSeconds;

        if (active.timeRemaining <= 0) {
            completeQuest(active);
            gameState.activeQuests.splice(i, 1);
            updated = true;
        }
    }

    if (updated) {
        if (typeof saveGame === 'function') saveGame();
        if (typeof updateUI === 'function') updateUI();
        if (typeof renderQuests === 'function') renderQuests();
        if (typeof renderAdventurers === 'function') renderAdventurers();
    }
}

function completeQuest(activeQuest) {
    const hero = gameState.adventurers.find(h => h.id === activeQuest.heroId);
    if (!hero) return;

    // Rola a sorte para sucesso ou falha
    const roll = Math.random() * 100;
    const isSuccess = roll <= activeQuest.successChance;

    if (isSuccess) {
        gameState.gold += activeQuest.goldReward;
        if (typeof hero.gainXp === 'function') {
            hero.gainXp(activeQuest.xpReward);
        }
        hero.status = "available";
    } else {
        // FALHA: Herói fica ferido. A defesa reduz o tempo do ferimento!
        const baseInjury = 15; // 15 segundos base de ferimento
        const defReduction = hero.stats.defense * 0.3; 
        const injuryTime = Math.max(5, Math.ceil(baseInjury - defReduction));

        hero.status = "injured";
        hero.injuryTimer = injuryTime;
    }
}
