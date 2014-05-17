(function() {
    "use strict";

    // Import jQuery script
    var jq = document.createElement('script');
    jq.src = "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js";
    jq.type = "text/javascript";
    document.getElementsByTagName('head')[0].appendChild(jq);

    var addPlugin = function($) {
        /*! Tiny Pub/Sub - v0.7.0 - 2013-01-29
        * https://github.com/cowboy/jquery-tiny-pubsub
        * Copyright (c) 2013 "Cowboy" Ben Alman; Licensed MIT */
        var o = $({});

        $.subscribe = function() {
            o.on.apply(o, arguments);
        };

        $.unsubscribe = function() {
            o.off.apply(o, arguments);
        };

        $.publish = function() {
            o.trigger.apply(o, arguments);
        };
    }

    /**
     * Check if jQuery script is imported
     * @param  {Function} callback
     */
    var checkReady = function(callback) {
        if (window.jQuery) {
            addPlugin(jQuery);
            callback(jQuery);
        } else {
            window.setTimeout(function() {
                checkReady(callback);
            }, 200);
        }
    };

    // HangmanGame Object
        

    // Start game when jQuery is imported
    // Main function
    checkReady(function($) {
        if (typeof jQuery === "undefined") {throw new Error("Requires jQuery");}

        var HangmanGame = function(email, url) {
            // Private variables
            var userId = email;
            var gameURL = url;
            var secret = "";

            var action = ["initiateGame", "nextWord", "guessWord", "getTestResults", "submitTestResults"];
            var guessSort = ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R', 'D', 'L', 'U' ,'C', 'M', 'F', 'W', 'Y', 'P', 'V', 'B', 'G', 'K', 'J', 'Q', 'X', 'Z'];
            var po = 0;

            var numberOfWordsToGuess = -1;
            var numberOfGuessAllowedForEachWord = -1;

            var numberOfGuessAllowedForThisWord = -1;

            var numberOfWordsTried = -1;
            var numberOfCorrectWords = -1;
            var numberOfWrongGuesses = -1;
            var totalScore = -1;

            var resultData = {};

            var word = "";

            /**
             * [initGame]
             */
            this.initGame = function() {
                var postData = {
                    "action": action[0],
                    "userId": userId
                };

                // Post Data
                $.ajax({
                    url: gameURL,
                    type: 'POST',
                    dataType: 'json',
                    data: postData
                })
                .done(function(data) {
                    // Get secret
                    secret = data["secret"];
                    numberOfWordsToGuess = data["data"]["numberOfWordsToGuess"];
                    numberOfGuessAllowedForEachWord = data["data"]["numberOfGuessAllowedForEachWord"];

                    // Done!
                    $.publish('initGameDone');

                    // Print some data
                    // console.log("Secret: " + secret);
                    // console.log("Number of words to guess: " + numberOfWordsToGuess);
                    // console.log("Number of guess allowed for each word: " + numberOfGuessAllowedForEachWord);
                })
                .fail(function() {
                    console.log("init error");
                })
            };

            this.nextWord = function() {
                var word;
                po = 0;
                var postData = {
                    "userId": userId,
                    "action": action[1],
                    "secret": secret
                };

                // Post Data
                $.ajax({
                    url: gameURL,
                    type: 'POST',
                    dataType: 'json',
                    data: postData
                })
                .done(function(data) {
                    // Get word
                    word = data["word"];
                    numberOfWordsTried = data["data"]["numberOfWordsTried"];
                    numberOfGuessAllowedForThisWord = data["data"]["numberOfGuessAllowedForThisWord"];

                    // Done!
                    $.publish('nextWordDone');

                    // Print some data
                    // console.log("Word: " + word);
                    console.log("Number of words tried: " + numberOfWordsTried);
                    // console.log("Number of guess allowed for this word: " + numberOfGuessAllowedForThisWord);
                })
                .fail(function() {
                    $.publish('nextWordError');
                    console.log("get next word error");
                })
            };

            this.guessWord = function() {
                var c = guessSort[po++];

                var postData = {
                    "action": action[2],
                    "guess": c,
                    "userId": userId,
                    "secret": secret
                };

                // Post Data
                $.ajax({
                    url: gameURL,
                    type: 'POST',
                    dataType: 'json',
                    data: postData
                })
                .done(function(data) {
                    // Get word
                    word = data["word"];
                    numberOfWordsTried = data["data"]["numberOfWordsTried"];
                    numberOfGuessAllowedForThisWord = data["data"]["numberOfGuessAllowedForThisWord"];

                    if (numberOfGuessAllowedForThisWord) {
                        // Done!
                        $.publish('guessWordDone');
                    } else {
                        // Fail!
                        $.publish('guessWordFail');
                    };
                    

                    // Print some data
                    // console.log("Guess: " + c);
                    // console.log("Word: " + word);
                    // console.log("Number of words tried: " + numberOfWordsTried);
                    // console.log("Number of guess allowed for this word: " + numberOfGuessAllowedForThisWord);
                })
                .fail(function() {
                    $.publish('guessWordError')
                    console.log("guess word error");
                })
            };

            this.getTestResults = function() {
                var postData = {
                    "action": action[3],
                    "userId": userId,
                    "secret": secret
                };

                // Post Data
                $.ajax({
                    url: gameURL,
                    type: 'POST',
                    dataType: 'json',
                    data: postData
                })
                .done(function(data) {
                    // Get totla score
                    numberOfWordsTried = data["data"]["numberOfWordsTried"];
                    numberOfCorrectWords = data["data"]["numberOfCorrectWords"];
                    numberOfWrongGuesses = data["data"]["numberOfWrongGuesses"];
                    totalScore = data["data"]["totalScore"];

                    // Done!
                    $.publish('getTestResultsDone');
                })
                .fail(function() {
                    console.log("guess test results error");
                })
            };

            this.submitTestResults = function() {
                var postData = {
                    "action": action[4],
                    "userId": userId,
                    "secret": secret
                };

                // Post Data
                $.ajax({
                    url: gameURL,
                    type: 'POST',
                    dataType: 'json',
                    data: postData
                })
                .done(function(data) {
                    resultData = data;
                    console.log("Result: " + JSON.stringify(data));
                })
                .fail(function() {
                    console.log("submit test results error");
                })
            };

            this.checkTestFinished = function() {
                if (numberOfWordsTried != 80) {
                    $.publish('testNotFinished');
                } else {
                    $.publish('testFinished');
                };
            }

            this.checkWordCompleted = function() {
                if (word.indexOf('\*') != -1) {
                    $.publish('wordNotCompleted');
                } else {
                    $.publish('wordCompleted');
                };
            }

            this.startGame = function() {
                $.subscribe('initGameDone', this.nextWord);
                $.subscribe('nextWordDone', this.guessWord);
                $.subscribe('nextWordError', this.checkTestFinished);
                $.subscribe('guessWordDone', this.checkWordCompleted);
                $.subscribe('guessWordFail', this.nextWord);
                $.subscribe('guessWordError', this.guessWord);
                $.subscribe('wordNotCompleted', this.guessWord);
                $.subscribe('wordCompleted', this.checkTestFinished);
                $.subscribe('testNotFinished', this.nextWord);
                $.subscribe('testFinished', this.getTestResults);
                $.subscribe('getTestResultsDone', this.submitTestResults);
                this.initGame();
            }
        }

        var game = new HangmanGame("***@***.***", "***"); //分别替换成自己的邮箱和Strikingly提供的地址
        game.startGame();
    });
})();


