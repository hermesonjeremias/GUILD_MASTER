/* ==========================================================================
   STATE.JS - ESTADO GLOBAL DO JOGO
   ========================================================================== */

const SAVE_KEY = 'guild_clicker_save_v2';

let state = {
    gold: 50,
    prestige: 0,
    maxMembers: 5,
    adventurers: [],
    activeQuests: [],
    autoQuestsConfig: {}, // Armazena configurações de automação por id da missão
    buildings: {
        tavern: 0,
        training: 0,
        strategyTable: 0, // Aumenta tamanho máximo da Party (Inicia em 1)
        officers: 0,      // Libera vagas de automação
        tactics: 0,       // Reduz a penalidade de tempo da automação
        rescue: 0         // Resgata e cura heróis feridos em automação
    },
    lastTick: Date.now()
};

const StateManager = {
    save() {
        try {
            state.lastTick = Date.now();
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Erro ao salvar estado:', e);
        }
    },

    load() {
        try {
            const savedData = localStorage.getItem(SAVE_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                state = { ...state, ...parsed };
                // Garantir objetos essenciais em saves antigos
                if (!state.buildings) state.buildings = {};
                if (!state.autoQuestsConfig) state.autoQuestsConfig = {};
            }
        } catch (e) {
            console.error('Erro ao carregar estado:', e);
        }
    },

    reset() {
        if (confirm('Deseja reiniciar todo o seu progresso?')) {
            localStorage.removeItem(SAVE_KEY);
            location.reload();
        }
    }
};
