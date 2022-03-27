import {getCard, getPack} from "./packCreate.js"

let userDeck = [];
let packArr = [];
let currPack = [];
let packIndex = 0;

let cardSelected;
let cardSelectedIndex;

async function createPacks(n){
    for(let i = 0; i < n; ++i){
        packArr.push(await getPack());
    }
}

function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function clearSelectedCards(parent) {
    for(const child of parent.children) {
        child.classList.remove("selected");
    }
}

function pickRandomFromAllPacksExceptCurrent(currIndex){
    for(let i = 0; i < packArr.length; ++i)
    if(i !== currIndex){
        packArr[i].splice(Math.random()*packArr[i].length, 1);
    }
}

function renderCards(pack, element, clickEvent){
    for(let i = 0; i < pack.length; ++i){
        let card = pack[i]
        const cardImg = document.createElement("img");
        cardImg.classList.add("card");
        cardImg.src = card.img;
        if(card.back !== ""){
            cardImg.addEventListener("mouseover", () => {cardImg.src = card.back});
            cardImg.addEventListener("mouseout", () => {cardImg.src = card.img});
        }
        if(clickEvent){
            cardImg.addEventListener("mouseup", () => {
                cardSelected = card;
                cardSelectedIndex = i;
                clearSelectedCards(element)
                cardImg.classList.add("selected")
                console.log(packArr);
            });
        }
        element.appendChild(cardImg);
    }
}

function confirmSelection(element){
    if(cardSelected !== undefined){
        addToDeck(cardSelected); 
        currPack.splice(cardSelectedIndex, 1);
        pickRandomFromAllPacksExceptCurrent(packIndex);
        currPack = packArr[(++packIndex)%packArr.length];
        packIndex = packIndex % packArr.length; 
        removeAllChildNodes(element); 
        renderCards(currPack, element, true);
        cardSelected = undefined;
    }
}



const deckDiv = document.getElementById('deck_holder');
function addToDeck(card){
    userDeck.push(card);
    renderCards([card], deckDiv, false);
}

const cardDiv = document.getElementById('pack_holder');

await createPacks(2);
currPack = packArr[packIndex];
renderCards(currPack, cardDiv, true);

const confirmButton = document.getElementById('confirm');
confirmButton.addEventListener("click", () => {confirmSelection(cardDiv)});