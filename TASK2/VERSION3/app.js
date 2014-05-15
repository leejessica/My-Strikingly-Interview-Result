var fs = require('fs');
var game = require('./task2ex.js');

// Data
var one;
var two;

function printResultData(iData, successList) {
    console.log("Length\tSuccess\tFail\tTotal\tAccuracy");
    for (var key in iData) {
        var total = iData[key]["Success"] + iData[key]["Fail"];
        console.log("" + key + "\t" + iData[key]["Success"] + "\t" + iData[key]["Fail"] + "\t" + total + "\t" + (iData[key]["Success"] / total));
    }

    console.log("");
    console.log("==========");
    console.log("");
    successList.sort();
    for (var i = 0; i < successList.length; i++) {
        console.log(successList[i]);
    };
}

// Read data from files
function getDataFromFile() {
    // Read data
    fs.readFile('./data.json', function(err, fileData){
        if(err) throw err;
        one = JSON.parse(fileData.toString());
        console.log("read Data");
    });

    // Read word list
    fs.readFile('./wordList.json', function(err, fileData){
        if(err) throw err;
        two = JSON.parse(fileData.toString());
        console.log("read WordList");
    });
};

// Write data to files
function writeDataToFile() {
    var dataFile = JSON.stringify(one);
    
    var wordListFile = JSON.stringify(two);

    fs.writeFile('./data.json', dataFile, function(err){
        if(err) throw err;
        console.log("Data finished");
    });

    fs.writeFile('./wordList.json', wordListFile, function(err){
        if(err) throw err;
        console.log("Wordlist finished");
    });
};

// Check if data is ready
function checkReady(callback) {
    // console.log("ONE: " + (typeof one));
    // console.log("TWO: " + (typeof two));

    if (typeof one !== "undefined" && typeof two !== "undefined") {
        console.log("start game!");
        callback();
    } else {
        console.log("check again");
        setTimeout(function() {
            checkReady(callback);
        }, 1000);
    }
};

function start() {
    game.startGame(one, two, writeDataToFile);
}

getDataFromFile();

checkReady(start);