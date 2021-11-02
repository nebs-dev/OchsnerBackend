/**
 * PermissionsController
 *
 * @description :: Server-side logic for managing permissions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    'index': function (req, res, next) {
        Permissions.find().exec(function foundPermissions(err, permissions) {
            if (err) return next(err);

            res.view({permissions: permissions});
        });
    },

    'new': function (req, res) {
        res.view("permissions/createAndUpdate");
    },

    'showAndUpdate': function (req, res) {
        Permissions.findOneBySlug(req.param("slug")).exec(function foundPermission(err, permission) {
            if (err || !permission) {
                req.session.flash = {err: sails.__("Not found")};
                return res.redirect("/permissions");
            }

            res.view("permissions/createAndUpdate", {
                permission: permission,
                locals: {
                    update: true,
                    forceUpdate: req.param("update") || false
                }
            });

        });

    },


    'create': function (req, res) {
        Permissions.create(req.params.all(), function permissionCreated(err, permission) {
            if (err) {
                req.session.flash = {err: sails.__("Enter all required fields")};
                // redirect back if error but with flash message
                return res.redirect("/permissions/new");
            }
            // there are no images, just do the upload
            req.session.flash = {success: sails.__("Permission created!")};
            res.redirect("/permissions/" + permission.slug);

        });
    },

    // post
    'update': function (req, res, next) {
        if (req.param("id")) {
            // update permission title and stuff
            var params = req.params.all();
            params.updateSlug = true;
            Permissions.update(req.param("id"), params, function permissionUpdated(err, permission) {
                if (err) {
                    req.session.flash = {err: sails.__("Enter all required fields")};
                    return res.redirect("/permissions/" + permission[0].slug);
                }

                req.session.flash = {success: sails.__("Permission updated!")};
                return res.redirect("/permissions/" + permission[0].slug);

            });
        } else {

            var permissions = req.param("permissions");

            async.each(Object.keys(req.param("permissions")), function (permission, callback) {


                var params = {
                    view: permissions[permission].view || [],
                    create: permissions[permission].create || [],
                    update: permissions[permission].update || [],
                    delete: permissions[permission].delete || []
                };


                Permissions.update({title: permission}, params, function (err, updated) {
                    callback(err);
                });

            }, function (err) {
                if (err) {
                    sails.log.error("Permissions update error!", err);
                    req.session.flash = {error: sails.__("Permissions update error!")};
                } else {
                    req.session.flash = {success: sails.__("Permissions updated!")};
                }
                res.redirect("/permissions");
            });
        }
    },

    'delete': function (req, res) {
        Permissions.destroy(req.param("id"), function (err, permission) {
            if (err) {
                sails.log.error("Permissions delete error!", err);
                req.session.flash = {error: sails.__("Permission delete error!")};
            } else {
                req.session.flash = {success: sails.__("Permission deleted!")};
            }

            return res.redirect("/permissions");
        });
    }
};

