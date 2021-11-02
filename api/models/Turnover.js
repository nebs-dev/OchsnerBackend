/**
 * Turnover.js
 *
 * @description :: This database is dropped and imported daily...
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

        amountSpent: {
            type: 'float',
            defaultsTo: 0
        }

    }
};

