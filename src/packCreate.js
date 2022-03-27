

async function getCard(uri) {
    const response = await fetch(uri);
    if (response.ok) {
        const responseJSON = await response.json();
        console.log(responseJSON);
        let cardName = responseJSON.name;
        let img_url = "";
        let card_back = "";
        let color_identity = responseJSON.color_identity;
        if (responseJSON.card_faces !== undefined) {
            img_url = responseJSON.card_faces[0].image_uris.small;
            card_back = responseJSON.card_faces[1].image_uris.small;
        }
        else {
            img_url = responseJSON.image_uris.small;
        }
        return {name:cardName, img:img_url, back:card_back, color:color_identity};
    }
}

async function getPack(){
    let pack = [];
    //land
    pack.push(await getCard("https://api.scryfall.com/cards/random?q=usd>%3D10+t%3Aland"));
    //Foil Analog
    pack.push(await getCard("https://api.scryfall.com/cards/random?q=%28block%3Ahtr+or+set%3Acmb2+or+%28set%3Apcel+%28t%3Acreature+or+t%3Asummon%29%29+or+%28border%3Asilver+and+usd>%3D7%29%29+-is%3Atoken"));
    //Rare Analog
    pack.push(await getCard("https://api.scryfall.com/cards/random?q=%28usd>%3D100+-is%3Atoken+-t%3Aland"));
    //Uncommon Analog
    for(let i = 0; i < 3; ++i){
        pack.push(await getCard("https://api.scryfall.com/cards/random?q=%28usd>%3D10+-is%3Atoken+-t%3Aland"));
    }
    //Common Analog
    for(let i = 0; i < 10; ++i){
        pack.push(await getCard("https://api.scryfall.com/cards/random?q=%28rarity%3Arare+or+rarity%3Amythic%29%28-is%3Atoken+-t%3Aland+-is%3Adigital+-set%3Apcel+-block%3Ahtr+-set%3Acmb2+-set%3Acmb1"));
    }

    //for(let i = 0; i < 15; ++i){
    //    pack.push(await getCard("https://api.scryfall.com/cards/random?q=usd%3E%3D10+t%3Aland"));
    //}
    return pack;
}


export {getPack, getCard };