/* ==========================================================================
   ITEMS.JS - CATÁLOGO DE ITENS, LOJA E INVENTÁRIO
   ========================================================================== */

const shopItemsList = [
    {
        id: "iron_sword",
        name: "Espada de Ferro",
        type: "weapon",
        slot: "weapon",
        cost: 100,
        bonus: { power: 8, defense: 0, speed: 0 },
        description: "+8 PWR. Uma espada básica, mas afiada."
    },
    {
        id: "leather_armor",
        name: "Armadura de Couro",
        type: "armor",
        slot: "armor",
        cost: 120,
        bonus: { power: 0, defense: 8, speed: 2 },
        description: "+8 DEF, +2 SPD. Leve e resistente."
    },
    {
        id: "boots_of_speed",
        name: "Botas Verdes",
        type: "accessory",
        slot: "accessory",
        cost: 150,
        bonus: { power: 0, defense: 2, speed: 10 },
        description: "+10 SPD, +2 DEF. Aumenta muito a velocidade."
    },
    {
        id: "magic_wand",
        name: "Cajado de Cristal",
        type: "weapon",
        slot: "weapon",
        cost: 250,
        bonus: { power: 18, defense: 0, speed: 0 },
        description: "+18 PWR. Canaliza energia arcana concentrada."
    },
    {
        id: "knight_shield",
        name: "Escudo do Guardião",
        type: "armor",
        slot: "armor",
        cost: 300,
        bonus: { power: 2, defense: 20, speed: -2 },
        description: "+20 DEF, +2 PWR. Pesado, mas muito seguro."
    }
];

function buyItem(itemId, event) {
    const item = shopItemsList.find(i => i.id === itemId);
    if (!item) return;

    if (gameState.gold < item.cost) {
        if (event && event.currentTarget) triggerErrorEffect(event.currentTarget);
        return;
    }

    gameState.gold -= item.cost;
    
    // Garante que o inventário existe no gameState
    if (!Array.isArray(gameState.inventory)) {
        gameState.inventory = [];
    }

    // Adiciona o item ao inventário com um ID único para cada instância comprada
    const inventoryItem = {
        ...item,
        uniqueId: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };

    gameState.inventory.push(inventoryItem);

    if (typeof saveGame === 'function') saveGame();
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderShop === 'function') renderShop();
}

function equipItem(heroId, itemUniqueId) {
    const hero = gameState.adventurers.find(h => h.id === heroId);
    if (!hero) return;

    // Garante suporte a equipamentos no herói
    if (!hero.equipment) {
        hero.equipment = { weapon: null, armor: null, accessory: null };
    }

    const itemIndex = gameState.inventory.findIndex(i => i.uniqueId === itemUniqueId);
    if (itemIndex === -1) return;

    const itemToEquip = gameState.inventory[itemIndex];

    // Se já houver um item no mesmo slot, remove e manda de volta pro inventário
    if (hero.equipment[itemToEquip.slot]) {
        unequipItem(heroId, itemToEquip.slot);
    }

    // Equipa no herói
    hero.equipment[itemToEquip.slot] = itemToEquip;

    // Remove do inventário global
    gameState.inventory.splice(itemIndex, 1);

    // Recalcula os atributos do herói com os bônus
    recalculateHeroStats(hero);

    if (typeof saveGame === 'function') saveGame();
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderAdventurers === 'function') renderAdventurers();
}

function unequipItem(heroId, slot) {
    const hero = gameState.adventurers.find(h => h.id === heroId);
    if (!hero || !hero.equipment || !hero.equipment[slot]) return;

    const unequipped = hero.equipment[slot];
    hero.equipment[slot] = null;

    if (!Array.isArray(gameState.inventory)) gameState.inventory = [];
    gameState.inventory.push(unequipped);

    recalculateHeroStats(hero);

    if (typeof saveGame === 'function') saveGame();
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderAdventurers === 'function') renderAdventurers();
}

function recalculateHeroStats(hero) {
    if (!hero) return;

    // Atributos base por nível e classe
    let basePower = 10 + (hero.level - 1) * 3;
    let baseDef = 5 + (hero.level - 1) * 2;
    let baseSpeed = 5 + (hero.level - 1) * 2;

    switch (hero.heroClass) {
        case "Guerreiro": basePower += 5; baseDef += 5; break;
        case "Mago": basePower += 10; break;
        case "Padre": baseDef += 8; break;
        case "Arqueiro": baseSpeed += 8; basePower += 3; break;
    }

    // Soma os bônus dos equipamentos
    let bonusPower = 0;
    let bonusDef = 0;
    let bonusSpeed = 0;

    if (hero.equipment) {
        Object.values(hero.equipment).forEach(item => {
            if (item && item.bonus) {
                bonusPower += item.bonus.power || 0;
                bonusDef += item.bonus.defense || 0;
                bonusSpeed += item.bonus.speed || 0;
            }
        });
    }

    hero.stats.power = basePower + bonusPower;
    hero.stats.defense = baseDef + bonusDef;
    hero.stats.speed = baseSpeed + bonusSpeed;
}
