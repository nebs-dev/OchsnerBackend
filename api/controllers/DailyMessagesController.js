/**
 * DailyMessagesController
 *
 * @description :: Server-side logic for managing dailyMessages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res, next) {
        DailyMessages.find({where: {language: req.param("language")}}).sort({order: 1}).exec(function foundDailyMessages(err, dailyMessages) {
            if (err) return next(err);

            res.view({messages: dailyMessages, language: req.param("language")});
        });
    },

    'new': function (req, res) {
        res.view("dailymessages/createAndUpdate", {language: req.param("language")});
    },

    'showAndUpdate': function (req, res) {
        DailyMessages.findOneBySlug(req.param("slug")).exec(function foundDailyMessage(err, dailyMessage) {
            if (err || !dailyMessage) {
                req.session.flash = {err: sails.__("Not found")};
                return res.redirect("/");
            }

            res.view("dailymessages/createAndUpdate", {
                message: dailyMessage,
                language: req.param("language"),
                locals: {
                    update: true,
                    forceUpdate: req.param("update") || false
                }
            });

        });

    },

    'create': function (req, res) {
        DailyMessages.create(req.params.all(), function dailyMessageCreated(err, dailyMessage) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                // redirect back if error but with flash message
                return res.redirect("/messages/" + req.param("language") + "/new");
            }

            req.session.flash = {success: sails.__("Daily message created!")};
            res.redirect("/messages/" + req.param("language") + "/" + dailyMessage.slug);

        });
    },

    'update': function (req, res) {
        var params = req.params.all();
        params.updateSlug = true;
        DailyMessages.update(req.param("id"), params, function dailyMessageUpdated(err, dailyMessage) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                return res.redirect("/messages/" + req.param("language") + "/" + dailyMessage[0].slug);
            }

            req.session.flash = {success: sails.__("Daily message updated!")};
            return res.redirect("/messages/" + req.param("language") + "/" + dailyMessage[0].slug);

        });

    },

    'find': function (req, res) {
        var options = {};

        if (req.param("language")) {
            options.language = req.param("language");
        }

        DailyMessages.find(options).sort({order: 1}).exec(function foundDailyMessages(err, dailyMessages) {
            if (err) {
                return res.json(err);
            }

            if (req.param("includeTips")) {

                DailyTips.find(options).sort({order: 1}).exec(function foundDailyTips(err, dailyTips) {
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
                    return res.json(_.sample(dailyMessages));
                } else {
                    return res.json(dailyMessages);
                }
            }
        });

    },

    'sort': function (req, res) {
        DatabaseService.sort({
            sortData: req.param("sortData"),
            controller: "dailymessages"
        }, function (response) {
            return res.send(response);
        });
    },

    'delete': function (req, res) {
        DailyMessages.destroy(req.param("id"), function (err, dailyMessages) {
            if (err) return res.send({err: true, msg: sails.__("Error while deleting object")});

            return res.send({err: false, msg: sails.__("Object deleted!")});
        });
    },

    'clone': function (req, res) {
        var params = req.params.all();
        params.model = "dailymessages";
        DatabaseService.cloneEntry(params, function (response) {
            res.send(response);
        });
    }
};

