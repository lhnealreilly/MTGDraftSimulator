


function getPack(){

}

async function getCard(query){

}

function renderPack(pack, element){
    for(const card of pack){
        let cardImg = document.createElement(image);
        cardImg.class = "card";
        cardImg.src = card.img;
        element.appendChild(cardImg);
    }
}