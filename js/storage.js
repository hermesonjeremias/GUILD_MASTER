// js/storage.js - Cuida de salvar e carregar o progresso no navegador

const SAVE_KEY = "guild_master_save_v1"; // Chave única para o LocalStorage

// Salva o estado atual do jogo no LocalStorage do navegador
function saveGame() {
    try {
        // Converte os objetos complexos de heróis em dados puros
        const saveData = {
            gold: gameState.gold,
            prestige: gameState.prestige,
            maxMembers: gameState.maxMembers,
            // Transforma as instâncias de Hero em objetos simples
            adventurers: gameState.adventurers.map(hero => ({
                id: hero.id,
                name: hero.name,
                heroClass: hero.heroClass,
                level: hero.level,
                xp: hero.xp,
                maxXp: hero.maxXp,
                stats: hero.stats,
                status: hero.status,
                injuryTimer: hero.injuryTimer
            })),
            // Salva os níveis atuais das construções
            buildings: availableBuildings.map(b => ({
                id: b.id,
                level: b.level
            }))
        };

        // Grava no armazenamento local como String em formato JSON
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch (e) {
        console.error("Erro ao salvar o jogo:", e);
    }
}

// Carrega o progresso salvo anteriormente
function loadGame() {
    try {
        const savedString = localStorage.getItem(SAVE_KEY);
        if (!savedString) return false; // Retorna falso se não houver jogo salvo

        const saveData = JSON.parse(savedString);

        // Restaura atributos globais
        gameState.gold = saveData.gold || 0;
        gameState.prestige = saveData.prestige || 0;
        gameState.maxMembers = saveData.maxMembers || 2;
        gameState.activeQuests = []; // Reseta missões em andamento ao carregar

        // Reconstrói as instâncias da classe Hero
        if (saveData.adventurers && Array.isArray(saveData.adventurers)) {
            gameState.adventurers = saveData.adventurers.map(data => {
                const hero = new Hero(data.id, data.name, data.heroClass);
                hero.level = data.level;
                hero.xp = data.xp;
                hero.maxXp = data.maxXp;
                hero.stats = data.stats;
                // Se estava em missão ao fechar o jogo, volta como disponível
                hero.status = (data.status === 'on_quest') ? 'available' : data.status;
                hero.injuryTimer = data.injuryTimer || 0;
                return hero;
            });
        }

        // Restaura os níveis das construções
        if (saveData.buildings && Array.isArray(saveData.buildings)) {
            saveData.buildings.forEach(savedB => {
                const b = availableBuildings.find(item => item.id === savedB.id);
                if (b) b.level = savedB.level;
            });
        }

        console.log("Progresso carregado com sucesso!");
        return true;
    } catch (e) {
        console.error("Erro ao carregar o jogo:", e);
        return false;
    }
}

// Reseta o progresso e reinicia o jogo do zero
function resetGameData() {
    if (confirm("Tem certeza que deseja apagar todo o seu progresso da guilda?")) {
        localStorage.removeItem(SAVE_KEY); // Apaga os dados gravados
        location.reload(); // Recarrega a página
    }
}
