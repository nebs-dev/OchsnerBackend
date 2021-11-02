/**
 * DailyTipsController
 *
 * @description :: Server-side logic for managing dailyTips
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res, next) {
        DailyTips.find({where: {language: req.param("language")}}).sort({order: 1}).exec(function foundDailyTips(err, dailyTips) {
            if (err) return next(err);

            res.view({tips: dailyTips, language: req.param("language")});
        });
    },

    'new': function (req, res) {
        res.view("dailytips/createAndUpdate", {language: req.param("language")});
    },

    'showAndUpdate': function (req, res) {
        DailyTips.findOneBySlug(req.param("slug")).exec(function foundDailyTip(err, dailyTip) {
            if (err || !dailyTip) {
                req.session.flash = {err: sails.__("Not found")};
                return res.redirect("/");
            }

            res.view("dailytips/createAndUpdate", {
                tip: dailyTip,
                language: req.param("language"),
                locals: {
                    update: true,
                    forceUpdate: req.param("update") || false
                }
            });

        });

    },

    'create': function (req, res) {
        DailyTips.create(req.params.all(), function dailyTipCreated(err, dailyTip) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                // redirect back if error but with flash tip
                return res.redirect("dailyTips/" + req.param("language") + "/new");
            }

            req.session.flash = {success: sails.__("Daily tip created!")};
            res.redirect("/tips/" + req.param("language") + "/" + dailyTip.slug);

        });
    },

    'update': function (req, res) {
        var params = req.params.all();
        params.updateSlug = true;
        DailyTips.update(req.param("id"), params, function dailyTipUpdated(err, dailyTip) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                return res.redirect("/tips/" + req.param("language") + "/" + dailyTip[0].slug);
            }

            req.session.flash = {success: sails.__("Daily tip updated!")};
            return res.redirect("/tips/" + req.param("language") + "/" + dailyTip[0].slug);

        });

    },

    'find': function (req, res) {
        var options = {};

        if (req.param("language")) {
            options.language = req.param("language");
        }

        DailyTips.find(options).sort({order: 1}).exec(function foundDailyTips(err, dailyTips) {
            if (err) {
                return res.json(err);
            }

            if (req.param("includeMessages")) {

                DailyMessages.find(options).sort({order: 1}).exec(function foundDailyMessages(err, dailyMessages) {
                    if (err) {
                        return res.json(err);
                    }

                    var jsonToGo = {};

                    if (req.param("random")) {
                        jsonToGo.messages = _.sample(dailyMessages);
                        jsonToGo.tips = _.sample(dailyTips);
                    } else {
                        jsonToGo.messages = dailyMessages;
                        jsonToGo.tips = dailyTips;
                    }

                    return res.json(jsonToGo);

                });

            } else {
                if (req.param("random")) {
                    return res.json(_.sample(dailyTips));
                } else {
                    return res.json(dailyTips);
                }
            }
        });

    },

    'sort': function (req, res) {
        DatabaseService.sort({
            sortData: req.param("sortData"),
            controller: "dailytips"
        }, function (response) {
            return res.send(response);
        });
    },

    'delete': function (req, res) {
        DailyTips.destroy(req.param("id"), function (err, dailyTips) {
            if (err) return res.send({err: true, msg: sails.__("Error while deleting object")});

            return res.send({err: false, msg: sails.__("Object deleted!")});
        });
    },

    'clone': function (req, res) {
        var params = req.params.all();
        params.model = "dailytips";
        DatabaseService.cloneEntry(params, function (response) {
            res.send(response);
        });
    }
};

