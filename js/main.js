function ge(id) {
    return document.getElementById(id);
}

const editor = monaco.editor.create(document.getElementById("editor"), {
    value: `class Node {
    ownId // 1 - 999'999'999 id is random
    seedIds // the ids of the first 3 nodes is known [123,1234,12345] ids are random!
    dataCheck = []; //will be used to check if the data exists in the node, must be an array with the data as value

    constructor(
        ownId,
        seedIds
        ) {
        this.ownId = ownId;
        this.seedIds = seedIds;
    }

    receiveMessage(senderId, message) {

    }

    newData(data) {
        this.dataCheck.push(data)
        //sendData(this.seedIds.A, {id: this.ownId,data});
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
    console.log(data.height);
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
        text: "return " + text
    });
}