/* ==========================================================================
   UI.JS - GERENCIAMENTO E ATUALIZAÇÃO DA INTERFACE
   ========================================================================== */

const UI = {
    // Atualiza os valores do cabeçalho (Ouro, Poder, Membros, Prestígio)
    updateHeader() {
        const goldEl = document.getElementById('gold-display');
        const powerEl = document.getElementById('power-display');
        const membersEl = document.getElementById('members-display');
        const prestigeEl = document.getElementById('prestige-display');

        if (goldEl) goldEl.innerText = state.gold;
        if (prestigeEl) prestigeEl.innerText = state.prestige || 0;

        if (membersEl) {
            const currentMembers = (state.adventurers || []).length;
            membersEl.innerText = `${currentMembers}/${state.maxMembers}`;
        }

        if (powerEl && typeof Adventurers !== 'undefined') {
            const totalPower = Adventurers.calculateTotalGuildPower();
            powerEl.innerText = totalPower;
        }
    },

    // Renderiza todas as abas da interface
    renderAll() {
        if (typeof Adventurers !== 'undefined' && Adventurers.render) {
            Adventurers.render();
        }
        if (typeof Quests !== 'undefined' && Quests.render) {
            Quests.render();
        }
        if (typeof Buildings !== 'undefined' && Buildings.render) {
            Buildings.render();
        }
        if (typeof Items !== 'undefined' && Items.renderBlacksmith) {
            Items.renderBlacksmith();
        }
        this.updateHeader();
    },

    // Atalho para atualizar elementos dinâmicos da interface
    update() {
        this.updateHeader();
    }
};
