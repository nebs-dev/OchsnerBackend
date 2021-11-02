var fs = require("fs-extra");
var shortId = require("shortid");

var fileRoot = "assets/";

module.exports = {
    'uploadBlobImages': function (images, options, cb) {
        var unique = shortId.generate();
        var blobs = [];

        // check if we have multiple images or just one
        if (_.isArray(images)) {
            blobs = images;
        } else {
            blobs[0] = images;
        }

        // holder for error string for user... if something goes wrong
        var asyncFailed = "";

        async.each(blobs, function (blob, callback) {
            // if empty, its probably update request and image was not touched... so skip it
            if (!_.isEmpty(blob)) {
                try {
                    var imageData = blob.split(",");
                    // gives [0] => iphone5:data:image/jpeg;base64  [1] => base64data

                    var imageMeta = imageData[0].split(":");
                    // gives ['iphone5', 'data', 'image/jpeg;base64']

                    //check if image and take extension
                    var imageType = imageMeta[2].split("/");
                    // gives ['image', 'jpeg;base64']
                    if (imageType[0] !== "image") {
                        return cb(true, "Please don't touch hidden fields...");
                    }

                    var extension = "." + imageType[1].split(";")[0];
                } catch (err) {
                    // log the error but continue working
                    sails.log.error("Async failed", err);
                    asyncFailed = "Error while writing one of the files";
                    return callback();
                }

                // make query
                var dbData = {};
                dbData.device = imageMeta[0];
                dbData[options.type] = options.parentId;

                // make file data
                var filePathAndName = "images/uploads/" + options.type + "/" + options.parentId + "-" + unique + "-" + imageMeta[0] + extension;


                // if you find image for this parentId and device... destroy it then reupload/reinsert it
                Images.findOne(dbData, function (err, image) {
                    if (err) {
                        // this shouldn't happen... but if it does stop async
                        stopAsync(err);
                    }

                    // add filepath to params, after find query finished
                    dbData.url = filePathAndName;

                    if (image) {
                        // it exists... destroy it
                        Images.destroy(image.id, function (err) {
                            if (err) {
                                // this shouldn't happen... but if it does stop async
                                stopAsync(err);
                            }

                            // write image...
                            fs.writeFile(fileRoot + filePathAndName, imageData[1], "base64", function (err) {
                                if (err) {
                                    // log the error but continue working
                                    sails.log.error("Write image failed after destroying existing image", err);
                                    asyncFailed = "Error while writing one of the files";
                                    return callback();
                                }

                                // now reinsert to db
                                Images.create(dbData, function imageCreated(err, image) {
                                    if (err) {
                                        // this shouldn't happen... but if it does stop async
                                        stopAsync(err);
                                    }

                                    return callback();
                                });
                            });


                        });
                    } else {
                        // just save it... no need for destroy
                        // write image...
                        fs.writeFile(fileRoot + filePathAndName, imageData[1], "base64", function (err) {
                            if (err) {
                                // log the error but continue working
                                sails.log.error("Write image failed", err);
                                asyncFailed = "Error while writing one of the files";
                                return callback();
                            }

                            // insert it to db
                            Images.create(dbData, function imageCreated(err, image) {
                                if (err) {
                                    // this shouldn't happen... but if it does stop async
                                    sails.log.error(err);
                                    return cb(true, "Error writing to database");
                                }

                                callback();
                            });

                        });
                    }
                });
            } else {
                // go to next, this one is empty or we are at update screen and image was not touched at all
                callback();
            }
        }, function (err) {
            if (err) {
                sails.log.error(err);
                return cb(true, "Error while writing file.");
            }


            if (asyncFailed !== "") {
                return cb(true, asyncFailed);
            } else {
                return cb(false, "Images uploaded!");
            }

        });

        // stops async if something is wrong, but shouldn't happen if server is online...
        function stopAsync(err) {
            sails.log.error(err);
            return cb(true, "Error writing to database");
        }
    },

    cloneImages: function (images, parameters, cb) {
        var unique = shortId.generate();

        async.each(images, function (image, callback) {
            var deviceAndExtension = image.device + image.url.substr(image.url.lastIndexOf("."));

            var clonedFilePathAndName = "images/uploads/" + parameters.type + "/" + parameters.parentId + "-" + unique + "-" + deviceAndExtension;

            var dbData = {
                url: clonedFilePathAndName,
                device: image.device
            };
            dbData[parameters.type] = parameters.parentId;


            // write image...
            fs.copy(fileRoot + image.url, fileRoot + clonedFilePathAndName, function (err) {
                if (err) return callback(true);

                // insert clone to db
                Images.create(dbData, function imageCreated(err) {
                    return callback();
                });
            });


        }, function (err) {
            if (err) return cb(true, "Error while cloning images.");

            return cb(false, "Images cloned!");
        });


    }
};