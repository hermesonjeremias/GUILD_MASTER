/* ==========================================================================
   STATE.JS - ESTADO GLOBAL DO JOGO
   ========================================================================== */

const state = {
    // Recursos Iniciais
    gold: 50,             // Começa com 50 de ouro para poder contratar o 1º herói!
    prestige: 0,
    maxMembers: 5,
    
    // Listas do Jogo
    adventurers: [],
    activeQuests: [],
    inventory: [],
    
    // Níveis de Construções
    buildings: {
        tavern: 1,
        training: 0,
        market: 0
    },

    // Configurações e Tempos
    lastUpdate: Date.now()
};

// Salva o estado atual no armazenamento do navegador
function saveGame() {
    localStorage.setItem('guilda_save', JSON.stringify(state));
}

// Carrega o estado salvo
function loadGame() {
    const saved = localStorage.getItem('guilda_save');
    if (saved) {
        const loadedState = JSON.parse(saved);
        Object.assign(state, loadedState);
    }
}

// Reinicia o progresso
function resetGame() {
    if (confirm("Tem certeza que deseja reiniciar sua Guilda do zero?")) {
        localStorage.removeItem('guilda_save');
        location.reload();
    }
}
