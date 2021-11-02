/**
 * TeasersController
 *
 * @description :: Server-side logic for managing teasers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res, next) {
        Teasers.find({where: {language: req.param("language")}}).populate("images").sort({order: 1}).exec(function foundTeasers(err, teasers) {
            if (err) return next(err);

            res.view({teasers: teasers, language: req.param("language")});
        });
    },

    'new': function (req, res) {
        res.view("teasers/createAndUpdate", {language: req.param("language")});
    },

    'showAndUpdate': function (req, res) {
        Teasers.findOneBySlug(req.param("slug")).populate("images").exec(function foundTeaser(err, teaser) {
            if (err || !teaser) {
                req.session.flash = {err: sails.__("Not found")};
                return res.redirect("/");
            }

            teaser.devices = _.indexBy(teaser.images, "device");


            res.view("teasers/createAndUpdate", {
                teaser: teaser,
                language: req.param("language"),
                locals: {
                    update: true,
                    forceUpdate: req.param("update") || false
                }
            });

        });

    },

    'create': function (req, res) {
        Teasers.create(req.params.all(), function teaserCreated(err, teaser) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                // redirect back if error but with flash message
                return res.redirect("teasers/" + req.param("language") + "/new");
            }

            // if there are pictures in request upload em and add them to db
            if (req.param("devicePic[]")) {
                ImagesService.uploadBlobImages(req.param("devicePic[]"), {
                    type: "teasers",
                    parentId: teaser.id
                }, function (err, msg) {
                    if (err) {
                        req.session.flash = ({err: msg});
                    } else {
                        req.session.flash = {success: sails.__("Teaser created!")};
                    }
                    return res.redirect("/teasers/" + req.param("language") + "/" + teaser.slug);
                });
            } else {
                // there are no images, just do the upload
                req.session.flash = {success: sails.__("Teaser created!")};
                res.redirect("/teasers/" + req.param("language") + "/" + teaser.slug);
            }
        });
    },

    'update': function (req, res) {
        var params = req.params.all();
        params.updateSlug = true;
        Teasers.update(req.param("id"), params, function teaserUpdated(err, teaser) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                return res.redirect("/teasers/" + req.param("language") + "/" + teaser[0].slug);
            }

            // if there are pictures in request upload em and add them to db
            if (req.param("devicePic[]")) {
                ImagesService.uploadBlobImages(req.param("devicePic[]"), {
                    type: "teasers",
                    parentId: teaser[0].id
                }, function (err, msg) {
                    if (err) {
                        req.session.flash = ({err: msg});
                    } else {
                        req.session.flash = {success: sails.__("Teaser updated!")};
                    }

                    return res.redirect("/teasers/" + req.param("language") + "/" + teaser[0].slug);
                });
            } else {
                // there are no images, just do the update
                req.session.flash = {success: sails.__("Teaser updated!")};
                return res.redirect("/teasers/" + req.param("language") + "/" + teaser[0].slug);
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

        Teasers.find(options).populate("images", populateOptions).sort({order: 1}).exec(function foundTeasers(err, teasers) {
            if (err) {
                return res.json(err);
            }

            res.json(teasers);
        });

    },

    'sort': function (req, res) {
        DatabaseService.sort({
            sortData: req.param("sortData"),
            controller: "teasers"
        }, function (response) {
            return res.send(response);
        });
    },

    'delete': function (req, res) {
        Teasers.destroy(req.param("id"), function (err, teasers) {
            if (err) return res.send({err: true, msg: sails.__("Error while deleting object")});

            return res.send({err: false, msg: sails.__("Object deleted!")});
        });
    },
    'clone': function (req, res) {
        var params = req.params.all();
        params.model = "teasers";
        DatabaseService.cloneEntry(params, function (response) {
            res.send(response);
        });
    }
};