

async function getCard(uri) {
    const response = await fetch(uri);
    if (response.ok) {
        const responseJSON = await response.json();
        console.log(responseJSON);
        let cardName = responseJSON.name;
        let img_url = "";
        let card_back = "";
        if (responseJSON.card_faces !== undefined) {
            img_url = responseJSON.card_faces[0].image_uris.small;
            card_back = responseJSON.card_faces[1].image_uris.small;
        }
        else {
            img_url = responseJSON.image_uris.small;
        }
        return {name:cardName, img:img_url, back:card_back};
    }
}

async function getPack(){
    let pack = [];
    for(let i = 0; i < 15; ++i){
        pack.push(await getCard("https://api.scryfall.com/cards/random?q=usd%3E%3D10+t%3Aland"));
    }
    return pack;
}


export {getPack, getCard };