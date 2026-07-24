/* ==========================================================================
   STATE.JS - GERENCIAMENTO DE ESTADO E SALVAMENTO
   ========================================================================== */

const SAVE_KEY = 'guild_clicker_save_v1';

// Estado inicial do jogo
let state = {
    gold: 50,
    prestige: 0,
    maxMembers: 5,
    adventurers: [],  // Lista de heróis contratados
    activeQuests: [], // Missões em andamento
    buildings: {},    // Níveis das construções { tavern: 0, training: 0 }
    lastTick: Date.now()
};

const StateManager = {
    save() {
        try {
            state.lastTick = Date.now();
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Erro ao salvar o jogo:', e);
        }
    },

    load() {
        try {
            const savedData = localStorage.getItem(SAVE_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                // Mescla os dados salvos com a estrutura padrão
                state = { ...state, ...parsed };
            }
        } catch (e) {
            console.error('Erro ao carregar o jogo:', e);
        }
    },

    reset() {
        if (confirm('Tem certeza de que deseja reiniciar o seu progresso?')) {
            localStorage.removeItem(SAVE_KEY);
            location.reload();
        }
    }
};
