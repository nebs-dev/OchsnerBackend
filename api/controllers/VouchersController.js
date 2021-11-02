/**
 * VouchersController
 *
 * @description :: Server-side logic for managing vouchers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res, next) {
        Vouchers.find().populate("images").sort({order: 1}).exec(function foundVouchers(err, vouchers) {
            if (err) return next(err);

            res.view({vouchers: vouchers});
        });
    },

    'new': function (req, res) {
        Stores.find().exec(function (err, stores) {
            res.view("vouchers/createAndUpdate", {stores: stores});
        });
    },

    'showAndUpdate': function (req, res) {
        Vouchers.findOneBySlug(req.param("slug")).populateAll().exec(function foundVouchers(err, voucher) {
            if (err || !voucher) {
                req.session.flash = {err: sails.__("Not found")};
                return res.redirect("/");
            }

            voucher.devices = _.indexBy(voucher.images, "device");

            // we dont want all the comma separated values on client, just count em
            if(voucher.filterCards) {
                voucher.filterCards = voucher.filterCards.split(",").length;
            }

            Stores.find().exec(function (err, stores) {
                res.view("vouchers/createAndUpdate", {
                    voucher: voucher,
                    stores: stores,
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
        params.benefit = params["benefit-" + params.benefitType] || "";

        Vouchers.create(params, function voucherCreated(err, voucher) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                // redirect back if error but with flash message
                return res.redirect("vouchers/new");
            }

            // if there are pictures in request upload em and add them to db
            if (req.param("devicePic[]")) {
                ImagesService.uploadBlobImages(req.param("devicePic[]"), {
                    type: "vouchers",
                    parentId: voucher.id
                }, function (err, msg) {
                    if (err) {
                        req.session.flash = ({err: msg});
                    } else {
                        req.session.flash = {success: sails.__("Voucher created!")};
                    }
                    return res.redirect("/vouchers/" + voucher.slug);
                });
            } else {
                // there are no images, just do the upload
                req.session.flash = {success: sails.__("Voucher created!")};
                res.redirect("/vouchers/" + voucher.slug);
            }
        });
    },

    'update': function (req, res) {
        var params = req.params.all();
        params.benefit = params["benefit-" + params.benefitType] || "";

        // if filterCards value is string "true", we dont update cards...
        if(params.filterCards == "true") {
            delete(params.filterCards);
        }

        params.updateSlug = true;
        Vouchers.update(req.param("id"), params, function voucherUpdated(err, voucher) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                return res.redirect("/vouchers/" + voucher[0].slug);
            }

            // if there are pictures in request upload em and add them to db
            if (req.param("devicePic[]")) {
                ImagesService.uploadBlobImages(req.param("devicePic[]"), {
                    type: "vouchers",
                    parentId: voucher[0].id
                }, function (err, msg) {
                    if (err) {
                        req.session.flash = ({err: msg});
                    } else {
                        req.session.flash = {success: sails.__("Voucher updated!")};
                    }

                    return res.redirect("/vouchers/" + voucher[0].slug);
                });
            } else {
                // there are no images, just do the update
                req.session.flash = {success: sails.__("Voucher updated!")};
                return res.redirect("/vouchers/" + voucher[0].slug);
            }
        });

    },

    'find': function (req, res) {
        var options = {};
        var populateOptionsImages = {};
        var populateOptionsStores = {};

        if (req.param("benefitType")) {
            options.benefitType = req.param("benefitType");
        }

        if (req.param("startDate")) {
            options.startDate = {">=": new Date(req.param("startDate"))};
        }

        if (req.param("endDate")) {
            options.endDate = {"<=": new Date(req.param("endDate"))};
        }


        if (req.param("device")) {
            populateOptionsImages.device = req.param("device");
        }


        if (req.param("storeName")) {
            populateOptionsStores.title = {"like": "%" + req.param("storeName") + "%"};
        }

        if (req.param("storeCity")) {
            populateOptionsStores.city = {"like": "%" + req.param("storeCity") + "%"};
        }

        if (req.param("storePostcode")) {
            populateOptionsStores.postcode = req.param("postcode");
        }


        Vouchers.find(options).populate("images", populateOptionsImages).populate("filterStores", populateOptionsStores).exec(function foundOffers(err, offers) {
            if (err) {
                return res.json(err);
            }


            offers = _.map(offers, function (offer) {

                    // if there were store search params, and stores object is empty return cause we dont need that entry
                    if (!_.isEmpty(populateOptionsStores)) {
                        if (_.isEmpty(offer.filterStores)) return;
                    }


                    if (req.param("language")) {
                        var filterLanguage = req.param("language").split(",");

                        if (!_.isEmpty(_.intersection(offer.filterLanguage, filterLanguage))) {
                            return offer;
                        }


                    } else if (req.param("gender")) {
                        var filterGender = req.param("gender").split(",");

                        if (!_.isEmpty(_.intersection(offer.filterGender, filterGender))) {
                            return offer;
                        }

                    } else {
                        return offer;
                    }
                }
            )
            ;


            res.json(_.compact(offers));
        });


    },


    'sort': function (req, res) {
        DatabaseService.sort({
            sortData: req.param("sortData"),
            controller: "vouchers"
        }, function (response) {
            return res.send(response);
        });
    },


    'delete': function (req, res) {
        Vouchers.destroy(req.param("id"), function (err, voucher) {
            if (err) return res.send({err: true, msg: sails.__("Error while deleting object")});

            return res.send({err: false, msg: sails.__("Object deleted!")});
        });
    }

};

