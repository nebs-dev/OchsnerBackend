/**
 * OnboardingController
 *
 * @description :: Server-side logic for managing onboarding
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res, next) {
        Onboarding.find({where: {language: req.param("language")}}).populate("images").sort({order: 1}).exec(function foundOnboarding(err, onboarding) {
            if (err) return next(err);

            res.view({onboarding: onboarding, language: req.param("language")});
        });
    },

    'new': function (req, res) {
        res.view("onboarding/createAndUpdate", {language: req.param("language")});
    },

    'showAndUpdate': function (req, res) {
        Onboarding.findOneBySlug(req.param("slug")).populate("images").exec(function foundOnboarding(err, onboarding) {
            if (err || !onboarding) {
                req.session.flash = {err: sails.__("Not found")};
                return res.redirect("/");
            }

            onboarding.devices = _.indexBy(onboarding.images, "device");


            res.view("onboarding/createAndUpdate", {
                onboarding: onboarding,
                language: req.param("language"),
                locals: {
                    update: true,
                    forceUpdate: req.param("update") || false
                }
            });

        });

    },

    'create': function (req, res) {
        Onboarding.create(req.params.all(), function onboardingCreated(err, onboarding) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                // redirect back if error but with flash message
                return res.redirect("onboarding/" + req.param("language") + "/new");
            }

            // if there are pictures in request upload em and add them to db
            if (req.param("devicePic[]")) {
                ImagesService.uploadBlobImages(req.param("devicePic[]"), {
                    type: "onboarding",
                    parentId: onboarding.id
                }, function (err, msg) {
                    if (err) {
                        req.session.flash = ({err: msg});
                    } else {
                        req.session.flash = {success: sails.__("Onboarding created!")};
                    }
                    return res.redirect("/onboarding/" + req.param("language") + "/" + onboarding.slug);
                });
            } else {
                // there are no images, just do the upload
                req.session.flash = {success: sails.__("Onboarding created!")};
                res.redirect("/onboarding/" + req.param("language") + "/" + onboarding.slug);
            }
        });
    },

    'update': function (req, res) {
        var params = req.params.all();
        params.updateSlug = true;
        Onboarding.update(req.param("id"), params, function onboardingUpdated(err, onboarding) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                return res.redirect("/onboarding/" + req.param("language") + "/" + onboarding[0].slug);
            }

            // if there are pictures in request upload em and add them to db
            if (req.param("devicePic[]")) {
                ImagesService.uploadBlobImages(req.param("devicePic[]"), {
                    type: "onboarding",
                    parentId: onboarding[0].id
                }, function (err, msg) {
                    if (err) {
                        req.session.flash = ({err: msg});
                    } else {
                        req.session.flash = {success: sails.__("Onboarding updated!")};
                    }

                    return res.redirect("/onboarding/" + req.param("language") + "/" + onboarding[0].slug);
                });
            } else {
                // there are no images, just do the update
                req.session.flash = {success: sails.__("Onboarding updated!")};
                return res.redirect("/onboarding/" + req.param("language") + "/" + onboarding[0].slug);
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

        Onboarding.find(options).populate("images", populateOptions).sort({order: 1}).exec(function foundOnboarding(err, onboarding) {
            if (err) {
                return res.json(err);
            }
            res.json(onboarding);
        });

    },

    'sort': function (req, res) {
        DatabaseService.sort({
            sortData: req.param("sortData"),
            controller: "onboarding"
        }, function (response) {
            return res.send(response);
        });
    },

    'delete': function (req, res) {
        Onboarding.destroy(req.param("id"), function (err, onboarding) {
            if (err) return res.send({err: true, msg: sails.__("Error while deleting object")});

            return res.send({err: false, msg: sails.__("Object deleted!")});
        });
    },
    'clone': function (req, res) {
        var params = req.params.all();
        params.model = "onboarding";
        DatabaseService.cloneEntry(params, function (response) {
            res.send(response);
        });
    }
};

