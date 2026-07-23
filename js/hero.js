/* ==========================================================================
   HERO.JS - CLASSE DE ADVENTUREIROS E EVOLUÇÃO
   ========================================================================== */

class Hero {
    constructor(id, name, heroClass) {
        this.id = id;
        this.name = name;
        this.heroClass = heroClass;
        this.level = 1;
        this.xp = 0;
        this.maxXp = 100;
        this.status = "available"; // "available", "on_quest", "injured"
        this.injuryTimer = 0;

        // Atributos base
        this.stats = {
            power: 10,
            defense: 5,
            speed: 5
        };

        this.applyClassBonus();
    }

    applyClassBonus() {
        switch (this.heroClass) {
            case "Guerreiro":
                this.stats.power += 5;
                this.stats.defense += 5;
                break;
            case "Mago":
                this.stats.power += 10;
                break;
            case "Padre":
                this.stats.defense += 8;
                break;
            case "Arqueiro":
                this.stats.speed += 8;
                this.stats.power += 3;
                break;
        }
    }

    gainXp(amount) {
        this.xp += amount;
        while (this.xp >= this.maxXp) {
            this.xp -= this.maxXp;
            this.levelUp();
        }
    }

    levelUp() {
        this.level += 1;
        this.maxXp = Math.floor(this.maxXp * 1.5);
        this.stats.power += 3;
        this.stats.defense += 2;
        this.stats.speed += 2;
    }
}
