/* ==========================================================================
   BUILDINGS.JS - CONSTRUÇÕES E MELHORIAS DA GUILDA
   ========================================================================== */

const availableBuildings = [
    {
        id: "dormitory",
        name: "Dormitório",
        description: "Aumenta o limite máximo de aventureiros da guilda (+2 vagas por nível).",
        level: 1,
        baseCost: 50,
        costMultiplier: 1.8,
        membersPerLevel: 2
    },
    {
        id: "contract_board",
        name: "Mural de Contratos",
        description: "Gera Ouro passivo por segundo baseado no poder dos seus aventureiros.",
        level: 0,
        baseCost: 100,
        costMultiplier: 2.0
    },
    {
        id: "infirmary",
        name: "Enfermaria",
        description: "Acelera a recuperação natural de heróis feridos em +25% por nível.",
        level: 0,
        baseCost: 150,
        costMultiplier: 2.2
    },
    {
        id: "training_hall",
        name: "Centro de Treinamento",
        description: "Concede XP passivo para heróis disponíveis que estão na guilda.",
        level: 0,
        baseCost: 200,
        costMultiplier: 2.5
    }
];

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

    if (building.id === "dormitory") {
        gameState.maxMembers = 4 + (building.level * building.membersPerLevel);
    }

    if (typeof saveGame === 'function') saveGame();
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderBuildings === 'function') renderBuildings();
}

function getBuildingLevel(buildingId) {
    if (typeof availableBuildings === 'undefined' || !Array.isArray(availableBuildings)) return 0;
    const building = availableBuildings.find(b => b.id === buildingId);
    return building ? Number(building.level) || 0 : 0;
}
