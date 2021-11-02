/**
 * Beacons.js
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
        store: {
            model: 'stores'
        },
        uuid: {
            type: 'string'
        },
        majorId: {
            type: 'integer'
        },
        minorId: {
            type: 'integer'
        },
        voucher: {
            model: 'vouchers'
        }
    },

    beforeCreate: function (values, next) {
        DatabaseService.findSlug(values, "beacons", function (response) {
            if (response.err) return next(response);

            next();
        });
    },

    beforeUpdate: function (values, next) {
        if (values.updateSlug) {
            DatabaseService.findSlug(values, "beacons", function (response) {
                if (response.err) return next(response);
                next();
            });
        } else {
            next();
        }
    }

};

