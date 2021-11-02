/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function (cb) {
    // creating initial users

    Admins.findOrCreate({email: "roger@smartfactory.ch"}, {
        name: "Roger",
        surname: "Lüchinger",
        username: "roger",
        email: "roger@smartfactory.ch",
        password: "sirroger",
        confirmation: "sirroger",
        superAdmin: 1,
        order: "1"
    }).exec(function (err) {
        if (err) return console.log("Bootstrap failed...", err);
        console.log("roger superadmin created");
    });


    Admins.findOrCreate({email: "hlozancic@gmail.com"}, {
        name: "Hrvoje",
        surname: "Lozančić",
        username: "hlozancic",
        email: "hlozancic@gmail.com",
        password: "capoeira0809",
        confirmation: "capoeira0809",
        superAdmin: 1,
        order: "3"
    }).exec(function (err) {
        if (err) return console.log("Bootstrap failed...", err);
        console.log("hlozancic superadmin created");
    });


    var allowedPermissions = _.without(Object.keys(sails.controllers), 'session', 'permissions');
    Permissions.findOrCreate({title: "Admin"}, {
        title: "Admin",
        view: allowedPermissions,
        create: allowedPermissions,
        update: allowedPermissions,
        delete: allowedPermissions
    }).exec(function (err, permission) {
        if (err) return console.log("Bootstrap failed...", err);
        console.log("Admin role created");
        Admins.findOrCreate({email: "adrian.fuchs1@swisscom.com"}, {
            name: "Adi",
            surname: "Fuchs",
            username: "adi",
            email: "adrian.fuchs1@swisscom.com",
            password: "adiadiadi",
            confirmation: "adiadiadi",
            permissions: permission.id,
            order: "2"
        }).exec(function (err) {
            if (err) return console.log("Bootstrap failed...", err);
            console.log("adi admin created");
        });
    });

    Permissions.findOrCreate({title: "Editor"}, {
        title: "Editor"
    }).exec(function (err) {
        if (err) return console.log("Bootstrap failed...", err);
        console.log("Editor role created");
    });


    //if there are no stores... parse it from csv
    Stores.count().exec(function (err, count) {
        if (!count) {
            var fs = require('fs');
            var es = require("event-stream");
            var parse = require('csv-parse');

            // buffer variable...
            var output = [];

            // Create the parser
            var parser = parse({
                delimiter: ';',
                columns: true,
                skip_empty_lines: true,
                trim: true
            });


            // Use the writable stream api to get chunks
            parser.on('readable', function () {
                var chunk;
                while (chunk = parser.read()) {
                    // push chunk to output
                    output.push(chunk);
                }
            });

            // Catch any error
            parser.on('error', function (err) {
                sails.log.error(err);
            });

            // When readstream is finished, import entire output to db
            parser.on('finish', function () {
                Stores.create(output, function (err, stores) {
                    if (err) {
                        sails.log.error(err);
                    } else {
                        console.log("Imported initial stores!");
                    }
                });
            });


            // everything is set up... run read stream!
            fs.createReadStream('storefinder.csv').pipe(es.split()).on('data', function (line) {
                parser.write(line + "\n");
            }).on('error', function (err) {
                sails.log.error(err);
            }).on('end', function () {
                // Close the readable stream, we are done reading :)
                parser.end();
            });
        }
    });

    // end CSV stores parse


    // run cron job if production enviroment
    if (process.env.NODE_ENV === "production") {

        // if there is no available cards, import em...
        Cards.count().exec(function (err, count) {
            if (!count) {
                DatabaseService.importInitialCardsCSV();
            }
        });


        var CronJob = require("cron").CronJob;

        // every day in 5 hours in the morning
        new CronJob('0 0 5 * * *', function () {
            var moment = require("moment");
            DatabaseService.importTurnoverCSV({
                filePath: "/home/jail/home/loyaltycsv/uploads/" + moment().format("YYYYMMDD") + ".csv",
                fileDate: moment().subtract(1, "days").toISOString(), // we put yesterday date to file
                moveFileTo: "/OchsnerBackend/importedCSVs/" + moment().format("YYYYMMDD") + ".csv"
            });
        }, null, true, "Europe/Zurich");
    }


    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
};
