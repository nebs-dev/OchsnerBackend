/**
 * AppOptions.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema: false, // VERY IMPORTANT FOR THIS MODEL!

    attributes: {
        title: {
            type: 'string',
            required: true
        },
        slug: {
            type: 'string',
            unique: true
        },
        view: { // views/appOptions/THIS VALUE  .ejs
            type: 'string',
            required: true
        },
        apiVar: {
            type: 'string',
            required: true
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
            via: 'appoptions'
        }
    },

    afterDestroy: function (destroyedRecords, cb) {
        // destroy all images that are in relation with this competition
        Images.destroy({appoptions: _.pluck(destroyedRecords, 'id')}).exec(cb);
    },

    beforeCreate: function (values, next) {


        DatabaseService.findSlug(values, "appoptions", function (response) {
            if (response.err) return next(response);

            next();
        });
    },

    beforeUpdate: function (values, next) {
        if (values.updateSlug) {
            DatabaseService.findSlug(values, "appoptions", function (response) {
                if (response.err) return next(response);
                next();
            });
        } else {
            next();
        }
    }
};