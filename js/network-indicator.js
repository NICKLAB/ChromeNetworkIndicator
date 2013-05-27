var canvasID = 'network-load';
var timeSumContentLength = 0;
var drawContext = null;
var canvas = null;
var dataNetwork = new Array();
var maxPayloadLength = 0;
var maxLineHeight = 17;
var lineColorIncoming = '#0092e6';
var syncTimeout = 2000
var persitedData = null;

Array.prototype.max = function() {
    return Math.max.apply(null, this)
}

Array.prototype.min = function() {
    return Math.min.apply(null, this)
}

function main() {
    init();
    drawBackground();
    refreshView();
    initializeListener();
}

function init() {
    dataNetwork = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    canvas = window.document.getElementById(canvasID);
    drawContext = canvas.getContext('2d');
    loadSettings();
    setInterval(syncData2Settings, syncTimeout);
}

function loadSettings() {
    if (persitedData === null) {
        console.log('Loading networkData');
        if ('networkData' in localStorage) {
            persitedData = JSON.parse(localStorage['networkData']);
            console.log('Loaded networkData from storage');
        }
        else{
            persitedData = new networkData();
            localStorage['networkData'] = JSON.stringify(persitedData);
            console.log('Created new networkData and persisted to storage');
        }
    }
}

function syncData2Settings() {
    localStorage['networkData'] = JSON.stringify(persitedData);
    console.log('Persisted networkData');
}

function drawBackground() {
    drawContext.fillStyle = '#000000';
    frameHelper(drawContext);
    //chrome.browserAction.setIcon({imageData: drawContext.getImageData(0, 0, canvas.width, canvas.height)});
}

function initializeListener() {
    chrome.webRequest.onCompleted.addListener(processData, {urls: ["<all_urls>"]}, ["responseHeaders"]);
}

function processData(data) {
    for (i = 0; i < data.responseHeaders.length; i++)
    {
        var header = data.responseHeaders[i];
        if (header.name === 'Content-Length') {
            var dataLength = parseInt(data.responseHeaders[i].value);
            persitedData.incomingData += dataLength;
            dataNetwork.shift();
            dataNetwork.push(dataLength);
            maxPayloadLength = Math.max(dataLength, maxPayloadLength);
            break;
        }
    }

    // refresh
    drawDataLines(drawContext);
}

function frameHelper(ctx) {
    ctx.fillRect(0, 0, 19, 19);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, 1, 17, 17);
}

function drawDataLines(drawContext) {
    drawBackground();
    for (var i = 0; i < dataNetwork.length; i++) {
        var valPerc = dataNetwork[i] * 100 / dataNetwork.max();
        var lineHeigth = Math.max(1, (maxLineHeight * valPerc / 100));
        drawContext.lineWidth = 1;
        drawContext.beginPath();
        var xStart = Math.max(1, (i + 1) - 0.5);
        var xEnd = xStart;
        var yStart = (maxLineHeight - lineHeigth) + 1;
        var yEnd = maxLineHeight + 1;
        drawContext.moveTo(xStart, yStart);
        drawContext.lineTo(xEnd, yEnd);
        drawContext.strokeStyle = lineColorIncoming;
        drawContext.stroke();
    }
    refreshView();
}

function refreshView() {
    chrome.browserAction.setIcon({imageData: drawContext.getImageData(0, 0, 19, 19)});
}

document.addEventListener('DOMContentLoaded', main);