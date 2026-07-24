/* ==========================================================================
   STATE.JS - ESTADO GLOBAL E PERSISTÊNCIA
   ========================================================================== */

const SAVE_KEY = 'guild_clicker_save_v1';

let state = {
    gold: 50,
    prestige: 0,
    maxMembers: 5,
    adventurers: [],
    activeQuests: [],
    buildings: {
        tavern: 0,
        training: 0
    },
    lastTick: Date.now()
};

const StateManager = {
    save() {
        try {
            state.lastTick = Date.now();
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Erro ao salvar:', e);
        }
    },

    load() {
        try {
            const savedData = localStorage.getItem(SAVE_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                state = { ...state, ...parsed };
            }
        } catch (e) {
            console.error('Erro ao carregar:', e);
        }
    },

    reset() {
        if (confirm('Deseja reiniciar todo o seu progresso?')) {
            localStorage.removeItem(SAVE_KEY);
            location.reload();
        }
    }
};
