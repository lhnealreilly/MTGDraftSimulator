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

var cardLayer = new Konva.Layer();
var topLayer = new Konva.Layer();
stage.add(cardLayer);
stage.add(topLayer);

let cards = [];
let selectArr = [];

const cardZones = document.getElementsByClassName("sub-card-zone");
let cardZoneRects = [];
for (let zone of cardZones) {
    cardZoneRects.push({ rect: zone.getBoundingClientRect(), cards: [], parent_id: zone.parentElement.id });
}

window.onresize = () => {
    stage.width(window.innerWidth);
    stage.height(window.innerHeight);
    for (let i = 0; i < cardZones.length; ++i) {
        let zone = cardZones[i]
        cardZoneRects[i].rect = zone.getBoundingClientRect();
    }
    for (let card of cards) {
        let scale = getSmallestZone();
        card.offsetX(scale * 2.5 / 2);
        card.offsetY(scale * 3.5 / 2);
        card.width(scale * 2.5);
        card.height(scale * 3.5);
    }
    relayerCardZones();
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
            stroke: 'blue',
            strokeWidth: 0,
        });
        card.on('dragstart', (e) => {
            if(selectArr.includes(card)){
                pickupCards(selectArr);
            }
            else{
                pickupCards([card]);
            }
        });
        card.on('dragmove', (e) =>{
            if(selectArr.includes(card)){
                for(let c1 of selectArr){
                    if(c1 != card){
                        c1.x(card.x());
                        c1.y(card.y());
                    }
                }
            }
        });
        card.on('dragend', (e) => {
            if(selectArr.includes(card)){
                dropCards(selectArr);
            }
            else{
                dropCards([card]);
            }
            clearSelected();
            stage.batchDraw();
        });
        // add the shape to the cardLayer
        cardLayer.add(card);
        cards.push(card);
    }
    imageObj.src = url;
}


function getSmallestZone() {
    let shortest = cardZoneRects[0].rect.height;
    let thinnest = cardZoneRects[0].rect.width;
    for (let zone of cardZoneRects) {
        if (zone.rect.height < shortest) {
            shortest = zone.rect.height;
        }
        if (zone.rect.width < thinnest) {
            shortest = zone.rect.width;
        }
    }
    return (shortest / 3.5 > thinnest / 2.5) ? thinnest / 2.5 : shortest / 3.5;
}

function dropCards(cards) {
    for(let card of cards){
        for (let zone of cardZoneRects) {
            if (inRect(zone.rect, card)) {
                zone.cards.push(card);
            }
        }
    }
    relayerCardZones();
}

function pickupCards(cards) {
    for(let card of cards){
        for (let zone of cardZoneRects) {
            if (inRect(zone.rect, card)) {
                if (zone.cards.includes(card)) {
                    zone.cards.splice(zone.cards.indexOf(card), 1);
                }
            }
        }
    }
    relayerCardZones();
}

const yOffset = 30;
function relayerCardZones() {
    for (let zone of cardZoneRects) {
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
    pickupCards(cards);
    for (let i = 0; i < cards.length; ++i) {
        cardZoneRects[i].cards.push(cards[i]);
        relayerCardZones();
    }
});

document.getElementById('side-board-button').addEventListener('click', () => {
    let side_board = cardZoneRects.find((x) => { console.log(x); if (x.parent_id === 'sideboard') return x; });
    console.log(side_board);
    pickupCards(cards);
    for (let i = 0; i < cards.length; ++i) {
        side_board.cards.push(cards[i]);
        relayerCardZones();
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

const delta = 6;
let startX;
let startY;
let mouseDown = false;

let selectRect = new Konva.Rect({
    visible: false,
    opacity: .3,
    fill: 'blue',
});
topLayer.add(selectRect);

stage.on('mousedown', function (event) {
    let mousePos = stage.getPointerPosition();
    startX = mousePos.x;
    startY = mousePos.y;
    if (event.target === stage) {
        mouseDown = true;
        clearSelected();
    }
});

stage.on('mousemove', function (event) {
    if (mouseDown) {
        let mousePos = stage.getPointerPosition();
        selectRect.x(startX);
        selectRect.y(startY);
        selectRect.width(mousePos.x - selectRect.x());
        selectRect.height(mousePos.y - selectRect.y());
        selectRect.visible(true);
    }
});

stage.on('mouseup', function (event) {
    let mousePos = stage.getPointerPosition();
    const diffX = Math.abs(mousePos.x - startX);
    const diffY = Math.abs(mousePos.y - startY);

    if (diffX < delta && diffY < delta) {
        clearSelected();
    }
    else if (mouseDown) {
        for (let card of cards) {
            if (hitCheck(selectRect, card)) {
                card.strokeWidth(4);
                selectArr.push(card);
            }
        }
    }

    selectRect.visible(false);
    mouseDown = false;
});


function hitCheck(shape1, card) {

    var s1 = shape1.getClientRect(); // use this to get bounding rect for shapes other than rectangles.
    var s2 = card.getClientRect();

    // corners of shape 1
    var X = s1.x;
    var Y = s1.y
    var A = s1.x + s1.width;
    var B = s1.y + s1.height;

    // corners of shape 2
    var X1 = s2.x;
    var A1 = s2.x + s2.width;
    var Y1 = s2.y;
    var B1 = s2.y + yOffset;
    // Simple overlapping rect collision test
    if (A < X1 || A1 < X || B < Y1 || B1 < Y) {
        return false
    }
    else {
        return true;
    }
}

function clearSelected(){
    for(let card of selectArr){
        card.strokeWidth(0);
    }
    selectArr = [];
}

async function initCards(){
    for (let zone of cardZoneRects) {
        let response = await fetch("https://api.scryfall.com/cards/random?-is:double-faced");
        if(response.ok){
            let responseJSON = await response.json();
            let img;
            addCard(responseJSON.image_uris.png);
        }
    }
}

initCards();








