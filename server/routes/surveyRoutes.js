const _ = require('lodash');
const {Path} = require('path-parser');
const {URL} = require('url');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');
const MailerAWS = require("../services/MailerAWS");
const bodyParser = require('body-parser')
const superagent = require('superagent');
const Survey = mongoose.model('surveys');

module.exports = app => {
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.text());

    app.get('/api/surveys', requireLogin, async (req, res) => {
        const surveys = await Survey.find({_user: req.user.id}).select({
            recipients: false
        });

        res.send(surveys);
    });

    // after clicking the options, redirect to the 'thanks' page
    app.get('/api/surveys/:surveyId/:choice', (req, res) => {
        res.send('Thanks for voting!');
    });

    app.post('/api/surveys/webhooks', (req, res) => {
        if (req.is('text/*')) {
            const resp = JSON.parse(req.body);
            //console.log(resp.SubscribeURL);
            if (resp.SubscribeURL) {
                superagent.get(resp.SubscribeURL).end((err, res) => {
                    if (err) {
                        console.error(new Date(), `Error at subscription: ${err.name}`);
                        //res.sendStatus(500);
                    } else {
                        console.log(new Date(), `success to subscribe`);
                        //res.sendStatus(200);
                    }
                });
            } else {
                const message = JSON.parse(resp.Message);
                const p = new Path('/api/surveys/:surveyId/:choice');
                // use the chain() function to deal with paths
                const event = _.chain(message)
                    .map(({mail, click}) => {
                        let email = message.mail.destination[0];
                        // extract the surveyId and choice form path
                        const match = p.test(new URL(message.click.link).pathname);
                        console.log("match found: " + match.surveyId);
                        console.log("match found: " + match.choice);
                        if (match) {
                            return {email, surveyId: match.surveyId, choice: match.choice};
                        }
                    })
                    // remove undefined empty object
                    .compact()
                    // remove repeated object
                    .uniqBy('email', 'surveyId')
                    .each(({surveyId, email, choice}) => {
                        Survey.updateOne(
                            {
                                _id: surveyId,
                                recipients: {
                                    $elemMatch: {email: email, responded: false}
                                }
                            },
                            {
                                $inc: {[choice]: 1},
                                $set: {'recipients.$.responded': true},
                                lastResponded: new Date()
                            }
                        ).exec();
                    })
                    .value();
                console.log("end")
                res.send({});
            }
        }
    });

    // first check if login by requireLogin middleware
    // and then check if user has enough credits
    app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
        // extract data
        const {title, subject, body, recipients} = req.body;
        // create a new instance for mongoDB
        const survey = new Survey({
            title,
            subject,
            body,
            // split the recipients and store as an object
            recipients: recipients.split(',').map(email => ({email: email.trim()})),
            _user: req.user.id,
            dateSent: Date.now()
        });
        // Great place to send an email!

        try {
            await MailerAWS(survey, surveyTemplate(survey), "blithe2021@gmail.com");
            // store the data to mongoDB
            await survey.save();
            // update the credit
            req.user.credits -= 1;
            // save the updated user data
            const user = await req.user.save();

            res.send(user);
        } catch (err) {
            res.status(422).send(err);
        }
    });
};
