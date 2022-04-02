//Methods that adjust the library

const ls = window.localStorage;

export class library {
    constructor () {
        this.userDeck = [];
        this.commandZone = [];
        if (JSON.parse(ls.getItem('deckObj') === null)) {
            userDeck = [];
        }
        else {
            userDeck = JSON.parse(ls.getItem('deckObj')).deck;
            commandZone = JSON.parse(ls.getItem('deckObj')).commandZone;
        }
    }
    drawCard() {
        return this.userDeck.shift();
    }
    shuffleDeck() {

    }
    drawN(n) {
        let newHand = [];
        for(let i = 0; i < n; i++){
            newHand[i] = this.userDeck.shift();
        }
        return newHand;
    }
}