/**
 * 
 * @authors Tom Hu
 * @date    2014-05-11 08:07:00
 * @version 1.0
 */

var request = require('request');

// Global variables
// Game URL
var gameURL = '***'; // Strikingly提供的地址

// My user ID
var userID = "***@***.***"; // 替换成自己的email

// Guess character position - index
var po = 0;

var numberOfWordsToGuess = -1;

var numberOfCorrectWords2 = 0;
var numberOfWrongGuesses2 = 0;

// Final result data
var resultData = {};

var iData = {};

/**
 * Some tool functions
 */
function printResultData() {
    console.log("Length\tSuccess\tFail\tTotal\tAccuracy");
    for (var key in iData) {
        var total = iData[key]["Success"] + iData[key]["Fail"];
        console.log("" + key + "\t" + iData[key]["Success"] + "\t" + iData[key]["Fail"] + "\t" + total + "\t" + (iData[key]["Success"] / total));
    }

    console.log("");
    console.log("==========");
    console.log("");

    console.log(resultData);
}

function getCurrentTotalScore() {
    return 20 * numberOfCorrectWords2 - numberOfWrongGuesses2;
}

function countAsterisk(word) {
    var count = 0;
    for (var i = word.length - 1; i >= 0; i--) {
        if (word[i] === '*') {
            count++;
        };
    };
    return count;
}

function generateLetter(word) {
    var lettersFrequency = [
        "AIBCDEFGHJKLMNOPQRSTUVWXYZ",
        "AOEIUMBHUSTYLPXDFRWGJKCQVZ",
        "AEOIUYHBCKTSPRNDGMLWFXVJZQ",
        "AEOIUYSBFRLTNDPMHCKGWVJZXQ",
        "SEAOIUYHRLTNDCPMGBKFWVZXJQ",
        "EAIOUSYRLNTDCMPGHBKFWVZXJQ",
        "EIAOUSRNTLDCGPMHBYFKWVZXJQ",
        "EIAOUSRNTLDCGMPHBYFKWVZXQJ",
        "EIAOUSRNTLCDGMPHBYFVKWZXQJ",
        "EIOAUSRNTLCDGMPHBYFVKWZXQJ",
        "EIOADSNRTLCUPMGHBYFVKWZXQJ",
        "EIOAFSNTRLCPUMDGHYBVZKWXQJ",
        "IEOANTSRLCPUMGDHYBVFZXKWQJ",
        "IEOTSNARLCPUMDHGYBVFZXKWQJ",
        "IEATNSORLCPUMDHGYBVFZXWKQJ",
        "IEHTSNAORLCPUMDYGBVFZXWQKJ",
        "IERTNSOALCPUMHDGYBVFZXQWJK",
        "IEASTONRLCPMUHDGYBVZFXQWKJ",
        "IEATONSRLCPMUHDGYBVFZXKJQW",
        "IEOTRSANCLPHUMYDGBZVFKXJQW"
    ];

    var guessSort = "";
    if (word.length > 20) {
        guessSort = lettersFrequency[19];
    } else {
        guessSort = lettersFrequency[word.length - 1];
    }
    
    // var guessSort = "eisarntolcdugpmhbyfvkwzxjq";

    return ("" + guessSort.charAt(po++)).toUpperCase();
}

/**
 * Get next word
 * @param  {String} secret
 */
function getNextWord(secret) {
    // console.log("Get Next Word!");

    po = 0;

    var postData = {
        'userId': userID,
        'action': "nextWord",
        'secret': secret
    };

    // Get next word
    request(gameURL, { method: 'POST', json: postData}, function (error, response, body) {
        if (!error && body.status == 200) {
            // Get word and some other data
            var word = body.word;
            var numberOfGuessAllowedForThisWord = body.data.numberOfGuessAllowedForThisWord;
            var numberOfWordsTried = body.data.numberOfWordsTried;

            // Print
            // console.log("Word: " + word);
            // console.log("Number of Words Tried: " + numberOfWordsTried);
            // console.log("Number of Guess Allowed for This Word: " + numberOfGuessAllowedForThisWord);
            // console.log("");
            // console.log("==========");
            // console.log("");

            // Make guess
            makeGuess(word, countAsterisk(word), secret, numberOfWordsTried, numberOfGuessAllowedForThisWord, function () {
                getNextWord(secret);
            });
        } else {
            getNextWord(secret);
            console.error("get next word failed: " + error);
        };
    });
}

/**
 * Make a guess
 * @param  {String}   word
 * @param  {Integer}  numberOfAsterisk
 * @param  {String}   secret
 * @param  {Integer}  numberOfWordsTried
 * @param  {Integer}  numberOfGuessAllowedForThisWord
 * @param  {Function} callback
 */
function makeGuess(word, numberOfAsterisk, secret, numberOfWordsTried, numberOfGuessAllowedForThisWord, callback) {
    // console.log("Make Guess!");

    var guessChar = generateLetter(word); // TODO

    var postData = {
        'action': "guessWord",
        'guess': guessChar,
        'userId': userID,
        'secret': secret
    };

    // Make guess
    request(gameURL, { method: 'POST', json: postData}, function (error, response, body) {
        if (!error && body.status == 200) {
            // Refresh data
            var word = body.word;
            var numberOfGuessAllowedForThisWord = body.data.numberOfGuessAllowedForThisWord;
            var numberOfWordsTried = body.data.numberOfWordsTried;

            // Print
            // console.log("Guess: " + guessChar);
            // console.log("Word: " + word);
            // console.log("Number of Words Tried: " + numberOfWordsTried);
            // console.log("Number of Guess Allowed for This Word: " + numberOfGuessAllowedForThisWord);
            // console.log("");
            // console.log("==========");
            // console.log("");

            // Count
            if (numberOfAsterisk == countAsterisk(word)) {
                numberOfWrongGuesses2++;
            };
            if (word.indexOf('*') == -1) {
                numberOfCorrectWords2++;
            };

            if (word.indexOf('*') != -1 && numberOfGuessAllowedForThisWord > 0) {
                // Still containing '*' and still having chances to guess - Make guess
                makeGuess(word, countAsterisk(word), secret, numberOfWordsTried, numberOfGuessAllowedForThisWord, callback);
            } else {
                console.log(numberOfWordsTried + "\t" + word + "\t" + word.length + "\t" + (countAsterisk(word) === 0 ? "success" : "fail") + "\t" + (10 - numberOfGuessAllowedForThisWord));

                if (typeof iData[word.length] === "undefined") {
                    iData[word.length] = {
                        "Success": 0,
                        "Fail": 0
                    };
                };
                iData[word.length][(countAsterisk(word) === 0 ? "Success" : "Fail")]++;

                if (numberOfWordsTried == numberOfWordsToGuess) {
                    // Test finished - Get test results
                    getTestResults(secret);
                } else {
                    // Not yet - Get next word
                    callback();
                };
            };
            
        } else {
            makeGuess(word, countAsterisk(word), secret, numberOfWordsTried, numberOfGuessAllowedForThisWord, callback);
            console.error("guess failed: " + error);
        };
    });
}

/**
 * Get test results after finishing guessing all the 80 words
 * @param  {[String]} secret
 */
function getTestResults(secret) {
    console.log("Get Test Results!");

    var postData = {
        'action': "getTestResults",
        'userId': userID,
        'secret': secret
    };

    // Get test results
    request(gameURL, { method: 'POST', json: postData}, function (error, response, body) {
        if (!error && body.status == 200) {
            // Get test results
            var numberOfWordsTried = body.data.numberOfWordsTried;
            var numberOfCorrectWords = body.data.numberOfCorrectWords;
            var numberOfWrongGuesses = body.data.numberOfWrongGuesses;
            var totalScore = body.data.totalScore;

            // Print results
            console.log("Number of Correct Words: " + numberOfCorrectWords);
            console.log("Number of Wrong Guesses: " + numberOfWrongGuesses);
            console.log("Total Score: " + totalScore);
            console.log("");
            console.log("==========");
            console.log("");
            // console.log("Number of Correct Words: " + numberOfCorrectWords2);
            // console.log("Number of Wrong Guesses: " + numberOfWrongGuesses2);
            // console.log("Total Score: " + getCurrentTotalScore());

            submitTestResults(secret);
        } else {
            getTestResults(secret);
            console.error("get test results failed: " + error);
        };
    });
}

/**
 * Submit test results
 * @param  {String} secret
 */
function submitTestResults(secret) {
    console.log("Submit Test Results!");

    var postData = {
        'action': 'submitTestResults',
        'userId': userID,
        'secret': secret
    };

    // init Game
    request(gameURL, { method: 'POST', json: postData }, function (error, response, body) {
        if (!error && body.status == 200) {
            // Get result data
            resultData = body;

            printResultData();
        } else {
            console.error("submit test results failed: " + error);
        };
    });
}

/**
 * Start Hangman Game
 */
exports.startGame = function() {
    console.log("Start Game!");

    var postData = {
        'action': 'initiateGame',
        'userId': userID
    };

    // init Game
    request(gameURL, { method: 'POST', json: postData }, function (error, response, body) {
        if (!error && body.status == 200) {
            var secret = body.secret;
            numberOfWordsToGuess = body.data.numberOfWordsToGuess;
            var numberOfGuessAllowedForEachWord = body.data.numberOfGuessAllowedForEachWord;

            // Print
            console.log("Secret: " + secret);
            console.log("Number of Words to Guess: " + numberOfWordsToGuess);
            console.log("Number of Guess Allowed for Each Word: " + numberOfGuessAllowedForEachWord);
            console.log("");
            console.log("==========");
            console.log("");

            console.log("Index\tWord\tLength\tAnswer\tTry");

            // Get Word
            getNextWord(secret);
        } else {
            console.error("init failed: " + error);
        };
    });
}
