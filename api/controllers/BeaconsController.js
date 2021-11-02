/**
 * BeaconsController
 *
 * @description :: Server-side logic for managing beacons
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res, next) {
        Beacons.find().sort({order: 1}).exec(function foundBeacons(err, beacons) {
            if (err) return next(err);

            res.view({beacons: beacons});
        });
    },

    'new': function (req, res) {
        Vouchers.find().exec(function (err, vouchers) {
            Stores.find().exec(function (err, stores) {
                res.view("beacons/createAndUpdate", {stores: stores, vouchers: vouchers});
            });
        });
    },

    'showAndUpdate': function (req, res) {
        Beacons.findOneBySlug(req.param("slug")).exec(function foundBeacons(err, beacon) {
            if (err || !beacon) {
                req.session.flash = {err: sails.__("Not found")};
                return res.redirect("/");
            }

            Vouchers.find().exec(function (err, vouchers) {
                Stores.find().exec(function (err, stores) {
                    res.view("beacons/createAndUpdate", {
                        beacon: beacon,
                        vouchers: vouchers,
                        stores: stores,
                        locals: {
                            update: true,
                            forceUpdate: req.param("update") || false
                        }
                    });
                });
            });
        });

    },

    'create': function (req, res) {
        Beacons.create(req.params.all(), function beaconCreated(err, beacon) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                // redirect back if error but with flash message
                return res.redirect("beacons/new");
            }

            req.session.flash = {success: sails.__("Beacon created!")};
            res.redirect("/beacons/" + beacon.slug);
        });
    },

    'update': function (req, res) {
        var params = req.params.all();
        params.updateSlug = true;
        Beacons.update(req.param("id"), params, function beaconUpdated(err, beacon) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                return res.redirect("/beacons/" + beacon[0].slug);
            }

            req.session.flash = {success: sails.__("Beacon updated!")};
            return res.redirect("/beacons/" + beacon[0].slug);

        });

    },

    'find': function (req, res) {
        Beacons.find().sort({order: 1}).populateAll().exec(function foundBeacons(err, beacons) {
            if (err) {
                return res.json(err);
            }

            res.json(beacons);
        });

    },

    'sort': function (req, res) {
        DatabaseService.sort({
            sortData: req.param("sortData"),
            controller: "beacons"
        }, function (response) {
            return res.send(response);
        });
    },

    'delete': function (req, res) {
        Beacons.destroy(req.param("id"), function (err, beacon) {
            if (err) return res.send({err: true, msg: sails.__("Error while deleting object")});

            return res.send({err: false, msg: sails.__("Object deleted!")});
        });
    }

};

