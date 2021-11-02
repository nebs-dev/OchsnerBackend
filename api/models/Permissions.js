/**
 * Permissions.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema: true,

    attributes: {
        title: {
            type: 'string',
            unique: true,
            required: true
        },
        slug: {
            type: 'string',
            unique: true
        },
        view: {
            type: 'array',
            defaultsTo: []
        },
        create: {
            type: 'array',
            defaultsTo: []
        },
        update: {
            type: 'array',
            defaultsTo: []
        },
        delete: {
            type: 'array',
            defaultsTo: []
        }
    },


    beforeCreate: function (values, next) {
        DatabaseService.findSlug(values, "permissions", function (response) {
            if (response.err) return next(response);

            next();
        });
    },

    beforeUpdate: function (values, next) {
        if (values.updateSlug) {
            DatabaseService.findSlug(values, "permissions", function (response) {
                if (response.err) return next(response);
                next();
            });
        } else {
            next();
        }
    }
};

