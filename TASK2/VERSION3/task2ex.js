/**
 * 
 * @authors Tom Hu
 * @date    2014-05-11 08:07:00
 * @version 1.0
 */

var request = require('request');
var Word = require('./word.js');

// 游戏URL
var gameURL = 'http://strikingly-interview-test.herokuapp.com/guess/process';

// 用户名
var userID = "h1994st@gmail.com";

// 当前单词，不是String，是一个Word对象，初始化时注意
var _currentWord;
// 猜测的字母
var _guessChar = "";
// 当前单词的允许猜测次数
// 获取新单词或猜字母时会改变
// 数据来自服务器，无需自己更新
var _numberOfGuessAllowedForThisWord = -1;
// 相似单词列表
// 在changeStrategy()中：
// 策略一成功时初始化
// 策略二、策略三无论成功还是失败都要更新正则表达式，并且更新similarWordsList
// 策略三猜测成功时，需要更新wordList中相应的未完成的单词
// 策略四成功时，也需要更新wordList中相应的单词
var _similarWordsList = [];
// 当前单词的测试单词，不是String，是一个Word对象，初始化时注意
var _testWord;
// 测试单词在wordsList中的位置
// var _indexOfTestWordInWordsList = -1;

// 要猜的词的个数
// 在startGame()中初始化
var _numberOfWordsToGuess = -1;
// 已经猜过的词的个数
// 获取新单词或猜字母时会改变
// 数据来自服务器，无需自己更新
var _numberOfWordsTried = -1;

// 最终测试结果
var resultData = {};

// 统计数据，用于参考
var _statisticData = {};
// 单词表，用于学习
var _wordsList = {};
// 回调函数，写回文件用
var _writeback;

// 用字母频率表来猜测时的字母位置
// 策略一时，一般递增，不会超过26
// 策略二时，不使用该变量
// 策略三时，不使用该变量
// 策略四时，用字频表加上随机猜测
var _indexOfCurrentWordInLetterFrequencyTable = 0;
// 猜字母的策略
// 0 - 通过字频表一个个猜
// 1 - 通过wordsList里已经才出来的单词来匹配
// 2 - 通过wordsList里未猜完的单词来匹配，若猜对则更新wordsList里相应的单词
// 3 - 通过wordsList里匹配出来的单词与currentWord一样，则使用随机猜测加上
// 在每次猜测完之后，根据服务器返回的结果来制定下一次的猜字母策略
// 默认为策略一
var _strategyOfGuessingWord = 0;


/**
 * Some tool functions
 */
function printResultData() {
    console.log("Results data: ");
    console.log(resultData);
    console.log("");
    console.log("==========");
    console.log("");
};

// 生成用来猜测的字母
function generateLetter() {
    var letter = "";
    switch (_strategyOfGuessingWord) {
    case 0:
        letter = generateLetterUsingFrequencyTable();
        break;
    case 1:
        letter = generateLetterUsingFinishedWord();
        break;
    case 2:
        letter = generateLetterUsingUnfinishedWord();
        break;
    case 3:
        letter = generateRandomLetter();
        break;
    };
    return letter;
};

// 通过字频表来生成
function generateLetterUsingFrequencyTable() {
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
    if (_currentWord.length > 20) {
        guessSort = lettersFrequency[19];
    } else {
        guessSort = lettersFrequency[_currentWord.length - 1];
    }

    // 保证返回大写字母
    return ("" + guessSort.charAt(_indexOfCurrentWordInLetterFrequencyTable++)).toUpperCase();
};

// 通过正则表达式匹配出来的已经完成的单词来生成
function generateLetterUsingFinishedWord() {
    return _testWord.getText()[_currentWord.getText().indexOf("*")];
};

// 通过正则表达式匹配出来的未完成的单词来生成
function generateLetterUsingUnfinishedWord() {
    var result = "";
    for (var i = 0; i < _currentWord.length; i++) {
        if (_currentWord.getText()[i] === "*" && _testWord.getText()[i] !== "*") {
            result = _testWord.getText()[i];
            break;
        };
    };
    return result;
};

// 通过字频表加上随机来生成
function generateRandomLetter() {
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

    // 统计不同单词的个数
    // var count = _currentWord.numberOfDifferentLetters();

    var guessSort = "";
    if (_currentWord.length > 20) {
        guessSort = lettersFrequency[19];
    } else {
        guessSort = lettersFrequency[_currentWord.length - 1];
    }

    // var position = Math.floor(Math.random() * (26 - (count + 10)) + count + 10);
    var position = Math.floor(Math.random() * 26);
    while (_currentWord.getText().indexOf(guessSort[position]) !== -1) {
        // position = Math.floor(Math.random() * (26 - (count + 10)) + count + 10);
        var position = Math.floor(Math.random() * 26);
    }; // 保证返回的一定是当前单词中不存在的字母

    // 保证返回大写字母
    return ("" + guessSort.charAt(position)).toUpperCase();
};

// 更改策略
function changeStrategy(isSuccess) {
    switch (_strategyOfGuessingWord) {
        case 0:
            // console.log("策略一");
            // 之前采用策略一
            if (isSuccess) {
                // console.log("策略一成功");
                // 猜测成功
                // 获取相应similarWordsList
                _similarWordsList = getSimilarWordsList();

                if (_similarWordsList.length === 0) {
                    // 空数组
                    // 没有可以匹配的单词
                    // 仍采用策略一
                    _strategyOfGuessingWord = 0;
                } else {
                    // 有可以匹配的单词
                    // 获取testWord
                    // 获取最后一个，因为越靠后越没有*
                    _testWord = new Word(_similarWordsList.pop());

                    // console.log("Similar Words List:");
                    // console.log(_similarWordsList);

                    // console.log("Test Word:");
                    // console.log(_testWord.getText());

                    if (_testWord.hasAsterisk()) {
                        // testWord中含有*
                        if (_testWord.getText() === _currentWord.getText()) {
                            // 和原单词一样
                            // 使用策略四
                            _strategyOfGuessingWord = 3;
                        } else {
                            // 和原单词略有不同
                            // 使用策略三
                            _strategyOfGuessingWord = 2;
                        };
                    } else {
                        // testWord中没有*
                        // 使用策略二
                        _strategyOfGuessingWord = 1;
                    };
                };

            } else {
                // console.log("策略一失败");
                // 策略一失败
                // 仍采用策略一
                _strategyOfGuessingWord = 0;
            };
            break;
        case 1:
            // console.log("策略二");
            // 更新正则表达式 - 调用此函数之前已经更新
            // 更新similarWordsList
            _similarWordsList = getSimilarWordsList();

            if (_similarWordsList.length === 0) {
                // 空数组
                // 没有可以匹配的单词
                // 仍采用策略一
                _strategyOfGuessingWord = 0;
            } else {
                // 获得新的testWord
                _testWord = new Word(_similarWordsList.pop());

                // console.log("Similar Words List:");
                // console.log(_similarWordsList);

                // console.log("Test Word:");
                // console.log(_testWord.getText());

                // 根据testWord的情况来选择策略
                if (_testWord.hasAsterisk()) {
                    // testWord中含有*
                    if (_testWord.getText() === _currentWord.getText()) {
                        // 和原单词一样
                        // 使用策略四
                        _strategyOfGuessingWord = 3;
                    } else {
                        // 和原单词略有不同
                        // 使用策略三
                        _strategyOfGuessingWord = 2;
                    };
                } else {
                    // testWord中没有*
                    // 使用策略二
                    _strategyOfGuessingWord = 1;
                };
            };
            break;
        case 2:
            // console.log("策略三");
            

            if (isSuccess) {
                // console.log("策略三成功");
                // 策略三猜测成功
                // 更新正则表达式 - 调用此函数之前就已更新
                // 更新wordList
                if (_currentWord.numberOfAsterisks() < _testWord.numberOfAsterisks()) {
                    // 单词有提升才学习
                    console.log("学习单词: " + _testWord.getText() + " -> " + _currentWord.getText());

                    _wordsList[_currentWord.length][ _wordsList[_currentWord.length].indexOf(_testWord.getText()) ] = _currentWord.getText(); 
                };
            };

            // 更新similarWordsList
            _similarWordsList = getSimilarWordsList();

            if (_similarWordsList.length === 0) {
                // 空数组
                // 没有可以匹配的单词
                // 仍采用策略一
                _strategyOfGuessingWord = 0;
            } else {
                // 获得新的testWord
                _testWord = new Word(_similarWordsList.pop());

                // console.log("Similar Words List:");
                // console.log(_similarWordsList);

                // console.log("Test Word:");
                // console.log(_testWord.getText());

                // 根据testWord的情况来选择策略
                if (_testWord.hasAsterisk()) {
                    // testWord中含有*
                    if (_testWord.getText() === _currentWord.getText()) {
                        // 和原单词一样
                        // 使用策略四
                        _strategyOfGuessingWord = 3;
                    } else {
                        // 和原单词略有不同
                        // 使用策略三
                        _strategyOfGuessingWord = 2;
                    };
                } else {
                    // testWord中没有*
                    // 使用策略二
                    _strategyOfGuessingWord = 1;
                };
            };
                
            break;
        case 3:
            // console.log("策略四");
            if (isSuccess) {
                // console.log("策略四成功");
                // 策略四猜测成功
                // 更新wordList
                
                if (_currentWord.numberOfAsterisks() < _testWord.numberOfAsterisks()) {
                    // 单词有提升才学习
                    console.log("学习单词: " + _testWord.getText() + " -> " + _currentWord.getText());

                    _wordsList[_currentWord.length][ _wordsList[_currentWord.length].indexOf(_testWord.getText()) ] = _currentWord.getText(); 
                };

                // 获得新的testWord
                _testWord = new Word(_currentWord.getText());

                // console.log("Similar Words List:");
                // console.log(_similarWordsList);

                // console.log("Test Word:");
                // console.log(_testWord.getText());
            } else {
                // console.log("策略四失败");
                // 策略四失败
                // 仍采用策略四
                _strategyOfGuessingWord = 3;
            };
            break;
    };
};

// 获得similarWordsList
function getSimilarWordsList() {
    var result = [];
    var ex = _currentWord.getRegExp();

    for (var i = 0; i < _wordsList[_currentWord.length].length; i++) {
        var item = _wordsList[_currentWord.length][i];
        if (ex.test(item)) {
            result.push(item);
        };
    };

    return result;
};

// 更新统计数据
function updateStatisticData() {
    // 如果统计数据中没有记录过该长度的单词，则初始化对应项
    if (typeof _statisticData[_currentWord.length] === "undefined") {
        _statisticData[_currentWord.length] = {
            "Success": 0,
            "Fail": 0
        };
    };

    // 相应项自增
    _statisticData[_currentWord.length][_currentWord.hasAsterisk() ? "Fail" : "Success"]++;
};

// 更新单词表
function updateWordsList() {
    // console.log("Update Word List!");
    if (_wordsList[_currentWord.length].indexOf(_currentWord.getText()) === -1 && _currentWord.numberOfAsterisks() <= Math.floor(_currentWord.length * 2 / 3)) {
        // wordList中没有该单词且*个数小于半数，加入列表
        if (typeof _wordsList[_currentWord.length].push === "undefined") {
            console.log(_wordsList[_currentWord.length]);
        };
        _wordsList[_currentWord.length].push(_currentWord.getText());
        _wordsList[_currentWord.length].sort();
    } else {
        // 已经存在，输出提示信息
        if (_currentWord.numberOfAsterisks() > Math.floor(_currentWord.length * 2 / 3)) {
            console.log("质量太差!!!!!!!!!!");
        } else {
            console.log("已经存在!!!!!!!!!!");
        };
    };
};

// 是否可以继续猜
function canContinueGuessing() {
    return _currentWord.hasAsterisk() && _numberOfGuessAllowedForThisWord > 0;
};

// 是否可以获取下一个单词，即是否猜完
function canContinueGettingWord() {
    return _numberOfWordsToGuess !== _numberOfWordsTried;
};

// 当前猜测是否正确
function isGuessSuccessful(numberOfAsteriskOfLastWord, numberOfAsteriskOfCurrentWord) {
    return numberOfAsteriskOfLastWord > numberOfAsteriskOfCurrentWord;
};


/**
 * Get next word
 * @param  {String} secret
 */
function getNextWord(secret) {
    // console.log("Get Next Word!");

    // 每获取一个新的单词，便将index置为0
    // 这样从字频表的开始猜起
    _indexOfCurrentWordInLetterFrequencyTable = 0;

    // 默认策略设为0，即策略一
    _strategyOfGuessingWord = 0;

    var postData = {
        'userId': userID,
        'action': "nextWord",
        'secret': secret
    };

    // Get next word
    request(gameURL, { method: 'POST', json: postData}, function (error, response, body) {
        if (!error && body.status == 200) {
            // 更新全局变量
            _currentWord = new Word(body.word);
            _numberOfGuessAllowedForThisWord = body.data.numberOfGuessAllowedForThisWord;
            _numberOfWordsTried = body.data.numberOfWordsTried;

            // 开始猜
            makeGuess(_currentWord.numberOfAsterisks(), secret, function () {
                getNextWord(secret);
            });
        } else {
            getNextWord(secret);
            console.error("get next word failed: " + error);
        };
    });
};

/**
 * Make a guess
 * @param  {Integer}  numberOfAsterisks
 * @param  {String}   secret
 * @param  {Function} callback
 */
function makeGuess(numberOfAsterisksBeforeGuessing, secret, callback) {
    // 通过不同的策略生成字母
    _guessChar = generateLetter();
    
    var postData = {
        'action': "guessWord",
        'guess': _guessChar,
        'userId': userID,
        'secret': secret
    };

    // Make guess
    request(gameURL, { method: 'POST', json: postData}, function (error, response, body) {
        if (!error && body.status == 200) {
            var isSuccess = isGuessSuccessful(numberOfAsterisksBeforeGuessing, (new Word(body.word)).numberOfAsterisks());

            // Refresh data
            if (isSuccess) {
                for (var i = 0; i < body.word.length; i++) {
                    if (body.word[i] === _guessChar) {
                        // 找到服务器返回的word中与guessChar相同字符的index
                        // 并对currentWord进行更新
                        _currentWord.updateText(i, _guessChar);
                    };
                };
            } else {
                // 出错
                // currentWord本身无需改变
                // 但其正则表达式需要改变
                _currentWord.updateRegExpArrayWithoutLetter(_guessChar);
            };
            _numberOfGuessAllowedForThisWord = body.data.numberOfGuessAllowedForThisWord;
            _numberOfWordsTried = body.data.numberOfWordsTried;

            // Print
            // console.log("Guess: " + _guessChar);
            // console.log("Word: " + _currentWord.getText());
            // console.log("Number of Words Tried: " + _numberOfWordsTried);
            // console.log("Number of Guess Allowed for This Word: " + _numberOfGuessAllowedForThisWord);
            // console.log("");
            // console.log("==========");
            // console.log("");

            // 对猜的策略进行修改
            // console.log("策略修改前：" + _strategyOfGuessingWord);
            changeStrategy(isGuessSuccessful(numberOfAsterisksBeforeGuessing, _currentWord.numberOfAsterisks()));
            // console.log("策略修改后：" + _strategyOfGuessingWord);

            if (canContinueGuessing()) {
                // 还能继续猜
                // console.log("能继续猜");
                
                // 继续猜
                makeGuess(_currentWord.numberOfAsterisks(), secret, callback);
            } else {
                // 不能继续猜
                // console.log("不能继续猜");

                // 输出当前单词的结果：
                // 第几个，单词，单词长度，成功与否，猜测次数
                console.log(_numberOfWordsTried + "\t" + _currentWord.getText() + "\t" + _currentWord.length + "\t" + (_currentWord.hasAsterisk() ? "fail" : "success") + "\t" + (10 - _numberOfGuessAllowedForThisWord));

                // 更新统计数据
                updateStatisticData();

                // 更新单词表
                updateWordsList();

                if (canContinueGettingWord()) {
                    // 能继续获取单词
                    // console.log("能继续获取单词");
                    callback();
                } else {
                    // 不能获取单词
                    // 游戏结束
                    // 获取游戏成绩
                    // console.log("不能继续获取单词");
                    getTestResults(secret);
                };
            };         
        } else {
            // 网络错误
            // 继续请求
            makeGuess(_currentWord.numberOfAsterisks(), secret, callback);
            console.error("guess failed: " + error);
        };
    });
};

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
            _numberOfWordsTried = body.data.numberOfWordsTried;
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

            // Write statistical data and words list back to files
            _writeback();

            // Submit test results
            submitTestResults(secret);
        } else {
            getTestResults(secret);
            console.error("get test results failed: " + error);
        };
    });
};

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

    // Submit test results
    request(gameURL, { method: 'POST', json: postData }, function (error, response, body) {
        if (!error && body.status == 200) {
            // Get result data
            resultData = body;

            // Print the results
            printResultData();
        } else {
            console.error("submit test results failed: " + error);
        };
    });
};

/**
 * Start Hangman Game
 */
exports.startGame = function(ttttt, successList, callback) {
    _statisticData = ttttt;
    _wordsList = successList;
    _writeback = callback;
    console.log("Start Game!");

    var postData = {
        'action': 'initiateGame',
        'userId': userID
    };

    // init Game
    request(gameURL, { method: 'POST', json: postData }, function (error, response, body) {
        if (!error && body.status == 200) {
            var secret = body.secret;
            _numberOfWordsToGuess = body.data.numberOfWordsToGuess;
            var numberOfGuessAllowedForEachWord = body.data.numberOfGuessAllowedForEachWord;

            // Print
            console.log("Secret: " + secret);
            console.log("Number of Words to Guess: " + _numberOfWordsToGuess);
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
};
