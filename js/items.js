/* ==========================================================================
   ITEMS.JS - FERREIRO, LOJA, INVENTÁRIO E MODAL POP-UP
   ========================================================================== */

const Items = {
    catalog: [
        // Guerreiro
        { id: 'espada_bronze', name: 'Espada de Bronze', slot: 'weapon', classId: 'guerreiro', cost: 100, power: 8, icon: '🗡️', desc: '+8 Poder Base' },
        { id: 'escudo_madera', name: 'Escudo de Madeira', slot: 'secondary', classId: 'guerreiro', cost: 150, passBonus: 0.05, icon: '🛡️', desc: '+5% Extra na Passiva por Nível' },

        // Arqueiro
        { id: 'arco_curvo', name: 'Arco Curvo', slot: 'weapon', classId: 'arqueiro', cost: 100, power: 8, icon: '🏹', desc: '+8 Poder Base' },
        { id: 'capa_cacador', name: 'Capa do Caçador', slot: 'secondary', classId: 'arqueiro', cost: 150, passBonus: 0.05, icon: '🧥', desc: '-5% Duração Extra das Missões' },

        // Mago
        { id: 'cajado_aprendiz', name: 'Cajado de Aprendiz', slot: 'weapon', classId: 'mago', cost: 100, power: 8, icon: '🪄', desc: '+8 Poder Base' },
        { id: 'anel_ouro', name: 'Anel do Ganancioso', slot: 'secondary', classId: 'mago', cost: 150, passBonus: 0.10, icon: '💍', desc: '+10% Ouro Extra nas Missões' },

        // Clérigo
        { id: 'maca_ferro', name: 'Maça de Ferro', slot: 'weapon', classId: 'clerigo', cost: 100, power: 8, icon: '🔨', desc: '+8 Poder Base' },
        { id: 'amuleto_luz', name: 'Amuleto da Luz', slot: 'secondary', classId: 'clerigo', cost: 150, passBonus: 0.08, icon: '📿', desc: '+8% Sucesso / Proteção Extra' }
    ],

    currentModalContext: null,

    buy(itemId) {
        const item = this.catalog.find(i => i.id === itemId);
        if (!item || state.gold < item.cost) return;

        state.gold -= item.cost;
        if (!state.inventory) state.inventory = [];

        state.inventory.push({
            instanceId: Date.now(),
            itemId: item.id
        });

        this.renderBlacksmith();
        if (typeof UI !== 'undefined') UI.update();
    },

    openModal(heroId, slot) {
        const hero = (state.adventurers || []).find(a => a.id === heroId);
        if (!hero) return;

        this.currentModalContext = { heroId, slot };
        const modal = document.getElementById('equip-modal');
        const title = document.getElementById('modal-title');
        const container = document.getElementById('modal-items-list');

        if (!modal || !title || !container) return;

        const slotName = slot === 'weapon' ? 'Arma Principal' : 'Item Secundário';
        title.innerText = `Equipar ${slotName} - ${hero.name}`;

        const equippedInstanceIds = (state.adventurers || []).flatMap(a => [a.weaponInstanceId, a.secondaryInstanceId]).filter(Boolean);

        const availableInventory = (state.inventory || []).filter(inv => {
            const template = this.catalog.find(c => c.id === inv.itemId);
            return template && 
                   template.classId === hero.classId && 
                   template.slot === slot && 
                   !equippedInstanceIds.includes(inv.instanceId);
        });

        let html = '';

        const currentEquippedId = slot === 'weapon' ? hero.weaponInstanceId : hero.secondaryInstanceId;
        if (currentEquippedId) {
            html += `
                <div class="card" style="border-color: #e74c3c;">
                    <h3>Desequipar Item Atual</h3>
                    <button class="action-btn" style="background:#e74c3c" onclick="Items.unequip(${heroId}, '${slot}')">Remover Item</button>
                </div>
            `;
        }

        if (availableInventory.length === 0) {
            html += '<p style="grid-column: 1/-1; color: #aaa;">Nenhum item compatível no inventário. Compre no Ferreiro!</p>';
        } else {
            availableInventory.forEach(inv => {
                const template = this.catalog.find(c => c.id === inv.itemId);
                html += `
                    <div class="card">
                        <div class="card-icon">${template.icon}</div>
                        <h3>${template.name}</h3>
                        <p>${template.desc}</p>
                        <button class="action-btn" onclick="Items.equip(${heroId}, '${slot}', ${inv.instanceId})">
                            Equipar
                        </button>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
        modal.style.display = 'flex';
    },

    closeModal() {
        const modal = document.getElementById('equip-modal');
        if (modal) modal.style.display = 'none';
        this.currentModalContext = null;
    },

    equip(heroId, slot, instanceId) {
        const hero = (state.adventurers || []).find(a => a.id === Number(heroId));
        if (!hero) return;

        if (slot === 'weapon') hero.weaponInstanceId = instanceId;
        if (slot === 'secondary') hero.secondaryInstanceId = instanceId;

        this.closeModal();
        if (typeof Adventurers !== 'undefined') Adventurers.render();
        if (typeof Quests !== 'undefined') Quests.render();
        if (typeof UI !== 'undefined') UI.update();
    },

    unequip(heroId, slot) {
        const hero = (state.adventurers || []).find(a => a.id === Number(heroId));
        if (!hero) return;

        if (slot === 'weapon') hero.weaponInstanceId = null;
        if (slot === 'secondary') hero.secondaryInstanceId = null;

        this.closeModal();
        if (typeof Adventurers !== 'undefined') Adventurers.render();
        if (typeof Quests !== 'undefined') Quests.render();
        if (typeof UI !== 'undefined') UI.update();
    },

    renderBlacksmith() {
        const container = document.getElementById('blacksmith-container');
        if (!container) return;

        let html = '<h2>⚒️ Loja do Ferreiro</h2><div class="cards-grid">';

        this.catalog.forEach(item => {
            const canAfford = state.gold >= item.cost;
            html += `
                <div class="card">
                    <div class="card-icon">${item.icon}</div>
                    <h3>${item.name}</h3>
                    <p style="font-size:0.85rem; color:#aaa;">Classe: ${item.classId.toUpperCase()} (${item.slot})</p>
                    <p>${item.desc}</p>
                    <button class="action-btn" onclick="Items.buy('${item.id}')" ${!canAfford ? 'disabled' : ''}>
                        Comprar (${item.cost} 🪙)
                    </button>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }
};
