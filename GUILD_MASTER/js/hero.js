// js/hero.js

class Hero {
    constructor(id, name, heroClass) {
        this.id = id;
        this.name = name;
        this.heroClass = heroClass; // "Guerreiro", "Mago", "Padre", "Arqueiro"
        this.level = 1;
        this.xp = 0;
        this.maxXp = 100;
        
        // Status atual: "available" (disponível), "on_quest" (em missão), "injured" (ferido)
        this.status = "available"; 
        
        // Tempo de ferimento restante em segundos (se estiver ferido)
        this.injuryTimer = 0; 

        // Atributos base calculados com base na classe
        this.stats = this.calculateBaseStats();
    }

    // Define os atributos base do herói dependendo da sua classe
    calculateBaseStats() {
        switch (this.heroClass) {
            case "Guerreiro":
                return { power: 15, defense: 20, speed: 10 };
            case "Mago":
                return { power: 25, defense: 5, speed: 12 };
            case "Padre":
                return { power: 10, defense: 12, speed: 10 };
            case "Arqueiro":
                return { power: 18, defense: 10, speed: 18 };
            default:
                return { power: 10, defense: 10, speed: 10 };
        }
    }

    // Função para ganhar XP e subir de nível
    addXP(amount) {
        this.xp += amount;
        if (this.xp >= this.maxXp) {
            this.levelUp();
        }
    }

    levelUp() {
        this.xp -= this.maxXp;
        this.level += 1;
        this.maxXp = Math.floor(this.maxXp * 1.5); // Aumenta XP necessário pro próximo nível

        // Aumenta atributos ao subir de nível
        this.stats.power += 3;
        this.stats.defense += 2;
        this.stats.speed += 2;

        console.log(`${this.name} subiu para o nível ${this.level}!`);
    }
}
