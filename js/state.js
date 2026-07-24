/* ==========================================================================
   STATE.JS - ESTADO GLOBAL DO JOGO
   ========================================================================== */

const state = {
    gold: 200,
    maxMembers: 5,
    prestige: 0,
    adventurers: [],
    activeQuests: [],
    autoQuestsConfig: {},
    inventory: [], // Essential for the Ferreiro/Items system
    buildings: {
        training: 0,
        strategyTable: 0,
        officers: 0,
        tactics: 0,
        rescue: 0
    }
};
