let canvas;

let isRunning = false;

onmessage = function (oEvent) {

    switch (oEvent.data.mode) {
        case "canvas":
            canvas = oEvent.data.canvas
            break;
        case "data":
            generateNewCanvasData(oEvent.data)
            break;
    }
};

function generateNewCanvasData(data) {
    if(isRunning) return;
    isRunning = true;

    const referenceStorage = data.referenceStorage;
    const storage = data.storage;
    const nodes = data.nodes;
    if (!referenceStorage || !storage || referenceStorage.length == 0 || storage.length == 0){
        isRunning = false;
        return;
    };

    const imageData = [];

    //row
    for (let i = referenceStorage.length - 1; 0 <= i; i--) {

        for (let i2 = 0; i2 < storage.length; i2++) {
            const column = storage[i2];
            //column
            const currentReference = referenceStorage[i];

            if (column.indexOf(currentReference) !== -1) {
                imageData.push(0); //r
                imageData.push(255); //g
                imageData.push(0); //b
                imageData.push(255); //a
            } else {
                imageData.push(255); //r
                imageData.push(0); //g
                imageData.push(0); //b
                imageData.push(255); //a
            }
        }
    }

    postMessage({ width: storage.length, height: referenceStorage.length, imageData });
    isRunning = false;
}
