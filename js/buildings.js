/* ==========================================================================
   BUILDINGS.JS - GERENCIAMENTO DE CONSTRUÇÕES E MELHORIAS DA GUILDA
   ========================================================================== */

/**
 * Lista de construções disponíveis para expansão e melhoria na guilda.
 */
const availableBuildings = [
    {
        id: "dormitory",
        name: "Dormitório",
        description: "Aumenta o limite máximo de aventureiros que a guilda pode abrigar (+2 vagas por nível).",
        level: 1,
        baseCost: 50,
        costMultiplier: 1.8,
        membersPerLevel: 2
    },
    {
        id: "contract_board",
        name: "Mural de Contratos",
        description: "Gera Ouro por segundo passivamente (+20% de eficiência sobre o Poder dos Heróis por nível).",
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
        description: "Concede XP passivo (+1 XP/s por nível) para todos os heróis disponíveis na guilda.",
        level: 0,
        baseCost: 200,
        costMultiplier: 2.5
    }
];

/**
 * Tenta realizar a compra ou melhoria de uma construção.
 * @param {string} buildingId - ID da construção que será evoluída
 * @param {Event} event - Evento de clique para feedback visual em caso de erro
 */
function upgradeBuilding(buildingId, event) {
    const building = availableBuildings.find(b => b.id === buildingId);
    if (!building) return;

    // Calcula o custo com base no nível atual
    const currentCost = Math.floor(building.baseCost * Math.pow(building.costMultiplier, building.level));

    // Se não tiver ouro suficiente, ativa o efeito de erro visual
    if (gameState.gold < currentCost) {
        if (event && event.currentTarget) triggerErrorEffect(event.currentTarget);
        return;
    }

    // Deduz o custo e aumenta o nível
    gameState.gold -= currentCost;
    building.level += 1;

    // Efeito imediato da construção de dormitório
    if (building.id === "dormitory") {
        gameState.maxMembers = 4 + (building.level * building.membersPerLevel);
    }

    // Persiste os dados e atualiza a interface
    if (typeof saveGame === 'function') saveGame();
    if (typeof updateUI === 'function') updateUI();
    if (typeof renderBuildings === 'function') renderBuildings();
}

/**
 * Retorna o nível atual de uma determinada construção.
 * @param {string} buildingId - ID da construção
 * @returns {number} Nível atual da construção ou 0 se não encontrada
 */
function getBuildingLevel(buildingId) {
    if (typeof availableBuildings === 'undefined' || !Array.isArray(availableBuildings)) return 0;
    const building = availableBuildings.find(b => b.id === buildingId);
    return building ? Number(building.level) || 0 : 0;
}
