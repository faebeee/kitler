var config = {
    "url" : "http://www.catsthatlooklikehitler.com/kitler/pics/kitler",
    'port' : process.env.PORT||3000
};

var flickr = new Flickr({
  api_key: "fc9228d0f911430403a814d59edaf13b"
});

var http = require('http');
var request = require('request');
var express = require('express');
var fs = require('fs');
var lwip = require('lwip');

var app = express();

app.all("/img/*/*", function (req, res) {
    var width = parseInt(req.params[0]);
    var height = parseInt(req.params[1]);
    var randImg = getRandomImage();

    request({url:randImg,  encoding: 'binary'}, function onImageResponse(err, imageResponse, imageBody) {
        if (err) throw err;

        var buffer = new Buffer(imageBody, "binary");
        lwip.open(buffer, 'jpg', function(err, img){
            if (err) throw err;

            img.resize(width, height, 'lanczos', function(err, img){
                if (err) throw err;

                img.toBuffer('jpg', function(err, buff){
                    if (err) throw err;

                    res.writeHead(200, {'Content-Type': 'image/jpg' });
                    res.end(buff, 'binary');
                });
            });
        });

    });

});

var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});


function getRandomImage(){
    var _url = config.url+ Math.round(Math.random() * (8000 - 0 + 1))+".jpg";
    return _url;
}
