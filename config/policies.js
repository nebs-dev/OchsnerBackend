/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

    /***************************************************************************
     *                                                                          *
     * Default policy for all controllers and actions (`true` allows public     *
     * access)                                                                  *
     *                                                                          *
     ***************************************************************************/

    '*': ['sessionAuth', 'flash'],

    SessionController: {
        '*': 'flash'
    },

    UsersController: {
        'signup': true,
        'signin': true,
        'mailCheck': true,
        'contact': true
    },

    TurnoverController: {
        'getTurnover': ['cacheControl']
    },

    StoresController: {
        '*': ['sessionAuth', 'flash'],
        'find': ['cacheControl']
    },

    BeaconsController: {
        '*': ['sessionAuth', 'flash'],
        'find': ['cacheControl']
    },

    TeasersController: {
        '*': ['sessionAuth', 'availableLanguages', 'flash'],
        'find': ['cacheControl']
    },

    OffersController: {
        '*': ['sessionAuth', 'availableLanguages', 'flash'],
        'find': ['cacheControl']
    },

    BannersController: {
        '*': ['sessionAuth', 'availableLanguages', 'flash'],
        'find': ['cacheControl']
    },

    CompetitionsController: {
        '*': ['sessionAuth', 'availableLanguages', 'flash'],
        'find': ['cacheControl']
    },

    TermsController: {
        '*': ['sessionAuth', 'availableLanguages', 'flash'],
        'find': ['cacheControl']
    },

    ImpressumController: {
        '*': ['sessionAuth', 'availableLanguages', 'flash'],
        'find': ['cacheControl']
    },

    OnboardingController: {
        '*': ['sessionAuth', 'availableLanguages', 'flash'],
        'find': ['cacheControl']
    },

    DailyMessagesController: {
        '*': ['sessionAuth', 'availableLanguages', 'flash'],
        'find': ['cacheControl']
    },

    DailyTipsController: {
        '*': ['sessionAuth', 'availableLanguages', 'flash'],
        'find': ['cacheControl']
    },

    VouchersController: {
        '*': ['sessionAuth', 'flash'],
        'find': ['cacheControl']
    },

    AppOptionsController: {
        '*': ['sessionAuth', 'availableLanguages', 'flash'],
        'find': ['cacheControl']
    }

};
