// js/game.js - Controla o loop principal e atualização do jogo em tempo real

// Adiciona 1 de ouro ao clicar no botão da guilda
function clickGatherGold() {
    gameState.gold += 1; // Incrementa a quantidade de ouro
    updateUI(); // Atualiza os contadores no topo da tela
}

// Armazena o momento do último frame executado
let lastTimestamp = Date.now();

// Loop principal executado repetidamente
function gameLoop() {
    const now = Date.now(); // Obtém o horário atual em milissegundos
    const deltaSeconds = (now - lastTimestamp) / 1000; // Calcula quantos segundos se passaram desde o último frame
    lastTimestamp = now; // Atualiza a marca temporal para o próximo ciclo

    // Atualiza temporizadores de cura dos heróis feridos
    updateAdventurersTimers(deltaSeconds);
    
    // Atualiza o tempo restante e conclusão das missões
    updateQuestsTimers(deltaSeconds);

    // Atualiza contadores numéricos da barra superior (Ouro, Prestígio, Membros)
    updateUI();

    // Atualiza dinamicamente as barras de progresso sem reconstruir o HTML
    updateActiveQuestsUI();
}

// Inicializa o jogo ao carregar a página
function initGame() {
    console.log("Guild Master iniciado!");
    
    initQuests(); // Prepara a lista de missões ativas
    recruitAldric(); // Garante o recrutamento inicial do Aldric

    updateUI(); // Desenha o topo da tela
    renderAdventurers(); // Desenha a lista de heróis
    renderQuests(); // Desenha o mural de contratos

    // Executa o loop principal a cada 100 milissegundos (10 vezes por segundo)
    setInterval(gameLoop, 100);
}

// Executa a inicialização assim que o navegador carrega todos os scripts
window.onload = initGame;
