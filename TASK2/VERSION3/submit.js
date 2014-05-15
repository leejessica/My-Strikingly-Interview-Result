var request = require('request');

var resultData = {};

function printResultData() {
    console.log(resultData);
    console.log("");
    console.log("==========");
    console.log("");
};

function submitTestResults(secret) {
    console.log("Submit Test Results!");

    var postData = {
        'action': 'submitTestResults',
        'userId': 'h1994st@gmail.com',
        'secret': secret
    };

    request('http://strikingly-interview-test.herokuapp.com/guess/process', { method: 'POST', json: postData }, function (error, response, body) {
        if (!error && body.status == 200) {
            // Get result data
            resultData = body;

            printResultData();
        } else {
            console.error("submit test results failed: " + error);
        };
    });
};

submitTestResults("NFVSECFIKY3F2YB90UVTC38TER60F6");