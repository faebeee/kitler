var config = {
    "url" : "http://www.catsthatlooklikehitler.com/kitler/pics/kitler",
    'port' : process.env.PORT||3000,
    "flickr" : {
        "api" : "fc9228d0f911430403a814d59edaf13b",
    }
};

var http = require('http');
var request = require('request');
var express = require('express');
var fs = require('fs');
var lwip = require('lwip');
var Flickr = require("node-flickr");
var keys = {"api_key": config.flickr.api};
var flickr = new Flickr(keys);
var maxPageSearch = 15;
var app = express();

app.use(express.static(__dirname+'/html'));

var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

app.get('/', function(req, res){
    res.sendfile(__dirname + '/index.html');
});

app.all("/my/*/*/*", function (req, res) {
    var id = parseInt(req.params[0]);
    var width = parseInt(req.params[1]);
    var height = parseInt(req.params[2]);

    flickr.get("photos.getSizes", {"photo_id":id}, function(err, result){
        if (err) throw err;
        var images = result.sizes.size, len = images.length;
        for(var i=0; i < len; i++){
            var image = images[i];
            if(image.width >= width && image.height >= height){
                proceedImage(image.source, width, height, res, id);
                return;
            }
        }
    });
});

app.all("/v1/*/*", function(req, res){
    var width = parseInt(req.params[0]);
    var height = parseInt(req.params[1]);


    v1.getImage(width, height, function( uri, id ){
        v1.proceedImage(uri, width, height, res, id);
    });
});


app.all("/v2/*/*", function(req, res){
    var width = parseInt(req.params[0]);
    var height = parseInt(req.params[1]);

    v2.getImage(width, height, function( uri, id ){
        v2.proceedImage(uri, width, height, res, id);
    });
});

var core = {
    sendBufferedImage : function ( img, res ){
        img.toBuffer('jpg', function(err, buff){
            if (err) throw err;

            var filename = img.filename;

            res.setHeader('Content-disposition', 'filename=' + filename);
            res.writeHead(200, {'Content-Type': 'image/jpg' });
            res.end(buff, 'binary');
        });
    }
}

var v1 = {
    getImage : function (width, height, callback, page){
        var randomId = Math.round( Math.random() * 8000 );
        var url = config.url+""+randomId+".jpg";
        callback(url, randomId);
    },

    proceedImage : function (source, width, height, res, id){
        width = width || 100;
        height = height || 100;

        width = width == 0 ? 100 : width;
        height = height == 0 ? 100 : height;

        request({url:source,  encoding: 'binary'}, function (err, imageResponse, imageBody) {
            if (err) throw err;

            var buffer = new Buffer(imageBody, "binary");
            lwip.open(buffer, 'jpg', function(err, img){
                var size = width > height ? width : height;
                //img.resize(size, function(err, img){
                    img.crop(width, height, function(err, img){
                        if (err) throw err;
                        img.filename = id;
                        core.sendBufferedImage(img, res);
                    });
                //});
            });
        });
    }
}


var v2 = {

    getImage : function (width, height, callback, page){
        page = page || 1;
        flickr.get("photos.search", {"text":"kitler, cat"}, function(err, result){
            if (err) return console.error(err);
            var max = result.photos.photo.length;
            var randId = Math.round( Math.random() * max );
            var randImg = result.photos.photo[randId];

            flickr.get("photos.getSizes", {"photo_id":randImg.id}, function(err, result){
                if (err) return console.error(err);

                var images = result.sizes.size, len = images.length;
                for(var i=0; i < len; i++){
                    var image = images[i];
                    if(image.width >= width && image.height >= height){
                        callback(image.source, randImg.id);
                        return image.source;
                    }
                }
                console.warn('no image found. looking on page '+page);
                if(page >= maxPageSearch){
                    throw ("No Image found in "+maxPageSearch+" Pages");
                }
                return v2.getImage(width, height, callback, page+1);
            });
        });
    },

    proceedImage : function (source, width, height, res, id){
        width = width || null;
        height = height || null;

        width = width == 0 ? 100 : width;
        height = height == 0 ? 100 : height;

        request({url:source,  encoding: 'binary'}, function (err, imageResponse, imageBody) {
            if (err) throw err;

            var buffer = new Buffer(imageBody, "binary");
            lwip.open(buffer, 'jpg', function(err, img){
                if (err) throw err;
                if(width && height){
                    img.crop(width, height, function(err, img){
                        if (err) throw err;
                        img.filename = id;
                        core.sendBufferedImage(img, res);
                    });
                }else{
                    core.sendBufferedImage(img, res);
                }
            });
        });
    }
}
