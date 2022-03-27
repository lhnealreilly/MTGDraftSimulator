import {getCard, getPack} from "./packCreate.js"

let userDeck = [];
let packArr = [];
let currPack = [];
let packIndex = 0;

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
                addToDeck(card); 
                pack.splice(i, 1);
                pickRandomFromAllPacksExceptCurrent(packIndex);
                currPack = packArr[(++packIndex)%packArr.length];
                packIndex = packIndex % packArr.length; 
                removeAllChildNodes(element); 
                renderCards(currPack, element, true);
                console.log(packArr);
            });
        }
        element.appendChild(cardImg);
    }
}

const deckDiv = document.getElementById('deck_holder');
function addToDeck(card){
    userDeck.push(card);
    renderCards([card], deckDiv, false);
}

const cardDiv = document.getElementById('pack_holder');

await createPacks(1);
currPack = packArr[packIndex];
renderCards(currPack, cardDiv, true);