// js/buildings.js - Gerencia as construções e melhorias da guilda

const availableBuildings = [
    {
        id: "dormitory",
        name: "Dormitório",
        description: "Aumenta o limite máximo de aventureiros que a guilda pode abrigar.",
        level: 1,
        baseCost: 50,
        costMultiplier: 1.8,
        membersPerLevel: 2
    }
];

// Evolui uma construção sem pop-ups de alerta
function upgradeBuilding(buildingId, event) {
    const building = availableBuildings.find(b => b.id === buildingId);
    if (!building) return;

    const currentCost = Math.floor(building.baseCost * Math.pow(building.costMultiplier, building.level));

    // Validação de Ouro: Se não tiver, pisca o botão e interrompe a função
    if (gameState.gold < currentCost) {
        if (event && event.currentTarget) triggerErrorEffect(event.currentTarget);
        return;
    }

    // Deduz ouro
    gameState.gold -= currentCost;

    // Sobe o nível
    building.level += 1;

    if (building.id === "dormitory") {
        gameState.maxMembers += building.membersPerLevel;
    }

    if (typeof saveGame === 'function') saveGame();
    updateUI();
    renderBuildings();
}
