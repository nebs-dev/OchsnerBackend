/**
 * OffersController
 *
 * @description :: Server-side logic for managing offers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require("moment");

module.exports = {
    'index': function (req, res, next) {
        Offers.find({where: {language: req.param("language")}}).populate("images").sort({order: 1}).sort({createdAt: -1}).exec(function foundOffers(err, offers) {
            if (err) return next(err);


          var sorted = {archive: [], active: [], planned: [], disabled: []};

          _.each(offers, function(competition) {
            if (moment().isAfter(competition.endDate)) {
              sorted.archive.push(competition);
            } else if (moment().isBefore(competition.endDate) && moment().isAfter(competition.startDate)) {
              sorted.active.push(competition);
            } else if (moment().isBefore(competition.endDate) && moment().isBefore(competition.startDate)) {
              sorted.planned.push(competition);
            } else {
              sorted.disabled.push(competition);
            }

          });

          res.view({moment: moment, offers: _.union(sorted.disabled, sorted.planned, sorted.active, sorted.archive), language: req.param("language")});
        });
    },

    'new': function (req, res) {
        res.view("offers/createAndUpdate", {language: req.param("language")});
    },

    'showAndUpdate': function (req, res) {
        Offers.findOneBySlug(req.param("slug")).populate("images").exec(function foundOffer(err, offer) {
            if (err || !offer) {
                req.session.flash = {err: sails.__("Not found")};
                return res.redirect("/");
            }

            offer.devices = _.indexBy(offer.images, "device");


            res.view("offers/createAndUpdate", {
                offer: offer,
                language: req.param("language"),
                locals: {
                    update: true,
                    forceUpdate: req.param("update") || false
                }
            });

        });

    },

    'create': function (req, res) {
        Offers.create(req.params.all(), function offerCreated(err, offer) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                // redirect back if error but with flash message
                return res.redirect("offers/" + req.param("language") + "/new");
            }

            // if there are pictures in request upload em and add them to db
            if (req.param("devicePic[]")) {
                ImagesService.uploadBlobImages(req.param("devicePic[]"), {
                    type: "offers",
                    parentId: offer.id
                }, function (err, msg) {
                    if (err) {
                        req.session.flash = ({err: msg});
                    } else {
                        req.session.flash = {success: sails.__("Offer created!")};
                    }
                    return res.redirect("/offers/" + req.param("language") + "/" + offer.slug);
                });
            } else {
                // there are no images, just do the upload
                req.session.flash = {success: sails.__("Offer created!")};
                res.redirect("/offers/" + req.param("language") + "/" + offer.slug);
            }
        });
    },

    'update': function (req, res) {
        var params = req.params.all();
        params.updateSlug = true;
        Offers.update(req.param("id"), params, function offerUpdated(err, offer) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                return res.redirect("/offers/" + req.param("language") + "/" + offer[0].slug);
            }

            // if there are pictures in request upload em and add them to db
            if (req.param("devicePic[]")) {
                ImagesService.uploadBlobImages(req.param("devicePic[]"), {
                    type: "offers",
                    parentId: offer[0].id
                }, function (err, msg) {
                    if (err) {
                        req.session.flash = ({err: msg});
                    } else {
                        req.session.flash = {success: sails.__("Offer updated!")};
                    }

                    return res.redirect("/offers/" + req.param("language") + "/" + offer[0].slug);
                });
            } else {
                // there are no images, just do the update
                req.session.flash = {success: sails.__("Offer updated!")};
                return res.redirect("/offers/" + req.param("language") + "/" + offer[0].slug);
            }
        });

    },

    'find': function (req, res) {
        var options = {
            where: {
                startDate: {
                    '<=': new Date()
                },
                endDate: {
                    '>=': new Date()
                }
            }
        };


        var populateOptions = {};

        if (req.param("language")) {
            options.where.language = req.param("language");
        }

        if (req.param("device")) {
            populateOptions.device = req.param("device");
        }

        Offers.find(options).populate("images", populateOptions).sort({order: 1}).sort({createdAt: -1}).exec(function foundOffers(err, offers) {
            if (err) {
                return res.json(err);
            }

            res.json(offers);
        });

    },

    'sort': function (req, res) {
        DatabaseService.sort({
            sortData: req.param("sortData"),
            controller: "offers"
        }, function (response) {
            return res.send(response);
        });
    },

    'delete': function (req, res) {
        Offers.destroy(req.param("id"), function (err, offers) {
            if (err) return res.send({err: true, msg: sails.__("Error while deleting object")});

            return res.send({err: false, msg: sails.__("Object deleted!")});
        });
    },
    'clone': function (req, res) {
        var params = req.params.all();
        params.model = "offers";
        DatabaseService.cloneEntry(params, function (response) {
            res.send(response);
        });
    }
};

