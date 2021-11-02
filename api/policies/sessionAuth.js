/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

module.exports = function (req, res, next) {
    // check if user is logged in
    if (req.session.authenticated) {
        var controller = req.options.controller;
        var action = req.options.action;


        // if he is superAdmin let him do everything without question :)
        // or its loginCheck action...
        if (req.session.Admin.superAdmin || action === "logincheck") return next();


        // if user wants analytics... give him...
        if(controller === "analytics") return next();

        // if its not... check if he has permissions for this
        var permissions = req.session.Admin.permissions;

        switch (action) {
            case 'index':
                action = "view";
                break;
            case 'showandupdate':
                action = "view";
                break;
            case 'new':
                action = "create";
                break;
            case 'clone':
                action = "create";
                break;
            case 'sort':
                action = "update";
                break;
            case 'setActive':
                action = "update";
                break;
        }

        if (_.contains(permissions[action], controller)) {
            return next();
        } else {
            // he doesn't have permissions...
            if (req.wantsJSON) {
                return res.json({err: sails.__("You don't have permissions for this action")});
            } else {
                req.session.flash = {err: sails.__("You don't have permissions for this action")};
                return res.redirect('/');
            }
        }


    } else {

        if (req.options.custom && !req.options.custom.noError) {
            req.session.flash = {err: "You must sign in..."};
        }

        return res.redirect("/login");
    }
};
