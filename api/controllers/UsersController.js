/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    // post
    'signin': function (req, res, next) {
        var params = req.params.all();

        // check if request contains user information
        if (!params.user) {
            return res.json({error: "No user info"});
        }

        // check if we have required parameters
        if (!params.user.email || !params.user.cardNumber || !params.user.source) {
            return res.json({error: "Not enought data"});
        }

        // hash requested email with out midget ninja
        var sha1 = require("sha1");
        var emailHash = params.user.email || "nomail";
        emailHash = sha1("MIDGET" + emailHash + "NINJA");

        // check if hashed email equals our false csrf
        if (params.csrf && emailHash === params.csrf) {
            // check if user exists by email
            Users.findOneByEmail(params.user.email, function (err, userCheck) {
                if (userCheck) {
                    // email exists update card number
                    Users.update(userCheck.id, params.user, function (err, user) {
                        if (err) {
                            // something is not right... this should not happen
                            sails.log.error("Problems while updating user id:", userCheck.id);
                            return res.json({error: "Error updating"});
                        } else {
                            // redirect to turnover route to get info about card...
                            return res.redirect("/api/turnover?cardNumber=" + params.user.cardNumber);
                        }
                    });
                } else {
                    // user doesn't exist... create it
                    Users.create(params.user, function (err, user) {
                        if (err) {
                            // something is not right... this should not happen
                            sails.log.error("Problems while creating user:", err);
                            return res.json({error: "Error creating user"});
                        } else {
                            // redirect to turnover route to get info about card...
                            return res.redirect("/api/turnover?cardNumber=" + params.user.cardNumber);
                        }
                    });
                }
            });


        } else {
            // we imitate csrf mismatch scenario, just to confuse someone who wants to play bad...
            res.status(403);
            return res.send("CSRF mismatch");
        }
    },

    // post
    'signup': function (req, res, next) {
        var params = req.params.all();

        // check if request contains user information
        if (!params.user) {
            return res.json({error: "No user info"});
        }

        // check if we have required parameters
        if (!params.user.email || !params.user.source) {
            return res.json({error: "Not enought data"});
        }


        // hash requested email with out midget ninja
        var sha1 = require("sha1");
        var emailHash = params.user.email || "nomail";
        emailHash = sha1("MIDGET" + emailHash + "NINJA");

        // check if hashed email equals our false csrf
        if (params.csrf && emailHash === params.csrf) {


            // get one available card for this new user
            Cards.findOneByAvailable(1, function (err, card) {
                if (err || !card) {
                    //edge case for no avalable cards
                    return res.json({error: "Not enough cards"});
                }

                // and update it so its not available anymore
                Cards.update(card.id, {available: 0}, function (err, card) {
                    if (err) {
                        // this shoudn't happen...
                        sails.log.error("Error while finding updating status of card", err);
                        return res.json({error: "Error updating"});
                    }

                    // assign to user this card
                    card = card[0];
                    params.user.cardNumber = card.cardNumber;

                    // check if user exists by email
                    Users.findOneByEmail(params.user.email, function (err, userCheck) {
                        if (userCheck) {
                            // email exists update card number
                            Users.update(userCheck.id, params.user, function (err, user) {
                                if (err) {
                                    // something is not right... this should not happen
                                    // we must bring back available to card...
                                    Cards.update(card.id, {available: 1}, function () {
                                        sails.log.error("Problems with updating user:", userCheck);
                                        return res.json({error: "Error updating"});
                                    });
                                } else {
                                    // we are sending old cardnumber if signup fails later... so we can update it back
                                    allDone(user[0], card, userCheck.cardNumber);
                                }
                            });
                        } else {
                            // user doesn't exist... create it
                            Users.create(params.user, function (err, user) {
                                if (err) {
                                    // something is not right... this should not happen
                                    // we must bring back available to card...
                                    Cards.update(card.id, {available: 1}, function () {
                                        sails.log.error("Problems with creating user:", err);
                                        return res.json({error: "Error creating user"});
                                    });
                                } else {
                                    allDone(user, card);
                                }
                            });
                        }
                    });
                });
            });
        } else {
            // we imitate csrf mismatch scenario, just to confuse someone who wants to play bad...
            res.status(403);
            return res.send("CSRF mismatch");
        }


        function allDone(userParams, cardParams, oldCardNumber) {
            // create new sign up for this user
            SignUps.create({cardNumber: cardParams.cardNumber, userId: userParams.id}, function (err, signUp) {
                if (err) {
                    // this shoudn't happen...
                    sails.log.error("Error while creating signup!", err);
                    // we must bring back available to card...
                    Cards.update(card.id, {available: 1}, function () {
                        if (oldCardNumber) {
                            // update was done... roll back user cardnumber
                            Users.update({email: userParams.email}, {cardNumber: card.cardNumber}, function (err, user) {
                                return res.json({error: "Error creating sign up!"});
                            });
                        } else {
                            // new user was created... delete that entry
                            Users.destroy(userParams.id, function (err) {
                                if(err) sails.log.error("Error while deleting user!", err, userParams); // oh, cmon this will not happen :D
                                return res.json({error: "Error creating sign up"});
                            });
                        }
                    });


                } else {
                    // everything went well, send email to loyalty
                    EmailService.sendEmail({
                        template: "new-user",
                        subject: "Ochsner Sport Club Anmeldung"
                    }, params.user, function (err, msg) {
                        if (err) sails.log.error("Error sending mail to loyalty!", msg);
                    });


                    // and send a warning if there are less then 1000 cards available
                    Cards.count({available: 1}, function availableCardsCount(err, count) {
                        if (count < 1000) {
                            EmailService.sendEmail({
                                template: "server-message",
                                subject: "Ochsner Sport Club - Backend warning"
                            }, {title: "Backend warning", message: "Only " + count + " available cards!!!"}, function (err, msg) {
                                if (err) sails.log.error("Error sending mail to loyalty!", msg);
                            });
                        }
                    });

                    // redirect to turnover route to get info about card...
                    return res.redirect("/api/turnover?cardNumber=" + cardParams.cardNumber);
                }
            });

        }

    },

    // post
    'contact': function (req, res) {
        var params = req.params.all();

        // check if request contains user information
        if (!params.user) {
            return res.json({error: "No user info"});
        }

        // check if we have required parameters
        if (!params.user.email) {
            return res.json({error: "Not enought data"});
        }

        // hash requested email with out midget ninja
        var sha1 = require("sha1");
        var emailHash = params.user.email || "nomail";
        emailHash = sha1("MIDGET" + emailHash + "NINJA");

        // check if hashed email equals our false csrf
        if (params.csrf && emailHash === params.csrf) {
            // everything went well, send email to loyalty
            EmailService.sendEmail({
                template: "contact",
                subject: "Ochsner Sport Club - Contact " + params.user.topic || "Topic not set"
            }, params.user, function (err, msg) {
                if (err) {
                    sails.log.error("Error sending mail to loyalty!", msg);
                    res.send({error: "Error sending mail!"});
                } else {
                    res.send({success: "Mail sent!"});
                }
            });
        } else {
            // we imitate csrf mismatch scenario, just to confuse someone who wants to play bad...
            res.status(403);
            return res.send("CSRF mismatch");
        }
    },


    'mailCheck': function (req, res) {
        // check if email already exists
        var email = req.param("email") || false;
        if (email) {
            Users.findOneByEmail(email, function (err, emailcheck) {
                if (err || emailcheck) {
                    return res.json({error: "Email exists!"});
                }
                return res.json({success: "Ok!"});
            });
        } else {
            return res.json({error: "No data"});
        }
    }
};
