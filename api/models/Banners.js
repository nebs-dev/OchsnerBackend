/**
 * Banners.js
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
        active: {
            type: 'integer',
            defaultsTo: 0,
            maxLength: 1
        },
        slug: {
            type: 'string',
            unique: true
        },
        url: {
            type: 'string'
        },
        language: {
            type: 'string',
            enum: ['de', 'fr', 'it'],
            required: true
        },
        order: {
            type: 'integer',
            defaultsTo: 9999
        },
        images: {
            collection: 'images',
            via: 'banners'
        }
    },

    afterDestroy: function (destroyedRecords, cb) {
        // destroy all images that are in relation with this competition
        Images.destroy({banners: _.pluck(destroyedRecords, 'id')}).exec(cb);
    },


    beforeCreate: function (values, next) {
        DatabaseService.findSlug(values, "banners", function (response) {
            if (response.err) return next(response);

            next();
        });
    },

    beforeUpdate: function (values, next) {
        if (values.updateSlug) {
            DatabaseService.findSlug(values, "banners", function (response) {
                if (response.err) return next(response);
                next();
            });
        } else {
            next();
        }
    }
};