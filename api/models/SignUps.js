/**
 * SignUps.js
 *
 * @description :: Every time user finished with registration, signUps model is touched
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

        userId: {
            model: 'users'
        }

    }
};

