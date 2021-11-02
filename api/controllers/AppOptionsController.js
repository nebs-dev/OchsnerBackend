/**
 * AppOptionsController
 *
 * @description :: Server-side logic for managing appOptions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res, next) {
        AppOptions.find({where: {language: req.param("language")}}).populate("images").sort({order: 1}).exec(function foundAppOptions(err, appOptions) {
            if (err) return next(err);

            res.view({appOptions: appOptions, language: req.param("language")});
        });
    },

    'new': function (req, res) {
        res.view("appoptions/createAndUpdate", {language: req.param("language")});
    },

    'showAndUpdate': function (req, res) {
        AppOptions.findOneBySlug(req.param("slug")).populate("images").exec(function foundAppOption(err, appOption) {
            if (err || !appOption) {
                req.session.flash = {err: sails.__("Not found")};
                return res.redirect("/");
            }

            appOption.devices = _.indexBy(appOption.images, "device");


            // check if view exist and if not, load default
            var view = 'createAndUpdate';
            require('fs').exists(sails.config.appPath + '/views/appoptions/' + appOption.view + '.ejs', function (exists) {
                if (exists) {
                    view = appOption.view
                }


                res.view("appoptions/" + view, {
                    appOption: appOption,
                    language: req.param("language"),
                    locals: {
                        update: true,
                        forceUpdate: req.param("update") || false
                    }
                });
            });


        });

    },

    'create': function (req, res) {
        var params = req.params.all();
        delete params._csrf;

        AppOptions.create(params, function appOptionCreated(err, appOption) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                // redirect back if error but with flash message
                return res.redirect("appOptions/" + req.param("language") + "/new");
            }

            // if there are pictures in request upload em and add them to db
            if (req.param("devicePic[]")) {
                ImagesService.uploadBlobImages(req.param("devicePic[]"), {
                    type: "appOptions",
                    parentId: appOption.id
                }, function (err, msg) {
                    if (err) {
                        req.session.flash = ({err: msg});
                    } else {
                        req.session.flash = {success: sails.__("AppOption created!")};
                    }
                    return res.redirect("/appOptions/" + req.param("language") + "/" + appOption.slug);
                });
            } else {
                // there are no images, just do the upload
                req.session.flash = {success: sails.__("AppOption created!")};
                res.redirect("/appOptions/" + req.param("language") + "/" + appOption.slug);
            }
        });
    },

    'update': function (req, res) {
        var params = req.params.all();
        delete params._csrf;
        delete params["devicePic[]"];
        delete params["imageReady[]"];

        params.updateSlug = true;
        AppOptions.update(req.param("id"), params, function appOptionUpdated(err, appOption) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                return res.redirect("/appOptions/" + req.param("language") + "/" + appOption[0].slug);
            }

            // if there are pictures in request upload em and add them to db
            if (req.param("devicePic[]")) {
                ImagesService.uploadBlobImages(req.param("devicePic[]"), {
                    type: "appoptions",
                    parentId: appOption[0].id
                }, function (err, msg) {
                    if (err) {
                        req.session.flash = ({err: msg});
                    } else {
                        req.session.flash = {success: sails.__("AppOption updated!")};
                    }

                    return res.redirect("/appOptions/" + req.param("language") + "/" + appOption[0].slug);
                });
            } else {
                // there are no images, just do the update
                req.session.flash = {success: sails.__("AppOption updated!")};
                return res.redirect("/appOptions/" + req.param("language") + "/" + appOption[0].slug);
            }
        });

    },

    'find': function (req, res) {
        var options = {};
        var populateOptions = {};

        if (req.param("language")) {
            options.language = req.param("language");
        }

        if (req.param("device")) {
            populateOptions.device = req.param("device");
        }

        AppOptions.find(options).populate("images", populateOptions).sort({order: 1}).exec(function foundAppOptions(err, appOptions) {
            if (err) {
                return res.json(err);
            }

            _.map(appOptions, function (appOption) {
                delete appOption.view;
                delete appOption.order;
                delete appOption.slug;
                delete appOption.updateSlug;
                delete appOption['textReady[]'];
                delete appOption['_wysihtml5_mode'];
            });


            res.json(_.indexBy(appOptions, 'apiVar'));
        });

    },

    'sort': function (req, res) {
        DatabaseService.sort({
            sortData: req.param("sortData"),
            controller: "appoptions"
        }, function (response) {
            return res.send(response);
        });
    },

    'delete': function (req, res) {
        AppOptions.destroy(req.param("id"), function (err, appOptions) {
            if (err) return res.send({err: true, msg: sails.__("Error while deleting object")});

            return res.send({err: false, msg: sails.__("Object deleted!")});
        });
    },
    'clone': function (req, res) {
        var params = req.params.all();
        params.model = "appoptions";
        DatabaseService.cloneEntry(params, function (response) {
            res.send(response);
        });
    }
};