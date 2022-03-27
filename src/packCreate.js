

async function getCard (uri) {
    const response = await fetch(uri);

    if(response.ok){
        item = await response.json;

        
    }
}

getCard("https://api.scryfall.com/cards/random?q=%28block%3Ahtr+or+set%3Acmb2+or+%28set%3Apcel+%28t%3Acreature+or+t%3Asummon%29%29+or+%28border%3Asilver+and+usd>%3D7%29%29+-is%3Atoken");