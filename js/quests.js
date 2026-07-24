/* ==========================================================================
   QUESTS.JS - GERENCIAMENTO DE CONTRATOS E MISSÕES
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
        description: "Adentre as ruínas sombrias em busca de relíquias e tesouros.",
        duration: 40,
        goldReward: 220,
        xpReward: 150,
        prestigeReward: 10,
        injuryChance: 0.35
    }
];

function startQuest(questId, heroId) {
    if (!gameState || !Array.isArray(gameState.adventurers)) return;

    const quest = availableQuestsList.find(q => q.id === questId);
    const hero = gameState.adventurers.find(h => h.id === heroId);

    if (!quest || !hero || hero.status !== "available") return;

    hero.status = "on_quest";

    if (!Array.isArray(gameState.activeQuests)) {
        gameState.activeQuests = [];
    }

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

function completeQuest(activeQuest) {
    const questInfo = availableQuestsList.find(q => q.id === activeQuest.questId);
    const hero = gameState.adventurers.find(h => h.id === activeQuest.heroId);

    if (questInfo) {
        gameState.gold = (Number(gameState.gold) || 0) + questInfo.goldReward;
        gameState.prestige = (Number(gameState.prestige) || 0) + questInfo.prestigeReward;

        if (hero && typeof hero.gainXp === 'function') {
            hero.gainXp(questInfo.xpReward);
        }
    }

    if (hero) {
        if (questInfo && Math.random() < questInfo.injuryChance) {
            hero.status = "injured";
            hero.injuryTimer = 30;
        } else {
            hero.status = "available";
        }
    }
}
