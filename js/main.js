function ge(id) {
    return document.getElementById(id);
}

const editor = monaco.editor.create(document.getElementById("editor"), {
    value: `class Node {
    ownId // 1 - 999'999'999 id is random
    seedIds // the ids of the first 3 nodes is known [123,1234,12345] ids are random!
    dataCheck = []; //will be used to check if the data exists in the node, must be an array with the data as value

    queue = [];
    queuePosition = 0;
    nodeList = [];

    constructor(
        ownId,
        seedIds
    ) {
        this.ownId = ownId;
        this.seedIds = seedIds;
        this.workOnQueue();
    }

    workOnQueue() {
        if (this.queue.length > this.queuePosition + 1) {

            const answer = sendData(
                this, this.queue[this.queuePosition + 1].receiver,
                this.queue[this.queuePosition + 1].data
            );

            if (answer) this.queuePosition++;
        }

        setTimeout(this.workOnQueue.bind(this), 10);
    }

    receiveMessage(senderId, message) {
        if(message.id != this.ownId && this.nodeList.indexOf(message.id) == -1 ) 
            this.nodeList.push(message.id);

        if(this.dataCheck.indexOf(message.data) !== -1) return;

        this.dataCheck.push(message.data);

        for (const node of this.nodeList) {
            this.queue.push({ receiver: node, data: message });
        }
    }

    newData(data) {
        this.dataCheck.push(data)
        sendData(this, this.seedIds.A, { id: this.ownId, data });
    }
}                                        
`,
    language: "javascript"
});

fetch('https://cdn.jsdelivr.net/npm/monaco-themes@0.3.3/themes/Monokai.json')
    .then(data => data.json())
    .then(data => {
        monaco.editor.defineTheme('monokai', data);
        monaco.editor.setTheme('monokai');
    })

const myWorker = new Worker('js/worker.js');
const canvasWorker = new Worker('js/canvasWorker.js');

myWorker.onmessage = function (oEvent) {
    const data = oEvent.data;
    ge("messages").innerText = data.messageCounter;
    ge("nodes").innerText = data.nodes;
    ge("lastNewDataDuration").innerText = data.lastNewDataDuration;
    if (data.referenceStorage) ge("newData").innerText = data.referenceStorage.length;

    canvasWorker.postMessage({ ...data, mode: "data" });
};

canvasWorker.onmessage = function (oEvent) {
    const data = oEvent.data;

    ge("matrixSize").innerText = data.imageData.length;

    const canvas = ge("canvas");
    ctx = canvas.getContext("2d");
    canvas.height = data.height;
    canvas.width = data.width;
    const imageData = ctx.createImageData(data.width, data.height);
    imageData.data.set(data.imageData);
    ctx.putImageData(imageData, 0, 0);
}



function buildAndRun() {
    console.log("Begin Build and Run")
    const text = editor.getValue();
    ge("error").innerHTML = "";
    try {
        // check the Function
        const ownId = 1;
        const seedIds = [1, 2, 3];
        const receiveMessage = function () { };
        const sendMessage = function () { };
        const newData = function () { };

        const test = new Function(
            "ownId",
            "seedIds",
            "receiveMessage",
            "sendMessage",
            "newData",
            "return " + text);

        const testClass = test();
        new testClass(
            ownId,
            seedIds,
            receiveMessage,
            sendMessage,
            newData,
        );
    } catch (error) {
        console.error(error);
        ge("error").innerHTML = error;
        return;
    }

    myWorker.postMessage({
        mode: "newFunction",
        maxMessages: parseInt(ge("setMaxMessages").value + "000"),
        nodes: parseInt(ge("setNodes").value),
        chaos: parseInt(ge("setChaos").value),
        newDataInterval: parseInt(ge("setNewData").value),
        setMaxData: parseInt(ge("setMaxData").value),
        sendMessageCooldown: parseInt(ge("sendMessageCooldown").value),
        text: "return " + text
    });
}

function stop() {
    myWorker.postMessage({
        mode: "stop",
    });
}