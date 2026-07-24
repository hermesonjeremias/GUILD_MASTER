/* ==========================================================================
   ITEMS.JS - MERCADO DE EQUIPAMENTOS E ITENS
   ========================================================================== */

const Items = {
    catalog: [
        { id: 'sword1', name: 'Espada de Aço', cost: 150, bonus: 3, desc: 'Aumenta o GPS em +3/s.', icon: '⚔️' },
        { id: 'armor1', name: 'Armadura de Couro', cost: 300, bonus: 7, desc: 'Aumenta o GPS em +7/s.', icon: '🛡️' },
        { id: 'amulet1', name: 'Amuleto Mágico', cost: 800, bonus: 20, desc: 'Aumenta o GPS em +20/s.', icon: '📿' }
    ],

    buy(itemId) {
        const item = this.catalog.find(i => i.id === itemId);
        if (!item || state.gold < item.cost) return;

        state.gold -= item.cost;
        if (!state.inventory) state.inventory = [];
        state.inventory.push({ ...item, id: `${item.id}_${Date.now()}` });

        this.render();
        if (typeof Adventurers !== 'undefined') Adventurers.render();
        if (typeof UI !== 'undefined') UI.update();
    },

    render() {
        const container = document.getElementById('shop-container');
        if (!container) return;

        let html = '<h3>🛒 Mercado de Equipamentos</h3><div class="cards-grid">';

        this.catalog.forEach(item => {
            const canAfford = state.gold >= item.cost;

            html += `
                <div class="hero-card">
                    <h4>${item.icon} ${item.name}</h4>
                    <p style="margin: 6px 0; color: #ccc;">${item.desc}</p>
                    <button class="action-btn" data-cost="${item.cost}" onclick="Items.buy('${item.id}')" ${!canAfford ? 'disabled' : ''}>
                        Comprar (${item.cost} 🪙)
                    </button>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }
}