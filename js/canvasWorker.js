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
    const referenceStorage = data.referenceStorage;
    const storage = data.storage;
    
    const canvasArray = [];
    
    for (const item of referenceStorage) {
        const tmp = [];
        for (const node of storage) {
            
        }
    }
}
