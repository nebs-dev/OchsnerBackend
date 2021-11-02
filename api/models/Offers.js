/**
 * Offers.js
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
            type: 'string',
            required: true
        },
        slug: {
            type: 'string',
            unique: true
        },
        url: {
            type: 'string'
        },
        startDate: {
            type: 'date'
        },
        endDate: {
            type: 'date'
        },
        language: {
            type: 'string',
            enum: ['de', 'fr', 'it'],
            required: true
        },
        order: {
            type: 'integer',
            defaultsTo: 0
        },
        images: {
            collection: 'images',
            via: 'offers'
        }
    },

    afterDestroy: function (destroyedRecords, cb) {
        // destroy all images that are in relation with this competition
        Images.destroy({offers: _.pluck(destroyedRecords, 'id')}).exec(cb);
    },


    beforeCreate: function (values, next) {
        DatabaseService.findSlug(values, "offers", function (response) {
            if (response.err) return next(response);

            next();
        });
    },

    beforeUpdate: function (values, next) {
        if (values.updateSlug) {
            DatabaseService.findSlug(values, "offers", function (response) {
                if (response.err) return next(response);
                next();
            });
        } else {
            next();
        }
    }
};