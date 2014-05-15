/**
 * 
 * @authors Tom Hu
 * @date    2014-05-14 12:48:36
 * @version 1.0
 */

function Word(string) {
    var _text = string;
    var _regExpArray;

    this.length = string.length;

    function initRegExpArray() {
        _regExpArray = new Array(_text.length);
        for (var i = 0; i < _text.length; i++) {
            // 当word当前位置不是"*"时，才改变正则表达式
            if (_text[i] !== "*") {
                // 对应位置替换为一样的字母
                _regExpArray[i] = _text[i];

                // 其他位置正则表达式中去除
                for (var j = 0; j < _regExpArray.length; j++) {
                    if (j === i) {
                        continue;
                    };

                    if (typeof _regExpArray[j] === "undefined") {
                        _regExpArray[j] = ("^" + _text[i]);
                    } else {
                        if (_regExpArray[j][0] === "^") {
                            _regExpArray[j] += ("^" + _text[i]);
                        };
                    };
                };
            }
        };
    };

    this.getText = function () {
        return _text;
    };

    this.setText = function (newWord) {
        _text = newWord;
        this.length = newWord.length;
        initRegExpArray();
    };

    this.updateText = function (index, letter) {
        if (_text[index] !== "*") {
            throw "Update Word Error!";
        };
        var temp = _text.split("");
        temp[index] = letter;
        _text = temp.join("");

        if (typeof _regExpArray === "undefined") {
            // init RegExpArray
            initRegExpArray();
        };
        _regExpArray[index] = letter;

        this.updateRegExpArrayWithoutLetter(letter);
    };

    this.getRegExp = function () {
        var result = "";

        if (typeof _regExpArray === "undefined") {
            // init RegExpArray
            initRegExpArray();
        };

        // init Array 'a'
        var a = new Array(_regExpArray.length);

        for (var i = 0; i < a.length; i++) {
            if (_regExpArray[i][0] === "^") {
                a[i] = ("[" + _regExpArray[i] + "]");
            } else {
                a[i] = _regExpArray[i];
            };
        };

        result = ("^" + a.join("") + "$");
        return new RegExp(result);
    };

    this.updateRegExpArrayWithoutLetter = function (c) {
        if (typeof _regExpArray === "undefined") {
            // init RegExpArray
            initRegExpArray();
        };

        for (var i = 0; i < _regExpArray.length; i++) {
            // 如果未定义
            if (typeof _regExpArray[i] === "undefined") {
                _regExpArray[i] = ("^" + c);
                continue;
            };

            if (_regExpArray[i][0] === "^") {
                _regExpArray[i] += ("^" + c);
            };
        };
    };

    this.hasAsterisk = function () {
        return _text.indexOf("*") !== -1;
    };

    this.numberOfAsterisks = function () {
        var count = 0;
        for (var i = _text.length - 1; i >= 0; i--) {
            if (_text[i] === '*') {
                count++;
            };
        };
        return count;
    };

    // 统计不同字母的个数
    this.numberOfDifferentLetters = function () {
        var t = new Array(26);
        for (var i = 0; i < _text.length; i++) {
            var letter = _text[i];
            if (letter !== "*") {
                var index = letter.charCodeAt(0) - 65;
                t[index] = true;
            };
        };
        var count = 0;
        for (var i = 0; i < t.length; i++) {
            if (t[i]) {
                count++;
            };
        };
        return count;
    };
}

module.exports = Word;