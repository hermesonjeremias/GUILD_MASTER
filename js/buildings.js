// js/buildings.js - Gerencia as construções e melhorias da guilda

// Lista de construções disponíveis para compra e evolução
const availableBuildings = [
    {
        id: "dormitory", // Identificador único da construção
        name: "Dormitório", // Nome exibido na interface
        description: "Aumenta o limite máximo de aventureiros que a guilda pode abrigar.", // Descrição funcional
        level: 1, // Nível inicial
        baseCost: 50, // Custo inicial em ouro
        costMultiplier: 1.8, // Multiplicador de custo a cada nível evoluído
        membersPerLevel: 2 // Quantidade de vagas de heróis adicionadas por nível
    }
];

// Função para comprar ou subir o nível de uma construção
function upgradeBuilding(buildingId) {
    // Busca o objeto da construção pelo ID fornecido
    const building = availableBuildings.find(b => b.id === buildingId);

    // Validação de segurança: se a construção não existir
    if (!building) {
        alert("Construção não encontrada!");
        return;
    }

    // Calcula o custo atual baseado no nível da construção
    const currentCost = Math.floor(building.baseCost * Math.pow(building.costMultiplier, building.level));

    // Validação: verifica se o jogador possui ouro suficiente
    if (gameState.gold < currentCost) {
        alert("Ouro insuficiente na guilda para realizar esta melhoria!");
        return;
    }

    // Deduz o custo em ouro do saldo da guilda
    gameState.gold -= currentCost;

    // Incrementa o nível da construção
    building.level += 1;

    // Aplica as melhorias específicas da construção
    if (building.id === "dormitory") {
        // Eleva o limite máximo de heróis no gameState da guilda
        gameState.maxMembers += building.membersPerLevel;
    }

    console.log(`Construção ${building.name} evoluída para o Nível ${building.level}!`);

    // Atualiza a interface gráfica para mostrar os novos dados
    updateUI();
    renderBuildings();
}
