import {getCard, getPack} from "./packCreate.js"


async function renderPack(pack, element){
    for(const card of pack){
        console.log(card.img);
        const cardImg = document.createElement("img");
        cardImg.class = "card";
        cardImg.src = card.img;
        if(card.back !== ""){
            cardImg.addEventListener("mouseover", () => {cardImg.src = card.back});
            cardImg.addEventListener("mouseout", () => {cardImg.src = card.img});
        }
        element.appendChild(cardImg);
    }
}

const cardDiv = document.getElementById('card_holder');
renderPack(await getPack(), cardDiv);