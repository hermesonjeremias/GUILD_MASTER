/* ==========================================================================
   STORAGE.JS - CARREGAMENTO E AUTO-CORREÇÃO DE DADOS
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
            buildings: availableBuildings.map(b => ({ id: b.id, level: Number(b.level) || 0 }))
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
        console.error("Erro ao salvar o jogo:", e);
    }
}

function loadGame() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;

    try {
        const parsed = JSON.parse(savedData);

        if (parsed.gameState) {
            gameState.gold = Number(parsed.gameState.gold) || 100;
            gameState.prestige = Number(parsed.gameState.prestige) || 0;
            gameState.maxMembers = Number(parsed.gameState.maxMembers) || 4;

            if (Array.isArray(parsed.gameState.adventurers)) {
                gameState.adventurers = parsed.gameState.adventurers.map(data => {
                    const hero = new Hero(data.id, data.name, data.heroClass);
                    Object.assign(hero, data);
                    return hero;
                });
            }

            gameState.activeQuests = Array.isArray(parsed.gameState.activeQuests) ? parsed.gameState.activeQuests : [];
        }

        if (Array.isArray(parsed.buildings)) {
            parsed.buildings.forEach(savedB => {
                const b = availableBuildings.find(item => item.id === savedB.id);
                if (b) b.level = Number(savedB.level) || 0;
            });
        }

        // Sincroniza estado de heróis destravando o status caso haja inconsistência
        if (Array.isArray(gameState.adventurers)) {
            gameState.adventurers.forEach(hero => {
                const quest = gameState.activeQuests.find(q => q.heroId === hero.id);
                if (quest) {
                    hero.status = "on_quest";
                } else if (hero.status === "on_quest") {
                    hero.status = "available";
                }
            });
        }
    } catch (e) {
        console.error("Erro ao carregar dados. Resetando save...", e);
        localStorage.removeItem(STORAGE_KEY);
    }
}

function resetGame() {
    if (confirm("Deseja reiniciar seu progresso na guilda do zero?")) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }
}
