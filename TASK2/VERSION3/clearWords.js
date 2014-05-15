var fs = require('fs');

// Data
var two;

// Read data from files
function getDataFromFile() {
    // Read word list
    fs.readFile('./wordList.json', function(err, fileData){
        if(err) throw err;
        two = JSON.parse(fileData.toString());
        console.log("read WordList");
    });
};

// Write data to files
function writeDataToFile() {
    var wordListFile = JSON.stringify(two);

    fs.writeFile('./wordList.json', wordListFile, function(err){
        if(err) throw err;
        console.log("Wordlist finished");
    });
};

// Check if data is ready
function checkReady(callback) {
    // console.log("TWO: " + (typeof two));

    if (typeof two !== "undefined") {
        console.log("start clear!");
        callback(writeDataToFile);
    } else {
        console.log("check again");
        setTimeout(function() {
            checkReady(callback);
        }, 1000);
    }
};

function countA(word) {
    var count = 0;
    for (var i = 0; i < word.length; i++) {
        if (word[i] === "*") {
            count++;
        };
    };
    return count;
};

function clear(callback) {
    for (var key in two) {
        console.log("Length: " + key);
        for (var i = 0; i < two[key].length; i++) {
            var word = two[key][i];
            if (countA(word) > Math.floor(key * 2 / 3)) {
                // 只允许三分之二的星号
                // 移除该元素
                console.log("remove " + word);
                two[key].splice(i, 1);
            };
        };
    };
    callback();
}

getDataFromFile();

checkReady(clear);