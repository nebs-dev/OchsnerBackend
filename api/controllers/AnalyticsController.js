/**
 * AnalyticsController
 *
 * @description :: Server-side logic for managing analytics
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require("moment");
var qs = require('querystring');
var request = require('request');

module.exports = {
  iTunesConnect: function (req, res, next) {
    var itc = require("itunesconnect");
    var Report = itc.Report;

    var itunesconnect = new itc.Connect('ios_account@ochsnersport.ch', 'c^n9oLpsYMR@vR$F');
    var appKey = 961744810;

    if (req.param('getAll')) {
      itunesconnect.request(Report.ranked().time(10, 'years').content(appKey), function (error, result) {
        if (error || !result[0])  return res.send(false);

        return res.send({data: result[0].units});
      });
    } else {
      // ranked or timed result...
      itunesconnect.request(Report.timed().time(1, 'months').interval('day').content(appKey), function (error, result) {
        if (error || !result[0])  return res.send(false);

        var labels = [], data = [];
        _.each(result[0].data, function (point) {
          labels.push(moment(point.date).format("DD.MM."));
          data.push(point.units);
        });


        return res.send({labels: labels, data: data});
      });
    }
  },

  userStats: function (req, res) {
    Users.find().exec(function (err, users) {
      if (err) return res.send("Error!");

      return res.send(_.countBy(users, 'source'));
    });
  },

  cardStats: function (req, res) {
    Cards.count({available: 1}).exec(function (err, availableCards) {
      if (err) return res.send("Error!");

      return res.send({availableCards: availableCards});
    });
  },

  googleAnalyticsConnect: function (callback) {
    var fs = require('fs'),
      crypto = require('crypto');

    var authHeader = {
        'alg': 'RS256',
        'typ': 'JWT'
      },
      authClaimSet = {
        'iss': "703313279751-gsdilkaot1n6u6415ptmrqaholtp3b54@developer.gserviceaccount.com", // Service account email
        'sub': "hrvoje@smartfactory.ch",
        'scope': 'https://www.googleapis.com/auth/analytics.readonly', // We MUST tell them we just want to read data
        'aud': 'https://accounts.google.com/o/oauth2/token'
      },
      SIGNATURE_ALGORITHM = 'RSA-SHA256',
      SIGNATURE_ENCODE_METHOD = 'base64',
      GA_KEY_PATH = sails.config.appPath + "/certs/google_certificate.pem",
      gaKey;

    function urlEscape(source) {
      return source.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
    }

    function base64Encode(obj) {
      var encoded = new Buffer(JSON.stringify(obj), 'utf8').toString('base64');
      return urlEscape(encoded);
    }

    function readPrivateKey() {
      if (!gaKey) {
        gaKey = fs.readFileSync(GA_KEY_PATH, 'utf8');
      }
      return gaKey;
    }


    var now = parseInt(Date.now() / 1000, 10), // Google wants us to use seconds
      cipher,
      signatureInput,
      signatureKey = readPrivateKey(),
      signature,
      jwt;

    // Setup time values
    authClaimSet.iat = now;
    authClaimSet.exp = now + 60; // Token valid for 1 minute

    // Setup JWT source
    signatureInput = base64Encode(authHeader) + '.' + base64Encode(authClaimSet);

    // Generate JWT
    cipher = crypto.createSign('RSA-SHA256');
    cipher.update(signatureInput);
    signature = cipher.sign(signatureKey, 'base64');
    jwt = signatureInput + '.' + urlEscape(signature);

    // Send request to authorize this application
    request({
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      uri: 'https://accounts.google.com/o/oauth2/token',
      body: 'grant_type=' + escape('urn:ietf:params:oauth:grant-type:jwt-bearer') +
      '&assertion=' + jwt
    }, function (error, response, body) {
      if (error) {
        callback(new Error(error));
      } else {
        var gaResult = JSON.parse(body);
        if (!gaResult.error && gaResult.access_token) {
          callback(null, gaResult.access_token);
        } else {
          callback("Error connecting to GA");
        }
      }
    });
  },

  GAsessions: function (req, res) {
    this.googleAnalyticsConnect(function (error, token) {
      if (error) return res.send(false);

      var requestConfig = {
        'ids': 'ga:96922821',
        'metrics': 'ga:sessions',
        'dimensions': 'ga:date',
        'start-date': '30daysAgo',
        'end-date': 'yesterday'
      };

      request({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        },

        uri: 'https://www.googleapis.com/analytics/v3/data/ga?' + qs.stringify(requestConfig)
      }, function (error, resp, body) {
        if (error) return res.send(error);

        var gaData = JSON.parse(body);

        if (!gaData.rows) return res.send(gaData);

        var labels = [], data = [];
        _.each(gaData.rows, function (point) {
          labels.push(moment(point[0], "YYYYMMDD").format("DD.MM"));
          data.push(point[1]);
        });

        return res.send({labels: labels, data: data});
      });
    });
  },

  GAcurrentUsers: function (req, res) {
    this.googleAnalyticsConnect(function (error, token) {
      if (error) return res.send(error);

      var requestConfig = {
        'ids': 'ga:96922821',
        'metrics': 'rt:activeUsers'
      };

      request({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        },

        uri: 'https://www.googleapis.com/analytics/v3/data/realtime?' + qs.stringify(requestConfig)
      }, function (error, resp, body) {
        if (error) return res.send(error);
        var gaResult = JSON.parse(body);

        if (!gaResult.totalsForAllResults) return res.send(gaResult);

        return res.send(gaResult.totalsForAllResults);
      });

    });
  }

};

