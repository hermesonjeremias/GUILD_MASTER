/* ==========================================================================
   QUESTS.JS - GERENCIAMENTO DE MISSÕES E CONTRATOS DA GUILDA
   ========================================================================== */

const availableQuestsList = [
    {
        id: "rat_problem",
        title: "Infestação na Taverna",
        description: "Limpe os ratos gigantes no porão da taverna local.",
        duration: 8,
        goldReward: 25,
        xpReward: 15,
        prestigeReward: 1,
        injuryChance: 0.1
    },
    {
        id: "goblin_patrol",
        title: "Patrulha de Goblins",
        description: "Elimine o acampamento goblin que ameaça as caravanas da estrada.",
        duration: 15,
        goldReward: 50,
        xpReward: 35,
        prestigeReward: 3,
        injuryChance: 0.2
    },
    {
        id: "escort_merchant",
        title: "Escolta de Mercadores",
        description: "Proteja os mercadores que atravessam o desfiladeiro perigoso.",
        duration: 25,
        goldReward: 100,
        xpReward: 70,
        prestigeReward: 5,
        injuryChance: 0.25
    },
    {
        id: "ruins_exploration",
        title: "Exploração de Ruínas Antigas",
        description: "Adentre as ruínas sombrias em busca de relíquias e tesouros esquecidos.",
        duration: 40,
        goldReward: 220,
        xpReward: 150,
        prestigeReward: 10,
        injuryChance: 0.35
    }
];

/**
 * Inicia uma missão enviando um herói disponível.
 */
function startQuest(questId, heroId) {
    if (!gameState || !Array.isArray(gameState.adventurers)) return;

    const quest = availableQuestsList.find(q => q.id === questId);
    const hero = gameState.adventurers.find(h => h.id === heroId);

    if (!quest) {
        console.warn("Missão não encontrada:", questId);
        return;
    }

    if (!hero) {
        console.warn("Herói não encontrado:", heroId);
        return;
    }

    if (hero.status !== "available") {
        console.warn("Herói não está disponível:", hero.name, hero.status);
        return;
    }

    // Altera o status do herói
    hero.status = "on_quest";

    if (!Array.isArray(gameState.activeQuests)) {
        gameState.activeQuests = [];
    }

    // Adiciona a missão ativa
    gameState.activeQuests.push({
        id: `active_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        questId: quest.id,
        heroId: hero.id,
        heroName: hero.name,
        title: quest.title,
        duration: Number(quest.duration),
        timeRemaining: Number(quest.duration)
    });

    if (typeof saveGame === 'function') saveGame();
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderQuests === 'function') renderQuests();
    if (typeof renderAdventurers === 'function') renderAdventurers();
    if (typeof updateActiveQuestsUI === 'function') updateActiveQuestsUI();
}

/**
 * Atualiza o progresso temporal de todas as missões ativas no game loop.
 */
function updateQuests(deltaSeconds) {
    if (!gameState || !Array.isArray(gameState.activeQuests) || gameState.activeQuests.length === 0) return;

    for (let i = gameState.activeQuests.length - 1; i >= 0; i--) {
        const activeQuest = gameState.activeQuests[i];
        if (!activeQuest) continue;

        activeQuest.timeRemaining -= deltaSeconds;

        if (activeQuest.timeRemaining <= 0) {
            completeQuest(activeQuest);
            gameState.activeQuests.splice(i, 1);
            
            if (typeof saveGame === 'function') saveGame();
            if (typeof updateUI === 'function') updateUI();
            if (typeof renderQuests === 'function') renderQuests();
            if (typeof renderAdventurers === 'function') renderAdventurers();
            if (typeof updateActiveQuestsUI === 'function') updateActiveQuestsUI();
        }
    }
}

/**
 * Finaliza a missão, concede recompensas e define o status do herói.
 */
function completeQuest(activeQuest) {
    const questInfo = availableQuestsList.find(q => q.id === activeQuest.questId);
    const hero = gameState.adventurers.find(h => h.id === activeQuest.heroId);

    if (questInfo) {
        // Concede recompensas garantindo tipo numérico
        const currentGold = Number(gameState.gold) || 0;
        const currentPrestige = Number(gameState.prestige) || 0;

        gameState.gold = currentGold + questInfo.goldReward;
        gameState.prestige = currentPrestige + questInfo.prestigeReward;

        if (hero && typeof hero.gainXp === 'function') {
            hero.gainXp(questInfo.xpReward);
        }
    }

    if (hero) {
        const rolledDice = Math.random();
        if (questInfo && rolledDice < questInfo.injuryChance) {
            hero.status = "injured";
            hero.injuryTimer = 30;
        } else {
            hero.status = "available";
        }
    }
}
