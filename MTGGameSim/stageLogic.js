var width = window.innerWidth;
var height = window.innerHeight;

var stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height,
});

var layer = new Konva.Layer();
stage.add(layer);

function addCard(url) {
    var imageObj = new Image();
    imageObj.onload = function () {
        var card = new Konva.Image({
            x: 100,
            y: 250,
            offsetX: 100,
            offsetY: 200 * 3.5 / (2.5*2),
            image: imageObj,
            width: 200,
            height: 200 * 3.5 / 2.5,
            draggable: true,
        });
        let blockHeight = 200 * 3.5 / 2.5;
        let blockWidth = 200;
        card.on('dragend', (e) => {
            card.position({
                y: Math.max(0+ card.offsetY(), Math.min(Math.round((card.y()-card.offsetY()) / blockHeight)  * blockHeight + card.offsetY(), Math.floor(height/blockHeight)*blockHeight)),
                x: Math.max(0+ card.offsetX(), Math.min(Math.round((card.x()-card.offsetX()) / blockWidth)  * blockWidth + card.offsetX(), Math.floor(width/blockWidth)*blockWidth)),
            });
            stage.batchDraw();
        });
        // add the shape to the layer
        layer.add(card);
    }
    imageObj.src = url;
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

addCard("https://c1.scryfall.com/file/scryfall-cards/png/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.png?1614638838");
addCard("https://c1.scryfall.com/file/scryfall-cards/png/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.png?1614638838");
addCard("https://c1.scryfall.com/file/scryfall-cards/png/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.png?1614638838");
addCard("https://c1.scryfall.com/file/scryfall-cards/png/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.png?1614638838");
addCard("https://c1.scryfall.com/file/scryfall-cards/png/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.png?1614638838");

