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

//Layer for cards and Layer for overlay stuff such as selection Rectangles
var cardLayer = new Konva.Layer();
var topLayer = new Konva.Layer();
stage.add(cardLayer);
stage.add(topLayer);

//All cards are stored as well as all of the currenet selected cards
let cards = [];
let selectArr = [];

//Constants to offset stacks of cards and the percentage of the card to crop
const yOffset = 25;
const cropPercentage = 10/16;

//Get all of the zones in the document that are zones to put cards in
const cardZones = document.getElementsByClassName("sub-card-zone");
let cardZoneRects = [];

//Process the zones and get the rectangles. The object also stores the cards in the rectangles and a referenece to the parent div ID
for (let zone of cardZones) {
    cardZoneRects.push({ rect: zone.getBoundingClientRect(), cards: [], parent_id: zone.parentElement.id });
}

//When the window resizes, resize all of the cards to fit(roughly)
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
        card.offsetY(scale * 3.5 / 2 * cropPercentage);
        card.width(scale * 2.5);
        card.height(scale * 3.5 * cropPercentage);
    }
    relayerCardZones();
}

//These event listeners deal keep track of the currently pressed keys for use in other functions
let keyDownObject = {};
document.addEventListener('keydown', (event) => {
    var name = event.key;
    var code = event.code;
    // Alert the key name and key code on keydown
    keyDownObject[name] = true;
}, false);
document.addEventListener('keyup', (event) => {
    var name = event.key;
    var code = event.code;
    // Alert the key name and key code on keydown
    keyDownObject[name] = false;
}, false);


/**
 * Creats a card from an image url and adds it to layer.
 * @param {String} url 
 */
function addCard(url) {
    var imageObj = new Image();
    let scale = getSmallestZone();
    imageObj.onload = function () {
        var card = new Konva.Image({
            x: 100,
            y: 250,
            offsetX: scale * 2.5 / 2,
            offsetY: scale * 3.5/ 2 * cropPercentage,
            image: imageObj,
            width: scale * 2.5,
            height: scale * 3.5*cropPercentage,
            draggable: true,
            stroke: '#00FFFF',
            strokeWidth: 0,
        });
        //Crop the image to to the desired height
        card.crop({
            x: 0, 
            y: 0, 
            width: imageObj.width,
            height: imageObj.height*cropPercentage,
        });
        //Clone the card to use as a popup for more details
        let popup = card.clone();
        popup.crop({
            x: 0, 
            y: 0, 
            width: imageObj.width,
            height: imageObj.height,
        });
        popup.height(scale* 7);
        popup.width(scale*5);
        popup.visible(false);

        //When you mouse over the card, show the popup inside the window
        card.on('mouseenter', (e) =>{
            if(card.x() + card.width() + popup.width() > window.innerWidth){
                popup.x(card.x() - popup.width());
            }
            else{
                popup.x(card.x() + card.width());
            }
            if(card.y() + popup.height() < window.innerHeight){
                popup.y(card.y());
            }
            else{
                popup.y(card.y() - popup.height() + card.height());
            }
            popup.visible(true);
        });
        //Hide the popup
        card.on('mouseleave', (e) =>{
            popup.visible(false);
        });
        topLayer.add(popup);

        //Double clicking while holding shift selects all of the cards in the zone of the card double-clicked
        card.on('dblclick', (e) => {
            if (keyDownObject['Shift']) {
                for (let zone of cardZoneRects) {
                    if (zone.cards.includes(card)) {
                        addSelection(zone.cards);
                        return;
                    }
                }
            }
        });
        //Dagging the card
        card.on('dragstart', (e) => {
            popup.visible(false);
            //If the shift key is down, don't start dragging
            if (keyDownObject['Shift']) {
                card.draggable(false);
                card.draggable(true);
                return;
            }
            //If the card is part of a group selection pick up the whole selection
            if (selectArr.includes(card)) {
                pickupCards(selectArr);
            }
            //Otherwise just pickup that card
            else {
                pickupCards([card]);
            }
        });
        //During drag
        card.on('dragmove', (e) => {
            //If the card is part of a selected group, move the group with the card
            if (selectArr.includes(card)) {
                for (let i = 0; i < selectArr.length; ++i) {
                    let c1 = selectArr[i];
                    if (c1 != card) {
                        c1.x(card.x());
                        c1.y(card.y() + (i - selectArr.indexOf(card)) * yOffset);
                    }
                    //Set the z-index in selection order(same as old zone)
                    c1.zIndex(cards.length - selectArr.length + i);
                }
            }
        });
        //On ending drag
        card.on('dragend', (e) => {
            if (keyDownObject['Shift']) {
                return;
            }
            if (selectArr.includes(card)) {
                dropCards(card, selectArr);
            }
            else {
                dropCards(card, [card]);
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

/**
 * Finds the smallest (either thinnest or shortest after scaling) zone in order to scale the cards. Returns a base scaling factor
 * @returns {Number}
 */
function getSmallestZone() {
    let shortest = cardZoneRects[0].rect.height;
    let thinnest = cardZoneRects[0].rect.width;
    for (let zone of cardZoneRects) {
        if (zone.rect.height < shortest) {
            shortest = zone.rect.height;
        }
        if (zone.rect.width < thinnest) {
            thinnest = zone.rect.width;
        }
    }
    console.log(shortest, thinnest);
    return (shortest / (3.5 * cropPercentage) > thinnest / 2.5) ? thinnest / 2.5 : shortest/(3.5*cropPercentage);
}

/**
 * Takes in a card as the "control" and an array of cards. Puts all cards into the zone where the control card is within.
 * @param {Object<card>} baseCard 
 * @param {[]Object<card>} cards 
 */
function dropCards(baseCard, cards) {
    let targetZone;
    for (let zone of cardZoneRects) {
        if (inRect(zone.rect, baseCard)) {
            targetZone = zone;
        }
    }
    if (targetZone != undefined) {
        for (let card of cards) {
            targetZone.cards.push(card);
        }
    }
    relayerCardZones();
}

/**
 * Takes an array of cards and removes them from their zones.
 * @param {[]Object<card>} cards 
 */
function pickupCards(cards) {
    for (let card of cards) {
        for (let zone of cardZoneRects) {
            if (zone.cards.includes(card)) {
                zone.cards.splice(zone.cards.indexOf(card), 1);
            }
        }
    }
    relayerCardZones();
}


/**
 * Goes through each card zone and layers the cards nicely using yOffset and changing the ZIndex to be in order top to bottom
 */
function relayerCardZones() {
    for (let zone of cardZoneRects) {
        zone.cards.forEach((a, i) => { a.x(zone.rect.x + a.width() / 2); a.y(zone.rect.y + a.height() / 2 + i * yOffset); a.setZIndex(i) });
    }
}

/**
 * Checks if a card is in a rectangle.
 * @param {Object<rect>} rect 
 * @param {Object<card>} card 
 * @returns {Boolean}
 */
function inRect(rect, card) {
    return (card.x() > rect.left && card.x() < rect.right && card.y() > rect.top && card.y() < rect.bottom);
}



/**
 * 
 * 
 * Context menu functions
 * 
 * 
 */
 let currentShape;
 var menuNode = document.getElementById('menu');
document.getElementById('tap-button').addEventListener('click', () => {
    console.log(currentShape.rotation());
    if (selectArr.includes(currentShape)) {
        for (let card of selectArr) {
            if (card.rotation() == 90) {
                card.rotation(0);
            }
            else {
                card.rotation(90);
            }
        }
    }
    else {
        if (currentShape.rotation() == 90) {
            currentShape.rotation(0);
        }
        else {
            currentShape.rotation(90);
        }
    }
});

document.getElementById('fill-button').addEventListener('click', () => {
    pickupCards(cards);
    for (let i = 0; i < cards.length; ++i) {
        cardZoneRects[i].cards.push(cards[i]);
        relayerCardZones();
    }
});

document.getElementById('side-board-button').addEventListener('click', () => {
    let side_board = cardZoneRects.find((x) => { console.log(x); if (x.parent_id === 'stack') return x; });
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

//This rectangle is used to select cards
let selectRect = new Konva.Rect({
    visible: false,
    opacity: .3,
    fill: 'blue',
});
topLayer.add(selectRect);

stage.on('mousedown', function (event) {
    console.log(event.evt.button);
    //Checks if it is a left-click
    if (event.evt.button === 0) {
        let mousePos = stage.getPointerPosition();
        startX = mousePos.x;
        startY = mousePos.y;
        //If the click is not on a object or the shift key is down, start dragging and clear selected cards
        if (event.target === stage || keyDownObject['Shift']) {
            mouseDown = true;
            clearSelected();
        }
    }
});

stage.on('mousemove', function (event) {
    if (mouseDown) {
        //Show the selection rectangle and update it's position
        let mousePos = stage.getPointerPosition();
        selectRect.x(startX);
        selectRect.y(startY);
        selectRect.width(mousePos.x - selectRect.x());
        selectRect.height(mousePos.y - selectRect.y());
        selectRect.visible(true);
    }
});

stage.on('mouseup', function (event) {
    if (event.evt.button === 0) {
        let mousePos = stage.getPointerPosition();
        const diffX = Math.abs(mousePos.x - startX);
        const diffY = Math.abs(mousePos.y - startY);

        //If the difference is very small, it is probably just a click
        if (diffX < delta && diffY < delta) {
            clearSelected();
        }
        else if (mouseDown) {
            //Add the cards inside the rectangle to the selected cards array
            for (let zone of cardZoneRects) {
                for (let card of zone.cards) {
                    if (hitCheck(selectRect, card)) {
                        addSelection([card]);
                    }
                }
            }
        }
        //Hide selection rectangle
        selectRect.visible(false);
        mouseDown = false;
    }
});


//Checks if a card is in a shapes bounding rect
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
    var B1 = s2.y + yOffset; //This checks if the rect covers the space near the top of the card specifically
    // Simple overlapping rect collision test
    if (A < X1 || A1 < X || B < Y1 || B1 < Y) {
        return false
    }
    else {
        return true;
    }
}

//Clears the selected cards of the highlight and clears the array
function clearSelected() {
    for (let card of selectArr) {
        card.strokeWidth(0);
    }
    selectArr = [];
}

//Add the cards to the selected cards array and sets the strokewidth to highlight the cards
function addSelection(cardArr) {
    for (let card of cardArr) {
        card.strokeWidth(4);
        selectArr.push(card);
    }
}

//For now adds a card for each sub-card-zone
async function initCards() {
    for (let zone of cardZoneRects) {
        let response = await fetch("https://api.scryfall.com/cards/random?-is:double-faced+version=png");
        if (response.ok) {
            let responseJSON = await response.json();
            let img;
            addCard(responseJSON.image_uris.png);
        }
    }
}

initCards();








