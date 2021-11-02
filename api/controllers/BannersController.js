/**
 * BannersController
 *
 * @description :: Server-side logic for managing banners
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res, next) {
        Banners.find({where: {language: req.param("language")}}).populate("images").sort({order: 1}).exec(function foundBanners(err, banners) {
            if (err) return next(err);

            res.view({banners: banners, language: req.param("language")});
        });
    },

    'new': function (req, res) {
        res.view("banners/createAndUpdate", {language: req.param("language")});
    },

    'showAndUpdate': function (req, res) {
        Banners.findOneBySlug(req.param("slug")).populate("images").exec(function foundBanner(err, banner) {
            if (err || !banner) {
                req.session.flash = {err: sails.__("Not found")};
                return res.redirect("/");
            }

            banner.devices = _.indexBy(banner.images, "device");


            res.view("banners/createAndUpdate", {
                banner: banner,
                language: req.param("language"),
                locals: {
                    update: true,
                    forceUpdate: req.param("update") || false
                }
            });

        });

    },

    'create': function (req, res) {
        Banners.create(req.params.all(), function bannerCreated(err, banner) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                // redirect back if error but with flash message
                return res.redirect("banners/" + req.param("language") + "/new");
            }

            // if there are pictures in request upload em and add them to db
            if (req.param("devicePic[]")) {
                ImagesService.uploadBlobImages(req.param("devicePic[]"), {
                    type: "banners",
                    parentId: banner.id
                }, function (err, msg) {
                    if (err) {
                        req.session.flash = ({err: msg});
                    } else {
                        req.session.flash = {success: sails.__("Banner created!")};
                    }
                    return res.redirect("/banners/" + req.param("language") + "/" + banner.slug);
                });
            } else {
                // there are no images, just do the upload
                req.session.flash = {success: sails.__("Banner created!")};
                res.redirect("/banners/" + req.param("language") + "/" + banner.slug);
            }
        });
    },

    'update': function (req, res) {
        var params = req.params.all();
        params.updateSlug = true;
        Banners.update(req.param("id"), params, function bannerUpdated(err, banner) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                return res.redirect("/banners/" + req.param("language") + "/" + banner[0].slug);
            }

            // if there are pictures in request upload em and add them to db
            if (req.param("devicePic[]")) {
                ImagesService.uploadBlobImages(req.param("devicePic[]"), {
                    type: "banners",
                    parentId: banner[0].id
                }, function (err, msg) {
                    if (err) {
                        req.session.flash = ({err: msg});
                    } else {
                        req.session.flash = {success: sails.__("Banner updated!")};
                    }

                    return res.redirect("/banners/" + req.param("language") + "/" + banner[0].slug);
                });
            } else {
                // there are no images, just do the update
                req.session.flash = {success: sails.__("Banner updated!")};
                return res.redirect("/banners/" + req.param("language") + "/" + banner[0].slug);
            }
        });

    },

    'find': function (req, res) {
        var options = {};
        var populateOptions = {};

        if (req.param("language")) {
            options.language = req.param("language");
        }

        if (req.param("active")) {
            options.active = 1;
        }

        if (req.param("device")) {
            populateOptions.device = req.param("device");
        }

        Banners.find(options).populate("images", populateOptions).sort({order: 1}).exec(function foundBanners(err, banners) {
            if (err) {
                return res.json(err);
            }

            return res.json(banners);
        });

    },

    'setActive': function (req, res) {
        var update = req.param("update") ? true : false;
        if (update) {
            Banners.update({active: 1, language: req.param("language")}, {active: 0}, function (err1) {
                Banners.update(req.param("id"), {active: 1}, function (err2) {
                    if (err1 || err2) return res.send({
                        err: true,
                        msg: sails.__("Error while setting banner to active!")
                    });
                    return res.send({err: false, msg: sails.__("Banner set to active!")});
                });
            });
        } else {
            // just set not active
            Banners.update({active: 1, language: req.param("language")}, {active: 0}, function (err) {
                if (err) return res.send({err: true, msg: sails.__("Error while setting banner to active!")});
                return res.send({err: false, msg: sails.__("Banner set to not active!")});
            });
        }

    },

    'sort': function (req, res) {
        DatabaseService.sort({
            sortData: req.param("sortData"),
            controller: "banners"
        }, function (response) {
            return res.send(response);
        });
    },

    'delete': function (req, res) {
        Banners.destroy(req.param("id"), function (err, banners) {
            if (err) return res.send({err: true, msg: sails.__("Error while deleting object")});

            return res.send({err: false, msg: sails.__("Object deleted!")});
        });
    },
    'clone': function (req, res) {
        var params = req.params.all();
        params.model = "banners";
        DatabaseService.cloneEntry(params, function (response) {
            res.send(response);
        });
    }
};

