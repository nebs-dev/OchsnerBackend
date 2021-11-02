/**
 * Images.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema: true,

    attributes: {
        url: {
            type: 'string',
            required: true
        },
        device: {
            type: 'string',
            required: true
        },
        teasers: {
            model: 'teasers'
        },
        competitions: {
            model: 'competitions'
        },
        offers: {
            model: 'offers'
        },
        onboarding: {
            model: 'onboarding'
        },
        vouchers: {
            model: 'vouchers'
        },
        banners: {
            model: 'banners'
        },
        appoptions: {
            model: 'appoptions'
        }
    },

    afterDestroy: function (destroyedRecords, cb) {
        var fs = require('fs');
        _.each(destroyedRecords, function (value) {
            try {
                fs.unlinkSync(sails.config.appPath + "/assets/" + value.url);
            } catch (err) {
                sails.log.error(err);
            }
        });
        cb();
    }
};

