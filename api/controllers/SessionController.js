/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'new': function (req, res) {
        if (req.session.authenticated) {
            return res.redirect("/");
        }

        req.setLocale("de");
        res.view({layout: "layout-login"});
    },

    'create': function (req, res, next) {
        if (req.session.authenticated) {
            return res.redirect("/");
        }
        if (!req.param("username") || !req.param("password")) {

            req.session.flash = {err: sails.__("Enter both username and pass")};

            return res.redirect("/login");
        }

        Admins.findOneByUsername(req.param("username")).populate("permissions").exec(function foundAdmin(err, admin) {
            if (err) return next(err);

            if (!admin) {

                req.session.flash = {err: sails.__("The username %s is not found", req.param("username"))};

                return res.redirect("/login");
            }


            require("bcrypt").compare(req.param("password"), admin.password, function (err, valid) {
                if (err) return next(err);

                if (!valid) {

                    req.session.flash = {err: sails.__("Invalid username and password combination")};

                    return res.redirect("/login");

                }

                // put current logged in user to session
                req.session.authenticated = true;
                req.session.Admin = admin;

                req.session.Admin.role = admin.superAdmin ? "Super Admin" : admin.permissions.title;

                // set gravatar to session so we can use it without constantly generating it
                var md5sum = require("crypto").createHash("md5");
                md5sum.update(admin.email.toLowerCase().trim());
                req.session.gravatar = md5sum.digest("hex");


                req.setLocale(admin.language || "de");


                res.redirect("/");

            });
        });

    },

    'destroy': function (req, res, next) {
        if (!req.session.authenticated) {
            return res.redirect("/login");
        }
        // wipe out the session
        req.session.destroy();

        // redirect to login screen
        res.redirect("/login");
    }
};
