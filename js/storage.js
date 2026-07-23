/* ==========================================================================
   STORAGE.JS - PERSISTÊNCIA, SALVAMENTO E CARREGAMENTO DO JOGO
   ========================================================================== */

const STORAGE_KEY = 'guild_manager_save_data';

function saveGame() {
    try {
        const dataToSave = {
            gameState: {
                gold: Number(gameState.gold) || 0,
                prestige: Number(gameState.prestige) || 0,
                maxMembers: Number(gameState.maxMembers) || 4,
                adventurers: gameState.adventurers,
                activeQuests: gameState.activeQuests
            },
            buildings: Array.isArray(availableBuildings) ? availableBuildings.map(b => ({ id: b.id, level: Number(b.level) || 0 })) : []
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
        console.error("Erro ao salvar o progresso do jogo:", error);
    }
}

function loadGame() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;

    try {
        const parsed = JSON.parse(savedData);

        if (parsed.gameState) {
            // Recupera ouro e previne NaN
            const loadedGold = Number(parsed.gameState.gold);
            gameState.gold = !isNaN(loadedGold) ? loadedGold : 100;

            const loadedPrestige = Number(parsed.gameState.prestige);
            gameState.prestige = !isNaN(loadedPrestige) ? loadedPrestige : 0;

            const loadedMax = Number(parsed.gameState.maxMembers);
            gameState.maxMembers = !isNaN(loadedMax) ? loadedMax : 4;

            // Restaura e re-instancia heróis com métodos intactos
            if (Array.isArray(parsed.gameState.adventurers)) {
                gameState.adventurers = parsed.gameState.adventurers.map(heroData => {
                    const h = new Hero(heroData.id, heroData.name, heroData.heroClass);
                    Object.assign(h, heroData);
                    
                    // Garante método de XP
                    if (typeof h.gainXp !== 'function') {
                        h.gainXp = Hero.prototype.gainXp;
                    }
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

        // Restaura construções
        if (Array.isArray(parsed.buildings) && typeof availableBuildings !== 'undefined') {
            parsed.buildings.forEach(savedBuilding => {
                const building = availableBuildings.find(b => b.id === savedBuilding.id);
                if (building) {
                    building.level = Number(savedBuilding.level) || 0;
                }
            });
        }

        // AUTO-CORREÇÃO: Sincroniza heróis com missões ativas para destravar
        if (Array.isArray(gameState.adventurers)) {
            gameState.adventurers.forEach(hero => {
                const questAtiva = gameState.activeQuests.find(q => q.heroId === hero.id);
                if (questAtiva) {
                    hero.status = "on_quest";
                } else if (hero.status === "on_quest") {
                    // Se o status dizia que estava em missão mas a missão sumiu do array, libera ele
                    hero.status = "available";
                }
            });
        }

    } catch (error) {
        console.error("Erro ao carregar dados salvos. Resetando save corrompido...", error);
        localStorage.removeItem(STORAGE_KEY);
    }
}

function resetGame() {
    if (confirm("Tem certeza que deseja reiniciar todo o seu progresso na guilda?")) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }
}
