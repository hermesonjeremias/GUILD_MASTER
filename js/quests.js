// js/quests.js - Gerencia as missões, tempo, recompensas e riscos

// Lista com os modelos de contratos/missões do jogo
const availableQuestsList = [
    {
        id: "quest_patrol", // ID único da missão
        title: "Patrulhar o Vilarejo", // Título visível
        description: "Garantir a segurança dos arredores da guilda contra ladrões locais.", // Descrição
        duration: 10, // Duração em segundos
        goldReward: 15, // Recompensa em ouro
        xpReward: 25, // XP concedida ao herói
        prestigeReward: 1, // Prestígio para a guilda
        injuryChance: 0.10 // 10% de chance do herói se ferir
    },
    {
        id: "quest_goblin_cave",
        title: "Limpar Caverna de Goblins",
        description: "Goblins estão roubando suprimentos de comerciantes na estrada.",
        duration: 30, // 30 segundos
        goldReward: 50,
        xpReward: 60,
        prestigeReward: 3,
        injuryChance: 0.25 // 25% de chance de ferimento
    },
    {
        id: "quest_ancient_ruins",
        title: "Explorar Ruínas Antigas",
        description: "Buscar relíquias e tesouros esquecidos entre velhas estruturas de pedra.",
        duration: 90, // 90 segundos (1.5 min)
        goldReward: 180,
        xpReward: 150,
        prestigeReward: 10,
        injuryChance: 0.40 // 40% de chance de ferimento
    }
];

// Garante que o array de missões ativas existe no estado do jogo
function initQuests() {
    if (!gameState.activeQuests) {
        gameState.activeQuests = []; // Cria o array se ainda não existir
    }
}

// Função para iniciar uma missão com um herói selecionado
function startQuest(questId, heroId) {
    // Procura o objeto do herói pelo ID
    const hero = gameState.adventurers.find(h => h.id === heroId);
    // Procura os dados da missão escolhida pelo ID
    const questTemplate = availableQuestsList.find(q => q.id === questId);

    // Validação de segurança: verifica se o herói existe
    if (!hero) {
        alert("Aventureiro não encontrado!");
        return;
    }

    // Validação: garante que o herói está livre
    if (hero.status !== "available") {
        alert("Este aventureiro não está disponível!");
        return;
    }

    // Altera o status do herói para em missão
    hero.status = "on_quest";

    // Cria e insere a missão no registro de missões ativas
    gameState.activeQuests.push({
        id: `active_${Date.now()}`, // Identificador único da execução
        questId: questTemplate.id, // ID do modelo
        title: questTemplate.title, // Nome do contrato
        heroId: hero.id, // ID do herói enviado
        heroName: hero.name, // Nome do herói enviado
        duration: questTemplate.duration, // Duração total
        timeRemaining: questTemplate.duration, // Contagem regressiva
        goldReward: questTemplate.goldReward, // Ouro a receber
        xpReward: questTemplate.xpReward, // XP a receber
        prestigeReward: questTemplate.prestigeReward, // Prestígio a receber
        injuryChance: questTemplate.injuryChance // Chance de ferimento
    });

    // Redesenha as telas para refletir a mudança
    renderQuests();
    renderAdventurers();
}

// Desconta o tempo das missões ativas a cada tick
function updateQuestsTimers(deltaSeconds) {
    if (!gameState.activeQuests) return; // Se não houver missões ativas, encerra

    // Percorre a lista de trás para frente para poder remover itens sem quebrar o loop
    for (let i = gameState.activeQuests.length - 1; i >= 0; i--) {
        const activeQuest = gameState.activeQuests[i]; // Pega a missão da posição i
        activeQuest.timeRemaining -= deltaSeconds; // Subtrai o tempo decorrido

        // Quando o tempo esgota
        if (activeQuest.timeRemaining <= 0) {
            completeQuest(activeQuest); // Finaliza e entrega prêmios
            gameState.activeQuests.splice(i, 1); // Remove da lista de ativas
        }
    }
}

// Conclui a missão, concede recompensas e calcula ferimentos
function completeQuest(activeQuest) {
    // Procura o herói que fez a missão
    const hero = gameState.adventurers.find(h => h.id === activeQuest.heroId);

    // Adiciona o ouro e prestígio ao saldo da guilda
    gameState.gold += activeQuest.goldReward;
    gameState.prestige += activeQuest.prestigeReward;

    if (hero) {
        hero.addXP(activeQuest.xpReward); // Soma a XP e verifica level up

        // Sorteia número aleatório entre 0 e 1 para calcular ferimento
        const roll = Math.random();
        if (roll < activeQuest.injuryChance) {
            hero.status = "injured"; // Seta status para ferido
            hero.injuryTimer = 30; // Define 30 segundos na enfermaria
        } else {
            hero.status = "available"; // Herói fica livre para nova missão
        }
    }

    // Redesenha os elementos na tela
    updateUI();
    renderAdventurers();
    renderQuests();
}
