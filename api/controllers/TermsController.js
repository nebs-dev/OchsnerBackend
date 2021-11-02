/**
 * TermsController
 *
 * @description :: Server-side logic for managing terms
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res, next) {
        Terms.findOrCreate({language: req.param("language")}, {
            title: "Terms - " + req.param("language"),
            description: "Description",
            language: req.param("language")
        }, function (err, terms) {
            if (err) return next(err);

            res.view({terms: terms, language: req.param("language")});
        });
    },

    'update': function (req, res) {
        Terms.update(req.param("termId"), {
            title: req.param("title"),
            description: req.param("description")
        }, function termUpdated(err, term) {
            if (err) req.session.flash = {err: sails.__("Enter all required fields")};

            req.session.flash = {success: sails.__("Term updated!")};
            return res.redirect("/terms/" + req.param("language"));
        });
    },

    'find': function (req, res) {
        var options = {};

        if (req.param("language")) {
            options.language = req.param("language");
        }

        Terms.find(options, function foundTerms(err, terms) {
            if (err) {
                return res.json(err);
            }

            // concat title and description...
            _.map(terms, function (value) {
                value.description = "<h3>" + value.title + "</h3>" + value.description
            });

            res.json(terms);
        });
    }
};

