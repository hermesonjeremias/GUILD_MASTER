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
            gameState: {
                gold: gameState.gold,
                prestige: gameState.prestige,
                maxMembers: gameState.maxMembers,
                adventurers: gameState.adventurers,
                activeQuests: gameState.activeQuests
            },
            buildings: availableBuildings.map(b => ({ id: b.id, level: b.level }))
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
        console.error("Erro ao salvar o progresso do jogo:", error);
    }
}

/**
 * Carrega o estado do jogo salvo, re-instancia os heróis e restaura missões.
 */
function loadGame() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;

    try {
        const parsed = JSON.parse(savedData);

        if (parsed.gameState) {
            if (typeof parsed.gameState.gold === 'number' && !isNaN(parsed.gameState.gold)) {
                gameState.gold = parsed.gameState.gold;
            }
            if (typeof parsed.gameState.prestige === 'number') {
                gameState.prestige = parsed.gameState.prestige;
            }
            if (typeof parsed.gameState.maxMembers === 'number') {
                gameState.maxMembers = parsed.gameState.maxMembers;
            }

            // Restaura e recria a classe Hero garantindo que o método gainXp exista
            if (Array.isArray(parsed.gameState.adventurers)) {
                gameState.adventurers = parsed.gameState.adventurers.map(heroData => {
                    const h = new Hero(heroData.id, heroData.name, heroData.heroClass);
                    Object.assign(h, heroData);
                    if (!h.stats) {
                        h.stats = { power: 10, defense: 5, speed: 5 };
                    }
                    return h;
                });
            }

            if (Array.isArray(parsed.gameState.activeQuests)) {
                gameState.activeQuests = parsed.gameState.activeQuests;
            } else {
                gameState.activeQuests = [];
            }
        }

        // Restaura as construções
        if (Array.isArray(parsed.buildings) && typeof availableBuildings !== 'undefined') {
            parsed.buildings.forEach(savedBuilding => {
                const building = availableBuildings.find(b => b.id === savedBuilding.id);
                if (building) {
                    building.level = Number(savedBuilding.level) || 0;
                }
            });
        }

        // Trava de segurança: Se houver missões pendentes para heróis que sumiram, destrava o status
        if (Array.isArray(gameState.adventurers)) {
            gameState.adventurers.forEach(hero => {
                if (hero.status === "on_quest") {
                    const hasActiveQuest = gameState.activeQuests.some(q => q.heroId === hero.id);
                    if (!hasActiveQuest) {
                        hero.status = "available";
                    }
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
