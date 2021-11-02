/**
 * TurnoverController
 *
 * @description :: Server-side logic for managing competitions
 *
 */

module.exports = {

    'getTurnover': function (req, res) {

        var moment = require("moment");

        if (!req.param("cardNumber")) {
            return res.json({error: "No card info"});
        }

        // firstly get last turnover date...
        TurnoverLog.find().sort({id: -1}).limit(1).exec(function (err, turnDate) {
            // return the turnover for his card if possible
            Turnover.findOneByCardNumber(req.param("cardNumber"), function (err, turnover) {
                var turnoverDate;
                var amountSpent = 0;

                if (turnDate[0]) {
                    turnoverDate = moment(turnDate[0].fileDate).format("DD.MM.YYYY");
                } else {
                    // there is no log... just sent todays date at least... edge case...
                    turnoverDate = moment(new Date()).format("DD.MM.YYYY");
                }

                if (turnover && turnover.amountSpent) {
                    amountSpent = turnover.amountSpent;
                }



                return res.json({
                    turnover: amountSpent,
                    cardNumber: req.param("cardNumber"),
                    date: turnoverDate,
                    bacon: 'Bacon ipsum dolor amet sausage t-bone flank, pig meatball pork chop sirloin pork belly alcatra boudin drumstick. Tri-tip kielbasa chuck beef ribs pork loin leberkas biltong capicola. Frankfurter spare ribs pork swine shank. Alcatra short ribs tongue, prosciutto beef ribs spare ribs pastrami jowl hamburger boudin. Leberkas spare ribs ball tip short ribs prosciutto strip steak filet mignon cow shoulder. Salami pork belly prosciutto hamburger, pork loin jowl turkey doner frankfurter alcatra. Bresaola turducken kielbasa, salami sirloin andouille beef ribs picanha ham hock pancetta beef ribeye cupim ball tip drumstick. Tri-tip short ribs shank meatloaf, chuck ribeye fatback pork chop ham strip steak doner pork belly. Pork chop turkey doner ground round pork, short loin meatloaf short ribs beef ribs. Boudin picanha prosciutto ham hock pork pork loin beef rump tongue. Jowl leberkas meatball capicola pancetta turkey, pig chuck. Pastrami pig kevin beef venison andouille prosciutto landjaeger turducken kielbasa. Ham hock pig ribeye flank t-bone venison hamburger chicken beef ribs frankfurter tenderloin shoulder capicola tongue biltong. Ball tip shank andouille jowl, sausage meatball beef ribs pork chop meatloaf capicola t-bone pork belly biltong. Salami fatback chuck tail beef ribs ham short loin filet mignon strip steak jowl prosciutto shankle. Shank corned beef jowl pork loin tongue. Drumstick leberkas corned beef, frankfurter short loin flank filet mignon ball tip shank meatloaf sausage. Biltong cupim sirloin pancetta. Doner bresaola ham hock pancetta capicola drumstick corned beef shankle picanha shank ribeye sirloin t-bone pork fatback. Jerky meatball tenderloin, beef ribs ground round ribeye pig beef spare ribs leberkas. Venison frankfurter strip steak, pig alcatra kielbasa shank. Bresaola frankfurter alcatra, spare ribs shankle turducken jerky ball tip jowl kevin tri-tip filet mignon prosciutto cow fatback. Filet mignon doner kielbasa, biltong chuck salami flank hamburger bacon meatball spare ribs beef ribs. Bacon salami pork chop ham hock drumstick meatball ribeye shank prosciutto sausage fatback. Biltong fatback ground round strip steak leberkas, meatloaf corned beef cupim pork.'
                });
            });
        });
    }

};