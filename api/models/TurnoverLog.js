/**
 * TurnoverLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    schema: true,

    attributes: {

        fileOriginalPath: {
            type: 'string',
            required: true
        },

        fileMovedPath: {
            type: 'string'
        },

        fileDate: {
            type: 'date',
            required: true
        },

        status: {
            type: 'string',
            enum: ['processing', 'error', 'ok']
        },

        log: {
            type: 'string'
        }

    }
};

