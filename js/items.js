/* ==========================================================================
   ITEMS.JS - CATÁLOGO DE ITENS E MERCADO
   ========================================================================== */

const Items = {
    itemList: [
        { id: 'potion', name: 'Poção de Energia', cost: 50, desc: 'Ganha +20 de Ouro instantaneamente.', icon: '🧪' },
        { id: 'banner', name: 'Estandarde de Glória', cost: 500, desc: 'Aumenta seu Prestígio em +1.', icon: '🚩' }
    ],

    buy(itemId) {
        const item = this.itemList.find(i => i.id === itemId);
        if (!item) return;

        if (state.gold >= item.cost) {
            state.gold -= item.cost;

            if (itemId === 'potion') {
                state.gold += 20;
            } else if (itemId === 'banner') {
                state.prestige = (state.prestige || 0) + 1;
            }

            if (typeof UI !== 'undefined') UI.update();
        }
    },

    render() {
        // Procura pelos possíveis IDs de contêiner da aba de loja/mercado
        const container = document.getElementById('shop-container') || document.getElementById('tab-loja');
        if (!container) return;

        let html = '<h2>🛒 Mercado de Equipamentos</h2><div class="cards-grid">';

        this.itemList.forEach(item => {
            const canAfford = state.gold >= item.cost;
            html += `
                <div class="card">
                    <div class="card-icon">${item.icon}</div>
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                    <button class="action-btn" 
                            data-cost="${item.cost}"
                            onclick="Items.buy('${item.id}')" 
                            ${!canAfford ? 'disabled' : ''}>
                        Comprar (${item.cost} Ouro)
                    </button>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }
};
