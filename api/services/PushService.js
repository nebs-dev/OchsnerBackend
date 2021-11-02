module.exports = {
    //todo :)
    pushtest: function () {

        var apn = require('apn')

        var options = {
            cert: sails.config.appPath + '/certs/cert.pem', /* Certificate file path */
            //certData: null, /* String or Buffer containing certificate data, if supplied uses this instead of cert file path */
            key: sails.config.appPath + '/certs/key.pem', /* Key file path */
            //keyData: null, /* String or Buffer containing key data, as certData */
            //passphrase: 'secret', /* A passphrase for the Key file */
            //ca: null, /* String or Buffer of CA data to use for the TLS connection */
            gateway: 'gateway.sandbox.push.apple.com', /* gateway address */
            //port: 2195, /* gateway port */
            //enhanced: true, /* enable enhanced format */
            //errorCallback: undefined, /* Callback when error occurs function(err,notification) */
            //cacheLength: 100                  /* Number of notifications to cache for error purposes */
        };

        var service = new apn.connection(options);

        service.on('connected', function () {
            console.log("Connected");
        });


        service.on('transmitted', function (notification, device) {
            console.log("Notification transmitted to:" + device.token.toString('hex'));
        });


        service.on('transmissionError', function (errCode, notification, device) {
            console.error("Notification caused error: " + errCode + " for device ", device, notification);
            if (errCode == 8) {
                console.log("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
            }
        });

        service.on('timeout', function () {
            console.log("Connection Timeout");
        });

        service.on('disconnected', function () {
            console.log("Disconnected from APNS");
        });


//var myDevice = new apn.Device(token);

        /*var note = new apn.Notification();

         note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
         note.badge = 3;
         note.sound = "mackay.aiff";
         note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
         note.payload = {'messageFrom': '1337 guy'};


         service.pushNotification(note, myDevice);*/


        var note = new apn.notification();
        note.sound = "mackay.aiff";
        note.badge = 42;
        note.setAlertText("Hello, from node-apn!");

        service.pushNotification(note, ["<0d47db3b 7c76c837 5477da11 113ad5c6 eacc13c9 49580a71 9f5af0e0 e5abc42a>"]);


        /*

         var tokens = ["<insert token here>", "<insert token here>"];


         // If you plan on sending identical paylods to many devices you can do something like this.
         function pushNotificationToMany() {
         console.log("Sending the same notification each of the devices with one call to pushNotification.");
         var note = new apn.notification();
         note.setAlertText("Hello, from node-apn!");
         note.badge = 1;

         service.pushNotification(note, tokens);
         }


         // If you have a list of devices for which you want to send a customised notification you can create one and send it to and individual device.
         function pushSomeNotifications() {
         console.log("Sending a tailored notification to %d devices", tokens.length);
         for (var i in tokens) {
         var note = new apn.notification();
         note.setAlertText("Hello, from node-apn! You are number: " + i);
         note.badge = i;

         service.pushNotification(note, tokens[i]);
         }
         }
         */

    }
};