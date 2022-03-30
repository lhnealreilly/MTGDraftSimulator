var width = window.innerWidth;
var height = window.innerHeight;

var stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height,
});
stage.container().style.position = 'absolute';
stage.container().style.top = '0';
stage.container().style.left = '0';

var layer = new Konva.Layer();
stage.add(layer);

let cards = [];

const cardZones = document.getElementsByClassName("sub-card-zone");
console.log(cardZones);
let cardZoneRects = [];
for (zone of cardZones) {
    cardZoneRects.push({ rect: zone.getBoundingClientRect(), cards: [], parent_id:zone.parentElement.id });
}

window.onresize = () => {
    stage.width = window.innerWidth;
    stage.height = window.innerHeight;
    for (let i = 0; i < cardZones.length; ++i) {
        let zone = cardZones[i]
        cardZoneRects[i].rect = zone.getBoundingClientRect();
    }
    for (card of cards) {
        let scale = getSmallestZone();
        card.offsetX(scale * 2.5 / 2);
        card.offsetY(scale * 3.5  / 2);
        card.width(scale * 2.5);
        card.height(scale * 3.5);
    }
    relayerZones();
}

function addCard(url) {
    var imageObj = new Image();
    let scale = getSmallestZone();
    imageObj.onload = function () {
        var card = new Konva.Image({
            x: 100,
            y: 250,
            offsetX: scale * 2.5 / 2,
            offsetY: scale * 3.5 / 2,
            image: imageObj,
            width: scale * 2.5,
            height: scale * 3.5,
            draggable: true,
        });
        card.on('dragstart', (e) => {
            pickupCard(card);
        });
        card.on('dragend', (e) => {
            console.log("Dropped");
            dropCard(card);
            stage.batchDraw();
        });
        // add the shape to the layer
        layer.add(card);
        cards.push(card);
    }
    imageObj.src = url;
}


function getSmallestZone() {
    let shortest = cardZoneRects[0].rect.height;
    let thinnest = cardZoneRects[0].rect.width;
    for (zone of cardZoneRects) {
        if (zone.rect.height < shortest) {
            shortest = zone.rect.height;
        }
        if(zone.rect.width < thinnest) {
            shortest = zone.rect.width;
        }
    }
    return (shortest/3.5 > thinnest/2.5) ? thinnest/2.5 : shortest / 3.5;
}

function dropCard(card) {
    for (zone of cardZoneRects) {
        if (inRect(zone.rect, card)) {
            zone.cards.push(card);
            relayerZones();
            return;
        }
    }
}

function pickupCard(card) {
    for (zone of cardZoneRects) {
        if (inRect(zone.rect, card)) {
            if (zone.cards.includes(card)) {
                zone.cards.splice(zone.cards.indexOf(card), 1);
            }
            relayerZones();
            return;
        }
    }
}

const yOffset = 30;
function relayerZones() {
    for (zone of cardZoneRects) {
        zone.cards.forEach((a, i) => { a.x(zone.rect.x + a.width() / 2); a.y(zone.rect.y + a.height() / 2 + i * yOffset); a.setZIndex(i) });
    }
}

function inRect(rect, card) {
    return (card.x() > rect.left && card.x() < rect.right && card.y() > rect.top && card.y() < rect.bottom);
}



let currentShape;
var menuNode = document.getElementById('menu');
document.getElementById('tap-button').addEventListener('click', () => {
    console.log(currentShape.rotation());
    if (currentShape.rotation() == 90) {
        currentShape.rotation(0);
    }
    else {
        currentShape.rotation(90);
    }
    console.log(currentShape.x());
});


document.getElementById('delete-button').addEventListener('click', () => {
    currentShape.destroy();
});

document.getElementById('fill-button').addEventListener('click', () => {
    for(let i = 0; i < cards.length; ++i){
        pickupCard(cards[i]);
        cardZoneRects[i].cards.push(cards[i]);
        relayerZones();
    }
});

document.getElementById('side-board-button').addEventListener('click', () => {
    let side_board = cardZoneRects.find((x) => {console.log(x); if(x.parent_id === 'sideboard') return x;}); 
    console.log(side_board);
    for(let i = 0; i < cards.length; ++i){
        pickupCard(cards[i]);
        side_board.cards.push(cards[i]);
        relayerZones();
    }
});

window.addEventListener('click', () => {
    // hide menu
    menuNode.style.display = 'none';
});

stage.on('contextmenu', function (e) {
    // prevent default behavior
    e.evt.preventDefault();
    if (e.target === stage) {
        // if we are on empty place of the stage we will do nothing
        return;
    }
    currentShape = e.target;
    // show menu
    menuNode.style.display = 'initial';
    var containerRect = stage.container().getBoundingClientRect();
    menuNode.style.top =
        containerRect.top + stage.getPointerPosition().y + 4 + 'px';
    menuNode.style.left =
        containerRect.left + stage.getPointerPosition().x + 4 + 'px';
});

for(zone of cardZoneRects){
    addCard("https://c1.scryfall.com/file/scryfall-cards/png/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.png?1614638838");
}





