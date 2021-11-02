/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

    '/': {
        controller: 'AdminsController',
        action: 'loginCheck',
        custom: {
            noError: true
        }
    },

    // alias for csfr token
    '/api/csrfToken': '/csrfToken',


    /***************************************************************************
     *                                                                          *
     * Admins controller routes here...                                          *
     *                                                                          *
     ***************************************************************************/

    '/admins': {
        controller: 'AdminsController',
        action: 'index'
    },

    '/admins/new': {
        controller: 'AdminsController',
        action: 'new'
    },

    '/admins/create': {
        controller: 'AdminsController',
        action: 'create'
    },

    'put /admins/sort': {
        controller: 'AdminsController',
        action: 'sort'
    },

    'post /admins/delete/:id': {
        controller: 'AdminsController',
        action: 'delete'
    },

    'post /admins/update': {
        controller: 'AdminsController',
        action: 'update'
    },

    '/admins/:username': {
        controller: 'AdminsController',
        action: 'showAndUpdate'
    },

    /***************************************************************************
     *                                                                          *
     * Session routes here...                                                   *
     *                                                                          *
     ***************************************************************************/

    '/login': {
        controller: 'SessionController',
        action: 'new'
    },
    '/login/check': {
        controller: 'SessionController',
        action: 'create'
    },
    '/logout': {
        controller: 'SessionController',
        action: 'destroy'
    },


    /***************************************************************************
     *                                                                          *
     * Teasers routes here...                                                   *
     *                                                                          *
     ***************************************************************************/

    '/teasers/:language': {
        controller: 'TeasersController',
        action: 'index'
    },

    '/teasers/:language/new': {
        controller: 'TeasersController',
        action: 'new'
    },

    'post /teasers/:language/create': {
        controller: 'TeasersController',
        action: 'create'
    },

    'post /teasers/:language/update': {
        controller: 'TeasersController',
        action: 'update'
    },

    'put /teasers/:language/sort': {
        controller: 'TeasersController',
        action: 'sort'
    },

    '/teasers/:language/:slug': {
        controller: 'TeasersController',
        action: 'showAndUpdate'
    },

    'get /api/teasers': {
        controller: 'TeasersController',
        action: 'find'
    },

    'post /teasers/:language/delete/:id': {
        controller: 'TeasersController',
        action: 'delete'
    },

    'post /teasers/:language/clone/:id': {
        controller: 'TeasersController',
        action: 'clone'
    },

    /***************************************************************************
     *                                                                          *
     * Competitions routes here...                                              *
     *                                                                          *
     ***************************************************************************/


    '/competitions/:language': {
        controller: 'CompetitionsController',
        action: 'index'
    },

    '/competitions/:language/new': {
        controller: 'CompetitionsController',
        action: 'new'
    },

    'post /competitions/:language/create': {
        controller: 'CompetitionsController',
        action: 'create'
    },

    'post /competitions/:language/update': {
        controller: 'CompetitionsController',
        action: 'update'
    },

    'put /competitions/:language/sort': {
        controller: 'CompetitionsController',
        action: 'sort'
    },

    '/competitions/:language/:slug': {
        controller: 'CompetitionsController',
        action: 'showAndUpdate'
    },


    'get /api/competitions': {
        controller: 'CompetitionsController',
        action: 'find'
    },

    'post /competitions/:language/delete/:id': {
        controller: 'CompetitionsController',
        action: 'delete'
    },

    'post /competitions/:language/clone/:id': {
        controller: 'CompetitionsController',
        action: 'clone'
    },


    /***************************************************************************
     *                                                                          *
     * Offers routes here...                                                    *
     *                                                                          *
     ***************************************************************************/

    '/offers/:language': {
        controller: 'OffersController',
        action: 'index'
    },

    '/offers/:language/new': {
        controller: 'OffersController',
        action: 'new'
    },

    'post /offers/:language/create': {
        controller: 'OffersController',
        action: 'create'
    },

    'post /offers/:language/update': {
        controller: 'OffersController',
        action: 'update'
    },

    'put /offers/:language/sort': {
        controller: 'OffersController',
        action: 'sort'
    },

    '/offers/:language/:slug': {
        controller: 'OffersController',
        action: 'showAndUpdate'
    },

    'get /api/offers': {
        controller: 'OffersController',
        action: 'find'
    },

    'post /offers/:language/delete/:id': {
        controller: 'OffersController',
        action: 'delete'
    },

    'post /offers/:language/clone/:id': {
        controller: 'OffersController',
        action: 'clone'
    },

    /***************************************************************************
     *                                                                          *
     * Onboarding routes here...                                                *
     *                                                                          *
     ***************************************************************************/

    '/onboarding/:language': {
        controller: 'OnboardingController',
        action: 'index'
    },

    '/onboarding/:language/new': {
        controller: 'OnboardingController',
        action: 'new'
    },

    'post /onboarding/:language/create': {
        controller: 'OnboardingController',
        action: 'create'
    },

    'post /onboarding/:language/update': {
        controller: 'OnboardingController',
        action: 'update'
    },

    'put /onboarding/:language/sort': {
        controller: 'OnboardingController',
        action: 'sort'
    },

    '/onboarding/:language/:slug': {
        controller: 'OnboardingController',
        action: 'showAndUpdate'
    },

    'get /api/onboarding': {
        controller: 'OnboardingController',
        action: 'find'
    },

    'post /onboarding/:language/delete/:id': {
        controller: 'OnboardingController',
        action: 'delete'
    },

    'post /onboarding/:language/clone/:id': {
        controller: 'OnboardingController',
        action: 'clone'
    },

    /***************************************************************************
     *                                                                          *
     * Vouchers routes here...                                                  *
     *                                                                          *
     ***************************************************************************/

    '/vouchers': {
        controller: 'VouchersController',
        action: 'index'
    },

    '/vouchers/new': {
        controller: 'VouchersController',
        action: 'new'
    },

    'post /vouchers/create': {
        controller: 'VouchersController',
        action: 'create'
    },

    'post /vouchers/update': {
        controller: 'VouchersController',
        action: 'update'
    },

    '/vouchers/:slug': {
        controller: 'VouchersController',
        action: 'showAndUpdate'
    },

    'get /api/vouchers': {
        controller: 'VouchersController',
        action: 'find'
    },

    'post /vouchers/delete/:id': {
        controller: 'VouchersController',
        action: 'delete'
    },

    /***************************************************************************
     *                                                                          *
     * Terms routes here...                                                     *
     *                                                                          *
     ***************************************************************************/

    '/terms/:language': {
        controller: 'TermsController',
        action: 'index'
    },

    'post /terms/:language/update': {
        controller: 'TermsController',
        action: 'update'
    },

    'get /api/terms': {
        controller: 'TermsController',
        action: 'find'
    },

    /***************************************************************************
     *                                                                          *
     * Impressum routes here...                                                 *
     *                                                                          *
     ***************************************************************************/

    '/impressum/:language': {
        controller: 'ImpressumController',
        action: 'index'
    },

    'post /impressum/:language/update': {
        controller: 'ImpressumController',
        action: 'update'
    },

    'get /api/impressum': {
        controller: 'ImpressumController',
        action: 'find'
    },

    /***************************************************************************
     *                                                                          *
     * Permissions routes here...                                               *
     *                                                                          *
     ***************************************************************************/

    '/permissions': {
        controller: 'PermissionsController',
        action: 'index'
    },

    '/permissions/new': {
        controller: 'PermissionsController',
        action: 'new'
    },

    'post /permissions/create': {
        controller: 'PermissionsController',
        action: 'create'
    },

    'post /permissions/update': {
        controller: 'PermissionsController',
        action: 'update'
    },

    '/permissions/:slug': {
        controller: 'PermissionsController',
        action: 'showAndUpdate'
    },

    'post /permissions/delete/:id': {
        controller: 'PermissionsController',
        action: 'delete'
    },

    /***************************************************************************
     *                                                                          *
     * Users routes here...                                                     *
     *                                                                          *
     ***************************************************************************/

    'post /api/users/signup': {
        controller: 'UsersController',
        action: 'signup'
    },

    'post /api/users/signin': {
        controller: 'UsersController',
        action: 'signin'
    },

    'post /api/users/mailCheck': {
        controller: 'UsersController',
        action: 'mailCheck'
    },

    'post /api/users/contact': {
        controller: 'UsersController',
        action: 'contact'
    },


    /***************************************************************************
     *                                                                          *
     * Banners routes here...                                                    *
     *                                                                          *
     ***************************************************************************/

    '/banners/:language': {
        controller: 'BannersController',
        action: 'index'
    },

    '/banners/:language/new': {
        controller: 'BannersController',
        action: 'new'
    },

    'post /banners/:language/create': {
        controller: 'BannersController',
        action: 'create'
    },

    'post /banners/:language/update': {
        controller: 'BannersController',
        action: 'update'
    },

    'put /banners/:language/sort': {
        controller: 'BannersController',
        action: 'sort'
    },

    '/banners/:language/:slug': {
        controller: 'BannersController',
        action: 'showAndUpdate'
    },

    'get /api/banners': {
        controller: 'BannersController',
        action: 'find'
    },

    'post /banners/:language/delete/:id': {
        controller: 'BannersController',
        action: 'delete'
    },

    'post /banners/:language/setActive/:id': {
        controller: 'BannersController',
        action: 'setActive'
    },

    'post /banners/:language/clone/:id': {
        controller: 'BannersController',
        action: 'clone'
    },

    /***************************************************************************
     *                                                                          *
     * Turnover routes here...                                                  *
     *                                                                          *
     ***************************************************************************/

    'get /api/turnover': {
        controller: 'TurnoverController',
        action: 'getTurnover'
    },

    /***************************************************************************
     *                                                                          *
     * Stores routes here...                                                    *
     *                                                                          *
     ***************************************************************************/

    '/stores': {
        controller: 'StoresController',
        action: 'index'
    },

    '/stores/new': {
        controller: 'StoresController',
        action: 'new'
    },

    'post /stores/create': {
        controller: 'StoresController',
        action: 'create'
    },

    'post /stores/update': {
        controller: 'StoresController',
        action: 'update'
    },

    'put /stores/sort': {
        controller: 'StoresController',
        action: 'sort'
    },

    '/stores/:slug': {
        controller: 'StoresController',
        action: 'showAndUpdate'
    },

    'get /api/stores': {
        controller: 'StoresController',
        action: 'find'
    },

    'post /stores/delete/:id': {
        controller: 'StoresController',
        action: 'delete'
    },

    /***************************************************************************
     *                                                                          *
     * Beacons routes here...                                                   *
     *                                                                          *
     ***************************************************************************/

    '/beacons': {
        controller: 'BeaconsController',
        action: 'index'
    },

    '/beacons/new': {
        controller: 'BeaconsController',
        action: 'new'
    },

    'post /beacons/create': {
        controller: 'BeaconsController',
        action: 'create'
    },

    'post /beacons/update': {
        controller: 'BeaconsController',
        action: 'update'
    },

    'put /beacons/sort': {
        controller: 'BeaconsController',
        action: 'sort'
    },

    '/beacons/:slug': {
        controller: 'BeaconsController',
        action: 'showAndUpdate'
    },

    'get /api/beacons': {
        controller: 'BeaconsController',
        action: 'find'
    },

    'post /beacons/delete/:id': {
        controller: 'BeaconsController',
        action: 'delete'
    },


    /***************************************************************************
     *                                                                          *
     * Analytics routes here...                                                 *
     *                                                                          *
     ***************************************************************************/

    'get /analytics/iTunesConnect': {
        controller: 'AnalyticsController',
        action: 'iTunesConnect'
    },

    'get /analytics/userStats': {
        controller: 'AnalyticsController',
        action: 'userStats'
    },

    'get /analytics/cardStats': {
        controller: 'AnalyticsController',
        action: 'cardStats'
    },

    'get /analytics/GAsessions': {
        controller: 'AnalyticsController',
        action: 'GAsessions'
    },

    'get /analytics/GAcurrentUsers': {
        controller: 'AnalyticsController',
        action: 'GAcurrentUsers'
    },

    /***************************************************************************
     *                                                                          *
     * DailyMessages routes here...                                             *
     *                                                                          *
     ***************************************************************************/

    '/messages/:language': {
        controller: 'DailyMessagesController',
        action: 'index'
    },

    '/messages/:language/new': {
        controller: 'DailyMessagesController',
        action: 'new'
    },

    'post /messages/:language/create': {
        controller: 'DailyMessagesController',
        action: 'create'
    },

    'post /messages/:language/update': {
        controller: 'DailyMessagesController',
        action: 'update'
    },

    'put /messages/:language/sort': {
        controller: 'DailyMessagesController',
        action: 'sort'
    },

    '/messages/:language/:slug': {
        controller: 'DailyMessagesController',
        action: 'showAndUpdate'
    },

    'get /api/messages': {
        controller: 'DailyMessagesController',
        action: 'find'
    },

    'post /messages/:language/delete/:id': {
        controller: 'DailyMessagesController',
        action: 'delete'
    },

    'post /messages/:language/clone/:id': {
        controller: 'DailyMessagesController',
        action: 'clone'
    },

    /***************************************************************************
     *                                                                          *
     * AppOptions routes here...                                                *
     *                                                                          *
     ***************************************************************************/

    '/appOptions/:language': {
        controller: 'AppOptions',
        action: 'index'
    },

    '/appOptions/:language/new': {
        controller: 'AppOptions',
        action: 'new'
    },

    'post /appOptions/:language/create': {
        controller: 'AppOptions',
        action: 'create'
    },

    'post /appOptions/:language/update': {
        controller: 'AppOptions',
        action: 'update'
    },

    'put /appOptions/:language/sort': {
        controller: 'AppOptions',
        action: 'sort'
    },

    '/appOptions/:language/:slug': {
        controller: 'AppOptions',
        action: 'showAndUpdate'
    },

    'get /api/appOptions': {
        controller: 'AppOptions',
        action: 'find'
    },

    'post /appOptions/:language/delete/:id': {
        controller: 'AppOptions',
        action: 'delete'
    },

    'post /appOptions/:language/clone/:id': {
        controller: 'AppOptions',
        action: 'clone'
    },

    /***************************************************************************
     *                                                                          *
     * DailyTips routes here...                                                 *
     *                                                                          *
     ***************************************************************************/

    '/tips/:language': {
        controller: 'DailyTipsController',
        action: 'index'
    },

    '/tips/:language/new': {
        controller: 'DailyTipsController',
        action: 'new'
    },

    'post /tips/:language/create': {
        controller: 'DailyTipsController',
        action: 'create'
    },

    'post /tips/:language/update': {
        controller: 'DailyTipsController',
        action: 'update'
    },

    'put /tips/:language/sort': {
        controller: 'DailyTipsController',
        action: 'sort'
    },

    '/tips/:language/:slug': {
        controller: 'DailyTipsController',
        action: 'showAndUpdate'
    },

    'get /api/tips': {
        controller: 'DailyTipsController',
        action: 'find'
    },

    'post /tips/:language/delete/:id': {
        controller: 'DailyTipsController',
        action: 'delete'
    },

    'post /tips/:language/clone/:id': {
        controller: 'DailyTipsController',
        action: 'clone'
    }

};
