var imageBaseUrl = "http://www.catsthatlooklikehitler.com/kitler/pics/kitler";


var http = require('http');
var request = require('request');
var express = require('express');
var fs = require('fs');
var gm = require('gm');
var uuid = require('node-uuid');

var app = express();
var downloadFolder = "./download/";

app.all("/img/*/*", function (req, res) {
    var width = req.params[0];
    var height = req.params[1];
    var image = downloadFolder+uuid.v4()+".jpg";
    var randImg = getRandomImage();
    // var writeStream = fs.createWriteStream(image);
    // var readStream = fs.createReadStream(image);

    request.get(randImg, function (err, _res, body) {
       var buffer = new Buffer(body, 'binary');
       var rs = gm(buffer).resize(240, 240).stream(function (err, stdout, stderr) {
          var writeStream = fs.createWriteStream('path/to/my/resized.jpg');
          stdout.pipe(writeStream);
        });

    //.toBuffer('PNG',function (err, buffer) {
    //        console.log(buffer);
    //    });
    });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});


function getRandomImage(){
    var _url = imageBaseUrl+ Math.round(Math.random() * (8000 - 0 + 1))+".jpg";
    return _url;
}

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    if (err) callback(err, filename);
    else {
        var stream = request(uri);
        stream.pipe(
            fs.createWriteStream(filename)
            )
        .on('close', function() {
            callback(null, filename);
        });
    }
  });
};
