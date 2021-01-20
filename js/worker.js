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
let setMaxData = 500;
let sendMessageCooldown = 333;

function sendUpdates() {
    postMessage({
        mode: "update",
        "nodes": nodes.length,
        messageCounter,
        storage: getAllStorages(),
        nodeIdToIndexId,
        referenceStorage,
        lastNewDataDuration,
    });

    setTimeout(sendUpdates, 250);
}
sendUpdates();

function getAllStorages() {
    const storage = []
    for (const nodeIndex in nodes) {
        const node = nodes[nodeIndex];
        storage.push(node.dataCheck)
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
            setMaxData = oEvent.data.setMaxData;
            sendMessageCooldown = oEvent.data.sendMessageCooldown;
            newFunction(oEvent.data.text);
            break;
        case "stop":
            this.stop = true;
            console.log("STOP");
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
    insertRandomData();
}

function generateNodes() {
    const seeds = {
        "A": 1,
        "B": 2,
        "C": 3,
    }
    for (let i = 0; i < maxNodes; i++) {
        nodeIdToIndexId[i] = getRndInteger(0, 999999999);

        nodes[i] = new repClass(
            nodeIdToIndexId[i],
            seeds,
        );
    }

    seeds.A = nodeIdToIndexId[1];
    seeds.B = nodeIdToIndexId[2];
    seeds.C = nodeIdToIndexId[3];
}

async function insertRandomData() {
    const start = performance.now();
    if (this.stop) return
    if (messageCounter > maxMessageCounter) return;
    if (setMaxData <= referenceStorage.length) return;

    messageCounter++;
    const randNode = getRndInteger(0, nodes.length - 1);


    //http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    const randData = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    referenceStorage.push(randData);
    nodes[randNode].newData(randData);

    const end = performance.now();
    lastNewDataDuration = end - start;
    setTimeout(insertRandomData, newDataInterval);
}

function newFunction(text) {
    this.stop = false;

    const repFunction = new Function(text);

    repClass = repFunction();

    console.log("New Function Initiated");
    start();
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//nodeMessaging functions
const sendActive = [];

function sendData($this, receiverId, message) {
    if (this.stop || sendActive[$this.ownId]) return false;
    if(messageCounter > maxMessageCounter) return false;

    messageCounter++;
    sendActive[$this.ownId] = true;
    
    setTimeout(() => {
        nodes[nodeIdToIndexId.indexOf(receiverId)].receiveMessage($this.ownId, message);

        sendActive[$this.ownId] = false;
    }, sendMessageCooldown);

    return true;
}