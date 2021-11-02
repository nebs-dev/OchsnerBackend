/**
 * Admins.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema: true,

    attributes: {
        name: {
            type: 'string',
            required: 'true',
            minLength: 2
        },
        surname: {
            type: 'string',
            required: 'true',
            minLength: 2
        },
        username: {
            type: 'string',
            required: 'true',
            unique: true,
            minLength: 2
        },
        email: {
            type: 'email',
            required: 'true',
            unique: true
        },
        password: {
            type: 'string',
            minLength: 6
        },
        superAdmin: {
            type: 'integer',
            defaultsTo: 0,
            maxLength: 1
        },
        permissions: {
            model: 'permissions'
        },
        language: {
            type: 'string',
            enum: ['en', 'de', 'fr', 'it'],
            defaultsTo: 'en'
        },
        order: {
            type: 'integer',
            defaultsTo: 9999
        },

        toJSON: function () {
            var obj = this.toObject();

            delete obj.password;
            delete obj._csrf;

            return obj;
        }
    },

    beforeCreate: function (values, next) {
        DatabaseService.generatePassword(values, function (response) {
            if (response.err) return next({err: ["Password doesn't match password confirmation."]});

            values.password = response.encryptedPassword;
            next();
        });
    },

    beforeUpdate: function (values, next) {
        if (values.password) {
            DatabaseService.generatePassword(values, function (response) {
                if (response.err) return next({err: ["Password doesn't match password confirmation."]});

                values.password = response.encryptedPassword;
                next();
            });
        } else {
            next();
        }
    }
};

