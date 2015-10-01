var config = {
    "url" : "http://www.catsthatlooklikehitler.com/kitler/pics/kitler"
};


var http = require('http');
var request = require('request');
var express = require('express');
var fs = require('fs');
var lwip = require('lwip');

var app = express();

app.all("/img/*/*", function (req, res) {
    var width = req.params[0];
    var height = req.params[1];
    var randImg = getRandomImage();

    request({url:randImg,  encoding: 'binary'}, function onImageResponse(err, imageResponse, imageBody) {
        if (err) throw err;

        var buffer = new Buffer(imageBody, "binary");

        res.writeHead(200, {'Content-Type': 'image/jpg' });
        res.end(buffer, 'binary');
        return;
        // TODO resizing stuff
        lwip.open(buffer, 'jpg', function(err, image){
            if (err) throw err;

            lwip.create(width, height, "yellow", function(err, image){
                if (err) throw err;
            });
            /*
            image.resize(width, height, 'lanczos', function(err, image){
                if (err) throw err;
            });
            */
        });
    });

});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});


function getRandomImage(){
    var _url = config.url+ Math.round(Math.random() * (8000 - 0 + 1))+".jpg";
    return _url;
}
