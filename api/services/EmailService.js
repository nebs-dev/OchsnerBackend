var path = require('path');
var templatesDir = path.resolve(sails.config.appPath, "views/emailTemplates");
var emailTemplates = require('email-templates');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

/*uncomment this if pooling is needed and comment smtptransport
 var smtpPool = require('nodemailer-smtp-pool');
 and replace smtpTransport with smtp pool on transporter var
 */


module.exports = {

    sendEmail: function (options, data, callback) {
        emailTemplates(templatesDir, function (err, template) {
            if (err || !options.template) {
                callback(true, err);
            } else {
                // create transporter object using SMTP transport
                // replace smtpTransport with smtpPool if pooling is needed
                var transporter = nodemailer.createTransport(smtpTransport({
                    host: 'mail.cyon.ch',
                    port: 587,
                    secure: false, //defines if the connection should use SSL
                    authMethod: 'LOGIN',
                    auth: {
                        user: 'ochsner@smartfactory.ch',
                        pass: '0chsn3r!!!'
                    }
                }));

                // fill and send template from options with data parameter
                template(options.template, {locals: data}, function (err, html, text) {
                    if (err) {
                        callback(true, err);
                    } else {
                        transporter.sendMail({
                            from: options.from || 'OchsnerSportClub <ochsner@smartfactory.ch>',
                            to: options.to || 'info@ochsnersport-club.ch', // comma separated if multiple...
                            subject: options.subject || "OchsnerBackend message",
                            html: html,
                            generateTextFromHTML: true
                            // text: text this one is not needed cause we are using autogenerate
                        }, function (err) {
                            if (err) {
                                callback(true, err);
                            } else {
                                callback(false, "email sent!");
                            }
                        });
                    }
                });
            }
        });
    }
};