// js/buildings.js - Gerencia as construções e melhorias da guilda

const availableBuildings = [
    {
        id: "dormitory",
        name: "Dormitório",
        description: "Aumenta o limite máximo de aventureiros que a guilda pode abrigar (+2 por nível).",
        level: 1,
        baseCost: 50,
        costMultiplier: 1.8,
        membersPerLevel: 2
    },
    {
        id: "contract_board",
        name: "Mural de Contratos",
        description: "Gera Ouro por segundo (+20% de eficiência sobre o Poder dos Heróis por nível).",
        level: 0,
        baseCost: 100,
        costMultiplier: 2.0
    },
    {
        id: "infirmary",
        name: "Enfermaria",
        description: "Acelera a recuperação de heróis feridos em +25% por nível.",
        level: 0,
        baseCost: 150,
        costMultiplier: 2.2
    },
    {
        id: "training_hall",
        name: "Centro de Treinamento",
        description: "Concede XP passivo (+1 XP/s por nível) para heróis disponíveis na guilda.",
        level: 0,
        baseCost: 200,
        costMultiplier: 2.5
    }
];

// Evolui uma construção
function upgradeBuilding(buildingId, event) {
    const building = availableBuildings.find(b => b.id === buildingId);
    if (!building) return;

    const currentCost = Math.floor(building.baseCost * Math.pow(building.costMultiplier, building.level));

    if (gameState.gold < currentCost) {
        if (event && event.currentTarget) triggerErrorEffect(event.currentTarget);
        return;
    }

    gameState.gold -= currentCost;
    building.level += 1;

    // Efeito imediato do dormitório
    if (building.id === "dormitory") {
        gameState.maxMembers += building.membersPerLevel;
    }

    if (typeof saveGame === 'function') saveGame();
    updateUI();
    renderBuildings();
}

// Obtém o nível atual de uma construção
function getBuildingLevel(buildingId) {
    const building = availableBuildings.find(b => b.id === buildingId);
    return building ? building.level : 0;
}
