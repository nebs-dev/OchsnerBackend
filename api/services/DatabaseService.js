module.exports = {
    'sort': function (parameters, cb) {
        var sortData = parameters.sortData;

        if (!_.isArray(sortData)) {
            return cb({err: true, response: "Bad request"});
        }

        async.map(sortData, function (sortObj, callback) {
            var sortIndex = sortData.indexOf(sortObj);

            sails.models[parameters.controller].update(sortObj, {order: sortIndex}, function sortUpdated(err, obj) {
                if (err) return callback(true, err);
                return callback(null, obj);
            });
        }, function (err, results) {
            if (err) return cb({err: true, response: "Sort failed!"});

            return cb({err: false, response: "List sorted!"});
        });
    },

    'generatePassword': function (values, cb) {
        if (!values.password || values.password != values.confirmation) {
            return cb({err: true, response: "Password doesn't match password confirmation."});
        }

        var bcrypt = require('bcrypt');
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(values.password, salt, function passwordEncrypted(err, encryptedPassword) {
                if (err) return cb({err: true, response: "Error generating hash."});

                return cb({err: false, encryptedPassword: encryptedPassword});
            });
        });
    },

    'findSlug': function (values, controller, cb) {
        // require slug library
        var slugify = require('slug');
        slugify.defaults.mode = 'pretty';


        // firstly look if that id exists and if title has changed
        if (values.id) {
            sails.models[controller].findOne(values.id, function objectFound(err, obj) {
                if (obj) {
                    if (obj.title === values.title) {
                        // there is no need to create slug...
                        return cb({err: false, response: "Slug creation not needed!"});
                    } else {
                        // title changed... slug needs to change too
                        checkSlug(slugify(values.title));
                    }
                }
            });
        } else {
            // if no id in request, just create slug...
            checkSlug(slugify(values.title));
        }


        // check if integer function
        function isInt(value) {
            return !isNaN(value) && (function (x) {
                    return (x | 0) === x;
                })(parseFloat(value))
        }

        // recursive checkslug funcion
        function checkSlug(slug) {
            sails.models[controller].findOneBySlug(slug, function foundSlug(err, obj) {
                if (err) return cb({err: true, response: "Slug creation failed!"});

                // if there is no slug in db, its done :)
                if (!obj) {
                    values.slug = slug;
                    return cb({err: false, response: "Slug added!"})

                } else {
                    // slug exists, we must add -x number at end
                    var foundSlug = obj.slug;
                    var newSlug;

                    // get last part of slug (ex: some-slug-woho, last part is woho)
                    var lastPart = foundSlug.substr(foundSlug.lastIndexOf("-") + 1);

                    //if last part is integer, we must add +1 to it
                    if (isInt(parseInt(lastPart, 10))) {
                        newSlug = foundSlug.substr(0, foundSlug.lastIndexOf("-")) + "-" + (parseInt(lastPart, 10) + 1);
                    } else {
                        // if its not an integer we will add -1 to slug
                        newSlug = foundSlug + "-1";
                    }

                    return checkSlug(newSlug);
                }
            });
        }


    },

    importTurnoverCSV: function (options) {
        var exec = require("child_process").exec;

        // just for fun
        var start = new Date().getTime();

        // create new turnover log and set it to processing
        TurnoverLog.create({
            fileOriginalPath: options.filePath,
            fileDate: options.fileDate,
            status: "processing"
        }, function (err, turnover) {

            // turnoverLog failed to create
            if (err) return allDone(false, err);

            // first exec regex delete all non valid csv on file
            exec("perl -i -ne '/^\\d{15},\\d+\\.\\d+\\s+?$/ && print' " + options.filePath, function (error, stdout, stderr) {
                // if file is not found or something... stop
                if (stderr || error) {
                    return allDone(turnover, stderr || error);
                }

                // then import to db
                exec("mongoimport --drop --db ochsnerSportClub --collection turnover --fields cardNumber,amountSpent --type csv --file " + options.filePath, function (error, stdout, stderr) {
                    /* something went wrong while importing to mongodb...
                     we must import backup, send third argument to allDone
                     */
                    if (stderr || error) return allDone(turnover, stderr || error, true);

                    // after import move the file to imported if needed
                    if (options.moveFileTo) {
                        exec('mv ' + options.filePath + " " + options.moveFileTo, function (error, stdout, stderr) {
                            // if file move failed... this should not happen
                            sails.log.error(stderr || error);
                            return allDone(turnover, stderr || error);
                        });
                    } else {
                        // just finish no need to move file
                        return allDone(turnover, stderr || error);
                    }

                });

            });
        });


        function allDone(turnover, error, importBackup) {
            var allErrors = error;

            // just for fun
            var end = new Date().getTime();
            var time = end - start;

            if (!turnover) {
                // turnoverlog creation failed... something is not ok with db email loyalty
                EmailService.sendEmail({
                    template: "server-message",
                    subject: "Ochsner Sport Club - Backend ERROR!"
                }, {
                    title: "Backend ERROR!",
                    message: "Turnover creation failed... Old turnover data is still in use!\n" + error
                }, function (err, msg) {
                    if (err) allErrors += "\nError sending mail to loyalty!" + msg;

                    // update log with errors...
                    TurnoverLog.update(turnover.id, {
                        fileMovedPath: options.moveFileTo || options.filePath,
                        status: "error",
                        log: allErrors + "\nProcess took this amount of time: " + time
                    }).exec(console.log);
                });

            } else if (error) {
                // something was not right... log it and email loyalty
                // firstly check if import backup is needed
                if (importBackup) {

                    // take last inserted ok result from db
                    TurnoverLog.findOne({status: "ok"}).sort({createdAt: -1}).exec(function (err, lastImport) {
                        if (err) {
                            allErrors += "\nError finding turnoverlog: " + err;

                            // no turnovers ever succeeded or imported -.-" ...sheeeeeet
                            EmailService.sendEmail({
                                template: "server-message",
                                subject: "Ochsner Sport Club - Backend ERROR!"
                            }, {
                                title: "Backend ERROR!",
                                message: "Turnover creation failed... Backup was needed, but there was no CSV to backup!\nServer error: " + err
                            }, function (err, msg) {
                                if (err) allErrors += "\nError sending mail to loyalty!" + msg;

                                // update log with errors...
                                TurnoverLog.update(turnover.id, {
                                    fileMovedPath: options.moveFileTo || options.filePath,
                                    status: "error",
                                    log: allErrors
                                }).exec(console.log);
                            });
                        } else {
                            // import old file...
                            exec("mongoimport --drop --db ochsnerSportClub --collection turnover --fields cardNumber,amountSpent --type csv --file " + pathToImported + lastImport.fileName, function (error, stdout, stderr) {
                                var message = "Turnover creation failed... Server imported old CSV (" + lastImport.fileName + ")";
                                if (stderr || error) {
                                    // backup import failed... again sheeeeeet!
                                    message = "Turnover creation failed... Server tried to import backup, but there was an error: " + stderr || error;
                                }

                                EmailService.sendEmail({
                                    template: "server-message",
                                    subject: "Ochsner Sport Club - Backend ERROR!"
                                }, {
                                    title: "Backend ERROR!",
                                    message: message
                                }, function (err, msg) {
                                    if (err) allErrors += "\nError sending mail to loyalty!" + msg;

                                    // update log with errors...
                                    TurnoverLog.update(turnover.id, {
                                        fileMovedPath: options.moveFileTo || options.filePath,
                                        status: "error",
                                        log: allErrors
                                    }).exec(console.log);
                                });

                            });
                        }
                    });

                } else {
                    // there is no need for backup import... just send email and update log
                    EmailService.sendEmail({
                        template: "server-message",
                        subject: "Ochsner Sport Club - Backend ERROR!"
                    }, {
                        title: "Backend ERROR!",
                        message: "There was an error importing new CSV to backend. Server error: " + allErrors
                    }, function (err, msg) {
                        if (err) allErrors += "\nError sending mail to loyalty!" + msg;

                        // update log with errors...
                        TurnoverLog.update(turnover.id, {
                            fileMovedPath: options.moveFileTo || options.filePath,
                            status: "error",
                            log: allErrors + "\nProcess took this amount of time: " + time
                        }).exec(console.log);
                    });
                }


            } else {
                // all was ok! log it
                TurnoverLog.update(turnover.id, {
                    fileMovedPath: options.moveFileTo || options.filePath,
                    status: "ok",
                    log: "Process took this amount of time: " + time
                }).exec(console.log);
            }
        }
    },

    importInitialCardsCSV: function (options) {
        // todo merge this with another importer as a function...
        var exec = require("child_process").exec;
        exec("mongoimport --drop --db ochsnerSportClub --collection cards --fields cardNumber,available --type csv --file /OchsnerBackend/cards.csv", function (error, stdout, stderr) {
            if (error || stderr) {
                console.log("CARDS IMPORT FAILED!", stderr);
            } else {
                console.log("Initial cards imported!");
            }
        });
    },

    cloneEntry: function (parameters, cb) {
        sails.models[parameters.model].findOne(parameters.id).populateAll().exec(function (err, entry) {
            if (err) return cb({err: true, response: "Bad request"});

            // prepare clone
            var clonThis = entry.toObject();
            clonThis.title += " - cloned";
            clonThis.language = parameters.cloneToLanguage;

            // delete unnecessery fields (they will autogenerate itself)
            delete clonThis.id;
            delete clonThis.order;
            delete clonThis.createdAt;
            delete clonThis.updatedAt;
            delete clonThis.active;
            delete clonThis.images;


            // and create clon
            sails.models[parameters.model].create(clonThis, function (err, clon) {
                if (err) return cb({err: true, response: "Cloning failed!"});
                // clone images too!
                if (entry.images) {
                    ImagesService.cloneImages(entry.images, {
                        type: parameters.model,
                        parentId: clon.id
                    }, function (err) {
                        // update in cb is if clone was demanded from same language, so we refresh page in ajaxTableScript.js
                        if (err) return cb({
                            err: true,
                            response: sails.__("Object cloned, but images failed to clone..."),
                            update: (parameters.cloneToLanguage === parameters.language)
                        });

                        return cb({
                            err: false,
                            response: sails.__("Object cloned!"),
                            update: (parameters.cloneToLanguage === parameters.language)
                        });
                    });
                } else {
                    return cb({
                        err: false,
                        response: sails.__("Object cloned!"),
                        update: (parameters.cloneToLanguage === parameters.language)
                    });
                }


            });

        });
    }
};