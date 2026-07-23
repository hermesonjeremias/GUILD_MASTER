// js/quests.js

// Lista de modelos de missões disponíveis
const availableQuestsList = [
    {
        id: "quest_patrol",
        title: "Patrulhar o Vilarejo",
        description: "Garantir a segurança dos arredores da guilda contra ladrões locais.",
        duration: 10, // Duração em segundos
        goldReward: 15,
        xpReward: 25,
        prestigeReward: 1,
        injuryChance: 0.10, // 10% de chance de ferimento
        minLevel: 1
    },
    {
        id: "quest_goblin_cave",
        title: "Limpar Caverna de Goblins",
        description: "Goblins estão roubando suprimentos de comerciantes na estrada.",
        duration: 30, // 30 segundos
        goldReward: 50,
        xpReward: 60,
        prestigeReward: 3,
        injuryChance: 0.25, // 25% de chance de ferimento
        minLevel: 1
    },
    {
        id: "quest_ancient_ruins",
        title: "Explorar Ruínas Antigas",
        description: "Buscar relíquias e tesouros esquecidos entre velhas estruturas de pedra.",
        duration: 90, // 1 minuto e meio
        goldReward: 180,
        xpReward: 150,
        prestigeReward: 10,
        injuryChance: 0.40, // 40% de chance de ferimento
        minLevel: 2
    }
];

// Inicializa a lista de missões ativas e disponíveis no gameState
function initQuests() {
    if (!gameState.activeQuests) {
        gameState.activeQuests = [];
    }
}

// Inicia uma missão enviando um herói específico
function startQuest(questId, heroId) {
    const hero = gameState.adventurers.find(h => h.id === heroId);
    const questTemplate = availableQuestsList.find(q => q.id === questId);

    if (!hero) {
        alert("Aventureiro não encontrado!");
        return;
    }

    if (hero.status !== "available") {
        alert("Este aventureiro não está disponível no momento!");
        return;
    }

    if (!questTemplate) {
        alert("Missão não encontrada!");
        return;
    }

    // Coloca o herói em missão
    hero.status = "on_quest";

    // Adiciona à lista de missões rodando
    gameState.activeQuests.push({
        id: `active_${Date.now()}`,
        questId: questTemplate.id,
        title: questTemplate.title,
        heroId: hero.id,
        heroName: hero.name,
        duration: questTemplate.duration,
        timeRemaining: questTemplate.duration,
        goldReward: questTemplate.goldReward,
        xpReward: questTemplate.xpReward,
        prestigeReward: questTemplate.prestigeReward,
        injuryChance: questTemplate.injuryChance
    });

    renderQuests();
    renderAdventurers();
}

// Processa o avanço do tempo das missões (chamado a cada frame no gameLoop)
function updateQuestsTimers(deltaSeconds) {
    if (!gameState.activeQuests) return;

    for (let i = gameState.activeQuests.length - 1; i >= 0; i--) {
        const activeQuest = gameState.activeQuests[i];
        activeQuest.timeRemaining -= deltaSeconds;

        // Quando o tempo esgota, conclui a missão
        if (activeQuest.timeRemaining <= 0) {
            completeQuest(activeQuest);
            gameState.activeQuests.splice(i, 1); // Remove da lista de ativas
        }
    }
}

// Conclui a missão, entrega prêmios e calcula ferimentos
function completeQuest(activeQuest) {
    const hero = gameState.adventurers.find(h => h.id === activeQuest.heroId);

    // Concede recompensas para a guilda
    gameState.gold += activeQuest.goldReward;
    gameState.prestige += activeQuest.prestigeReward;

    // Concede XP para o herói
    if (hero) {
        hero.addXP(activeQuest.xpReward);

        // Calcula chance de ferimento (RNG)
        const roll = Math.random();
        if (roll < activeQuest.injuryChance) {
            hero.status = "injured";
            hero.injuryTimer = 30; // Fica 30 segundos machucado na enfermaria
            console.log(`⚠️ ${hero.name} voltou ferido da missão "${activeQuest.title}"!`);
        } else {
            hero.status = "available";
            console.log(`✅ ${hero.name} completou a missão "${activeQuest.title}" com sucesso!`);
        }
    }

    updateUI();
    renderAdventurers();
    renderQuests();
}
