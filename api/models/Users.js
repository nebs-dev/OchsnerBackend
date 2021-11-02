/**
 * User.js
 *
 * @description :: Here are all registered users
 *
 */


module.exports = {

    schema: true,

    attributes: {

        name: {
            type: 'string'
        },

        lastname: {
            type: 'string'
        },

        gender: {
            type: 'string'
        },

        email: {
            type: 'email',
            required: 'true',
            unique: true
        },

        // from where was this card created?
        source: {
            type: 'string'
        },

        cardNumber: {
            type: 'integer',
            required: true,
            minLength: 15,
            maxLength: 15
        },

        pushToken: {
            type: 'string'
        },

        udid: {
            type: 'string'
        }

    }
};