module.exports = function (req, res, next) {
    if (!_.contains(["de", "fr", "it"], req.param("language"))) {
        return res.redirect("/");
    }

    next();
};