// js/adventurers.js - Cuida do recrutamento e atualização temporal dos heróis

// Recruta o herói inicial Aldric (executado apenas uma vez no início do jogo)
function recruitAldric() {
    // Verifica se Aldric já foi adicionado para evitar duplicação
    const hasAldric = gameState.adventurers.some(hero => hero.id === "aldric_1");
    
    if (!hasAldric) {
        // Instancia a classe Hero do arquivo hero.js
        const aldric = new Hero("aldric_1", "Aldric", "Guerreiro");
        gameState.adventurers.push(aldric); // Salva no array principal de aventureiros
    }
}

// Lista de nomes aleatórios para candidatos a recrutas
const recruitNames = ["Gideon", "Lyra", "Eldrin", "Valerie", "Kaelen", "Soren", "Thorne", "Aria"];

// Contrata um novo herói pagando a taxa de recrutamento
function hireAdventurer(heroClass, cost) {
    // Validação 1: Ouro suficiente
    if (gameState.gold < cost) {
        alert("Ouro insuficiente na guilda para recrutar!");
        return;
    }

    // Validação 2: Limite de dormitórios atingido
    if (gameState.adventurers.length >= gameState.maxMembers) {
        alert("Dormitórios cheios! Expanda a guilda na aba Construções para abrigar mais membros.");
        return;
    }

    // Seleciona um nome aleatório da lista
    const randomName = recruitNames[Math.floor(Math.random() * recruitNames.length)];
    // Gera um ID único usando o timestamp atual
    const uniqueId = `hero_${Date.now()}`;

    // Desconta o valor do ouro
    gameState.gold -= cost;

    // Cria o novo herói e salva no estado da guilda
    const newHero = new Hero(uniqueId, randomName, heroClass);
    gameState.adventurers.push(newHero);

    // Redesenha a interface
    updateUI();
    renderAdventurers();
}

// Atualiza o tempo de recuperação dos heróis feridos
function updateAdventurersTimers(deltaSeconds) {
    gameState.adventurers.forEach(hero => {
        // Executa apenas se o herói estiver com o status "injured" (ferido)
        if (hero.status === "injured") {
            hero.injuryTimer -= deltaSeconds; // Subtrai o tempo decorrido
            
            // Quando o tempo de recuperação encerra
            if (hero.injuryTimer <= 0) {
                hero.injuryTimer = 0;
                hero.status = "available"; // Torna o herói pronto novamente
            }
        }
    });
}
