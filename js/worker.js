postMessage("Starting Webworker");

let repClass = new class { };
let stop = true;
let messageCounter = 0;
let maxMessageCounter = 0;
let maxNodes = 0;
let newDataInterval = 1000;
let nodes = [];
let nodeIdToIndexId = [];
let referenceStorage = [];
let lastNewDataDuration = 0;

function sendUpdates() {
    postMessage({
        mode:"update",
        "nodes": nodes.length,
        messageCounter,
        storage: getAllStorages(),
        nodeIdToIndexId,
        referenceStorage,
        lastNewDataDuration,
    });

    setTimeout(sendUpdates, 3000);
}
sendUpdates();

function getAllStorages(){
    const storage = []
    for (const nodeIndex in nodes) {
        const node = nodes[nodeIndex];
        storage.push({id: nodeIdToIndexId[nodeIndex] ,store: node.dataCheck})
    }

    return storage;
}

onmessage = function (oEvent) {

    switch (oEvent.data.mode) {
        case "newFunction":
            maxMessageCounter = oEvent.data.maxMessages;
            maxNodes = oEvent.data.nodes;
            chaos = oEvent.data.chaos;
            newDataInterval = oEvent.data.newDataInterval;
            newFunction(oEvent.data.text);
            break;

        default:
            break;
    }
};

function start() {
    stop = false;
    nodes = [];
    nodeIdToIndexId = [];
    storage = [];
    referenceStorage = [];
    messageCounter = 0;
    lastNewDataDuration = 0;

    generateNodes();
    insertRandomData(0, nodes, storage);
}

function generateNodes() {
    for (let i = 0; i < maxNodes; i++) {
        nodeIdToIndexId[i] = getRndInteger(0, 999999999);

        nodes[i] = new repClass(
            nodeIdToIndexId[i],
            [nodeIdToIndexId[1], nodeIdToIndexId[2], nodeIdToIndexId[3]],
        );
    }
}

async function insertRandomData(i) {
    const start = performance.now();

    if(stop) return
    if (messageCounter > maxMessageCounter) return;
    messageCounter++;
    const randNode = getRndInteger(0, nodes.length - 1);

    
    //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    const randData = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    referenceStorage.push(randData);
    nodes[randNode].newData(randData);

    const end = performance.now();
    lastNewDataDuration = end - start;
    setTimeout(insertRandomData.bind(i + 1), newDataInterval);
}

function newFunction(text) {
    stop = true;

    const repFunction = new Function(text);

    repClass = repFunction();

    console.log("New Function Initiated");
    start();
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}