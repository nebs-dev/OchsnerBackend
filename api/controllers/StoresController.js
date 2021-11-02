/**
 * StoresController
 *
 * @description :: Server-side logic for managing stores
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res, next) {
        Stores.find().sort({order: 1}).exec(function foundStores(err, stores) {
            if (err) return next(err);

            res.view({stores: stores});
        });
    },

    'new': function (req, res) {
        res.view("stores/createAndUpdate");
    },

    'showAndUpdate': function (req, res) {
        Stores.findOneBySlug(req.param("slug")).exec(function foundStores(err, store) {
            if (err || !store) {
                req.session.flash = {err: sails.__("Not found")};
                return res.redirect("/");
            }


            res.view("stores/createAndUpdate", {
                store: store,
                locals: {
                    update: true,
                    forceUpdate: req.param("update") || false
                }
            });

        });

    },

    'create': function (req, res) {
        Stores.create(req.params.all(), function storeCreated(err, store) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                // redirect back if error but with flash message
                return res.redirect("stores/new");
            }

            req.session.flash = {success: sails.__("Store created!")};
            res.redirect("/stores/" + store.slug);
        });
    },

    'update': function (req, res) {
        var params = req.params.all();
        params.updateSlug = true;
        Stores.update(req.param("id"), params, function storeUpdated(err, store) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                return res.redirect("/stores/" + store[0].slug);
            }

            req.session.flash = {success: sails.__("Store updated!")};
            return res.redirect("/stores/" + store[0].slug);

        });

    },

    'find': function (req, res) {

        var sort = {};
        var order = 1;

        if (req.param("order") === "DESC") {
            order = -1;
        }

        if (req.param("orderBy")) {
            sort[req.param("orderBy")] = order;
        } else {
            sort = {order: order};
        }


        // if searching by distance...
        if (req.param("lat") && req.param("lng")) {
            Stores.find().sort(sort).exec(function foundStores(err, stores) {
                function calcDistance(lat1, lng1, lat2, lng2) {
                    var radlat1 = Math.PI * lat1 / 180;
                    var radlat2 = Math.PI * lat2 / 180;
                    var radlng1 = Math.PI * lng1 / 180;
                    var radlng2 = Math.PI * lng2 / 180;
                    var theta = lng1 - lng2;
                    var radtheta = Math.PI * theta / 180;
                    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                    dist = Math.acos(dist);
                    dist = dist * 180 / Math.PI;
                    dist = dist * 60 * 1.1515;

                    dist = dist * 1.609344;

                    return dist.toFixed(1);
                }

                _.map(stores, function (store) {
                    store.distance = calcDistance(req.param("lat"), req.param("lng"), store.lat, store.lng);
                });

                stores = _.sortBy(stores, function (store) {
                    return parseInt(store.distance, 10);
                });

                // there is pagination...
                if (req.param("page") || req.param("limit")) {
                    var pages = [];
                    var page = req.param("page") || 1;
                    page = parseInt(page, 10) - 1; // arrays start from 0, humanized pages from 1 ;)

                    var size;
                    if(req.param("limit")) {
                        size = parseInt(req.param("limit"), 10);
                    } else {
                        size = stores.length;
                        page = 0; // there is no limit so show all
                    }

                    while (stores.length) {
                        pages.push(stores.splice(0, size));
                    }

                    return res.json(pages[page]);
                } else {
                    return res.json(stores);
                }


            });

            // else clasic query
        } else {
            var paginate = {
                page: req.param("page") || "0",
                limit: req.param("limit") || "0"
            };

            Stores.find().sort(sort).paginate(paginate).exec(function foundStores(err, stores) {
                if (err) {
                    return res.json(err);
                }
                return res.json(stores);
            });
        }
    },

    'sort': function (req, res) {
        DatabaseService.sort({
            sortData: req.param("sortData"),
            controller: "stores"
        }, function (response) {
            return res.send(response);
        });
    },

    'delete': function (req, res) {
        Stores.destroy(req.param("id"), function (err, store) {
            if (err) return res.send({err: true, msg: sails.__("Error while deleting object")});

            return res.send({err: false, msg: sails.__("Object deleted!")});
        });
    }

};

