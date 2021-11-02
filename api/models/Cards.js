/**
 * Cards.js
 *
 * @description :: Here are all available card numbers
 *
 */

module.exports = {

    schema: true,

    attributes: {

        cardNumber: {
            type: 'integer',
            required: true,
            unique: true,
            minLength: 15,
            maxLength: 15
        },

        available: {
            type: 'integer',
            defaultsTo: 1,
            maxLength: 1
        }

    }
};

