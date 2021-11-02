/**
 * Stores.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema: true,

    attributes: {
        title: {
            type: 'string',
            required: 'true'
        },
        slug: {
            type: 'string',
            unique: true
        },
        phone: {
            type: 'string'
        },
        city: {
            type: 'string'
        },
        postcode: {
            type: 'string'
        },
        street: {
            type: 'string'
        },
        lat: {
            type: 'string'
        },
        lng: {
            type: 'string'
        },
        order: {
            type: 'integer',
            defaultsTo: 9999
        }
    },

    beforeCreate: function (values, next) {
        DatabaseService.findSlug(values, "stores", function (response) {
            if (response.err) return next(response);

            next();
        });
    },

    beforeUpdate: function (values, next) {
        if (values.updateSlug) {
            DatabaseService.findSlug(values, "stores", function (response) {
                if (response.err) return next(response);
                next();
            });
        } else {
            next();
        }
    }

};

