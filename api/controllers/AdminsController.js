/**
 * AdminsController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res) {
        Admins.find().sort({order: 1}).populateAll().exec(function foundAdmins(err, admins) {
            if (err) return next(err);

            _.each(admins, function (admin) {
                var md5sum = require("crypto").createHash("md5");
                md5sum.update(admin.email.toLowerCase().trim());
                admin.avatar = md5sum.digest("hex");
            });


            res.view({admins: admins});
        });
    },


    "new": function (req, res) {
        Permissions.find().exec(function (err, permissions) {
            res.view("admins/createAndUpdate", {permissions: permissions});
        });
    },

    "create": function (req, res, next) {
        Admins.create(req.params.all(), function adminCreated(err, admin) {

            if (err) {
                if (err.invalidAttributes && err.invalidAttributes.username) {
                    req.session.flash = {err: sails.__("Username already exists!")};
                } else if (err.invalidAttributes && err.invalidAttributes.email) {
                    req.session.flash = {err: sails.__("Email already exists!")};
                } else {
                    req.session.flash = {err: sails.__("Fill all required fields")};
                }

                return res.redirect("/admins/new");
            }

            res.redirect("/admins/" + admin.username);
        });
    },


    'showAndUpdate': function (req, res, next) {
        Admins.findOneByUsername(req.param("username")).populateAll().exec(function foundUser(err, admin) {
            if (err) return next(err);
            if (!admin) return res.redirect("/admins");

            Permissions.find().exec(function (err, permissions) {
                res.view("admins/createAndUpdate", {
                    admin: admin,
                    permissions: permissions,
                    locals: {
                        update: true,
                        forceUpdate: req.param("update") || false
                    }
                });
            });

        });
    },

    'update': function (req, res, next) {
        Admins.findOne(req.param("id"), function (err, adminCheck) {
            if (adminCheck.superAdmin && !req.session.Admin.superAdmin) {
                req.session.flash = {err: sails.__("You don't have permissions to update superAdmin!")};
                return res.redirect("back");
            } else {
                Admins.update(req.param("id"), req.params.all(), function adminUpdated(err, admin) {
                    if (err) {
                        // todo make ajax check for username and email... for now disable those fields
                        req.session.flash = {err: sails.__("Error updating user")};
                        return res.redirect("back");
                    }

                    req.setLocale(admin[0].language || "de");

                    req.session.flash = {success: sails.__("Admin updated!")};

                    return res.redirect("/admins/" + admin[0].username);

                });
            }
        });
    },

    'loginCheck': function (req, res) {
        // authenticated policy will redirect to /login if there is no session
        res.view("homepage");
    },

    'sort': function (req, res) {
        DatabaseService.sort({
            sortData: req.param("sortData"),
            controller: "admins"
        }, function (response) {
            return res.send(response);
        });
    },

    'delete': function (req, res) {

        Admins.findOne(req.param("id"), function (err, adminCheck) {
            if (req.session.Admin.id == req.param("id")) {
                return res.send({err: true, msg: "You cannot delete yourself!"});
            } else if (adminCheck.superAdmin && !req.session.Admin.superAdmin) {
                return res.send({err: true, msg: "You cannot delete superAdmin!"});
            } else {
                Admins.destroy(req.param("id"), function (err, admins) {
                    if (err) return res.send({err: true, msg: "Error while deleting object"});


                    _.each(_.values(req.sessionStore.sessions), function (sessionObj, key) {
                        var sessionAdmin = JSON.parse(sessionObj);

                        if (sessionAdmin.Admin && sessionAdmin.Admin.id == req.param("id")) {

                            //delete this guy if he is logged to current session
                            delete(req.sessionStore.sessions[Object.keys(req.sessionStore.sessions)[key]]);

                        }
                    });

                    return res.send({err: false, msg: "Object deleted!"});
                });
            }
        });
    }
};

