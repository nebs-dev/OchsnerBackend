/**
 * ImpressumController
 *
 * @description :: Server-side logic for managing impressums
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res, next) {
        Impressum.findOrCreate({language: req.param("language")}, {
            title: "Impressum - " + req.param("language"),
            description: "Description",
            language: req.param("language")
        }, function (err, impressum) {
            if (err) return next(err);

            res.view({impressum: impressum, language: req.param("language")});
        });
    },

    'update': function (req, res) {
        Impressum.update(req.param("impressumId"), {
            title: req.param("title"),
            description: req.param("description")
        }, function impressumUpdated(err, impressum) {
            if (err) req.session.flash = {err: sails.__("Enter all required fields")};

            req.session.flash = {success: sails.__("Impressum updated!")};
            return res.redirect("/impressum/" + req.param("language"));
        });
    },

    'find': function (req, res) {
        var options = {};

        if (req.param("language")) {
            options.language = req.param("language");
        }

        Impressum.find(options, function foundImpressum(err, impressum) {
            if (err) {
                return res.json(err);
            }

            // concat title and description...
            _.map(impressum, function (value) {
                value.description = "<h3>" + value.title + "</h3>" + value.description
            });

            res.json(impressum);
        });
    }
};