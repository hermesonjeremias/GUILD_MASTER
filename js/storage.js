/* ==========================================================================
   STORAGE.JS - PERSISTÊNCIA, SALVAMENTO E CARREGAMENTO DO JOGO
   ========================================================================== */

const STORAGE_KEY = 'guild_manager_save_data';

/**
 * Salva o estado completo do jogo e o progresso das construções no localStorage.
 */
function saveGame() {
    try {
        const dataToSave = {
            gameState: gameState,
            buildings: availableBuildings.map(b => ({ id: b.id, level: b.level }))
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
        console.error("Erro ao salvar o progresso do jogo:", error);
    }
}

/**
 * Carrega o estado do jogo salvo e restaura as instâncias de classe e níveis.
 */
function loadGame() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;

    try {
        const parsed = JSON.parse(savedData);

        // Restaura as variáveis do gameState
        if (parsed.gameState) {
            Object.assign(gameState, parsed.gameState);

            // Reconstrói as instâncias dos heróis para reativar métodos da classe Hero
            if (Array.isArray(gameState.adventurers)) {
                gameState.adventurers = gameState.adventurers.map(heroData => {
                    const h = new Hero(heroData.id, heroData.name, heroData.heroClass);
                    Object.assign(h, heroData);
                    return h;
                });
            }
        }

        // Restaura os níveis das construções
        if (Array.isArray(parsed.buildings) && typeof availableBuildings !== 'undefined') {
            parsed.buildings.forEach(savedBuilding => {
                const building = availableBuildings.find(b => b.id === savedBuilding.id);
                if (building) {
                    building.level = savedBuilding.level;
                }
            });
        }
    } catch (error) {
        console.error("Erro ao carregar os dados salvos:", error);
    }
}

/**
 * Reseta todo o progresso do jogador e recarrega a página.
 */
function resetGame() {
    if (confirm("Tem certeza que deseja reiniciar todo o seu progresso na guilda?")) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }
}
