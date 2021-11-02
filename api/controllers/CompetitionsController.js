/**
 * CompetitionsController
 *
 * @description :: Server-side logic for managing competitions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require("moment");

module.exports = {
  'index': function (req, res, next) {
    Competitions.find({where: {language: req.param("language")}}).populate("images").sort({order: 1}).sort({createdAt: -1}).exec(function foundCompetitions(err, competitions) {
      if (err) return next(err);

      var sorted = {archive: [], active: [], planned: [], disabled: []};

      _.each(competitions, function(competition) {
        if (moment().isAfter(competition.endDate)) {
          sorted.archive.push(competition);
        } else if (moment().isBefore(competition.endDate) && moment().isAfter(competition.startDate)) {
          sorted.active.push(competition);
        } else if (moment().isBefore(competition.endDate) && moment().isBefore(competition.startDate)) {
          sorted.planned.push(competition);
        } else {
          sorted.disabled.push(competition);
        }

      });

      res.view({moment: moment, competitions: _.union(sorted.disabled, sorted.planned, sorted.active, sorted.archive), language: req.param("language")});
    });
  },

  'new': function (req, res) {
    res.view("competitions/createAndUpdate", {language: req.param("language")});
  },

  'showAndUpdate': function (req, res) {
    Competitions.findOneBySlug(req.param("slug")).populate("images").exec(function foundCompetition(err, competition) {
      if (err || !competition) {
        req.session.flash = {err: sails.__("Not found")};
        return res.redirect("/");
      }

      competition.devices = _.indexBy(competition.images, "device");


      res.view("competitions/createAndUpdate", {
        competition: competition,
        language: req.param("language"),
        locals: {
          update: true,
          forceUpdate: req.param("update") || false
        }
      });

    });

  },

  'create': function (req, res) {
    Competitions.create(req.params.all(), function competitionCreated(err, competition) {
      if (err) {
        req.session.flash = {err: sails.__("Enter all required fields")};
        // redirect back if error but with flash message
        return res.redirect("competitions/" + req.param("language") + "/new");
      }

      // if there are pictures in request upload em and add them to db
      if (req.param("devicePic[]")) {
        ImagesService.uploadBlobImages(req.param("devicePic[]"), {
          type: "competitions",
          parentId: competition.id
        }, function (err, msg) {
          if (err) {
            req.session.flash = ({err: msg});
          } else {
            req.session.flash = {success: sails.__("Competition created!")};
          }
          return res.redirect("/competitions/" + req.param("language") + "/" + competition.slug);
        });
      } else {
        // there are no images, just do the upload
        req.session.flash = {success: sails.__("Competition created!")};
        res.redirect("/competitions/" + req.param("language") + "/" + competition.slug);
      }
    });
  },

  'update': function (req, res) {
    var params = req.params.all();
    params.updateSlug = true;
    Competitions.update(req.param("id"), params, function competitionUpdated(err, competition) {
      if (err) {
        req.session.flash = {err: sails.__("Enter all required fields")};
        return res.redirect("/competitions/" + req.param("language") + "/" + competition[0].slug);
      }

      // if there are pictures in request upload em and add them to db
      if (req.param("devicePic[]")) {
        ImagesService.uploadBlobImages(req.param("devicePic[]"), {
          type: "competitions",
          parentId: competition[0].id
        }, function (err, msg) {
          if (err) {
            req.session.flash = ({err: msg});
          } else {
            req.session.flash = {success: sails.__("Competition updated!")};
          }

          return res.redirect("/competitions/" + req.param("language") + "/" + competition[0].slug);
        });
      } else {
        // there are no images, just do the update
        req.session.flash = {success: sails.__("Competition updated!")};
        return res.redirect("/competitions/" + req.param("language") + "/" + competition[0].slug);
      }
    });

  },

  'find': function (req, res) {
    var options = {
      where: {
        startDate: {
          '<=': new Date()
        },
        endDate: {
          '>=': new Date()
        }
      }
    };

    var populateOptions = {};

    if (req.param("language")) {
      options.where.language = req.param("language");
    }

    if (req.param("device")) {
      populateOptions.device = req.param("device");
    }


    Competitions.find(options).populate("images", populateOptions).sort({order: 1}).sort({createdAt: -1}).exec(function foundCompetitions(err, competitions) {
      if (err) {
        return res.json(err);
      }
      res.json(competitions);
    });

  },

  'sort': function (req, res) {
    DatabaseService.sort({
      sortData: req.param("sortData"),
      controller: "competitions"
    }, function (response) {
      return res.send(response);
    });
  },

  'delete': function (req, res) {
    Competitions.destroy(req.param("id"), function (err, competitions) {
      if (err) return res.send({err: true, msg: sails.__("Error while deleting object")});

      return res.send({err: false, msg: sails.__("Object deleted!")});
    });
  },

  'clone': function (req, res) {
    var params = req.params.all();
    params.model = "competitions";
    DatabaseService.cloneEntry(params, function (response) {
      res.send(response);
    });
  }
};

