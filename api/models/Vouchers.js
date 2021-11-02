/**
 * Vouchers.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema: true,

    attributes: {
        title: {
            type: 'string',
            required: true
        },
        description: {
            type: 'string'
        },
        benefitType: {
            type: 'string'
        },
        benefit: {
            type: 'string'
        },
        slug: {
            type: 'string',
            unique: true
        },
        startDate: {
            type: 'date'
        },
        endDate: {
            type: 'date'
        },
        filterGender: {
            type: 'array',
            defaultsTo: []
        },
        filterLanguage: {
            type: 'array',
            defaultsTo: []
        },
        filterStores: {
            collection: 'stores',
            via: 'id'
        },
        filterCards: {
            type: 'string'
        },
        images: {
            collection: 'images',
            via: 'vouchers'
        }
    },

    afterDestroy: function (destroyedRecords, cb) {
        // destroy all images that are in relation with this competition
        Images.destroy({vouchers: _.pluck(destroyedRecords, 'id')}).exec(cb);
    },


    beforeCreate: function (values, next) {
        DatabaseService.findSlug(values, "vouchers", function (response) {
            if (response.err) return next(response);

            next();
        });
    },

    beforeUpdate: function (values, next) {
        if (values.updateSlug) {
            DatabaseService.findSlug(values, "vouchers", function (response) {
                if (response.err) return next(response);
                next();
            });
        } else {
            next();
        }
    }
};