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
const surveyDDBModel = require('../models/SurveyDDB');

module.exports = app => {
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.text());

    app.get('/api/surveys', requireLogin, async (req, res) => {
        console.log("survey existing user's id: ", req.user.id);
        const surveys = await Survey.find({_user: req.user.id}).select({
            recipients: false
        });

        res.send(surveys);
    });

    // after clicking the options, redirect to the 'thanks' page
    app.get('/api/surveys/:surveyId/:choice', (req, res) => {
        /*console.log("--------------------------------------------------------");
        const clickURL = req.url.toString();
        const strList = clickURL.split("/");
        //console.log(strList[3]);
        //console.log(strList[4]);
        const surveyId = strList[3];
        const choice = strList[4];*/
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


    //console.log("------------------------------------------------------------------------");
    const resp = {
        "Type": "SubscriptionConfirmation",
        "MessageId": "3f030b1c-2f36-4c59-af4c-f1424367c49e",
        "Token": "2336412f37fb687f5d51e6e2425dacbbab295929709629bc581ffe77937070b0cdad182baeda8c7cc3b88118106f7e25b9c64ca0f73a03435a8db406d63246ce9289b5a627a480a79cd65bb3aa3dc1363ad9cca3a6d983fc97d8575d18da65e56d423ab3b11e458f43f5fa804681965d",
        "TopicArn": "arn:aws:sns:us-west-2:769091347911:Emaily",
        "Message": "You have chosen to subscribe to the topic arn:aws:sns:us-west-2:769091347911:Emaily.\nTo confirm the subscription, visit the SubscribeURL included in this message.",
        "SubscribeURL": "https://sns.us-west-2.amazonaws.com/?Action=ConfirmSubscription&TopicArn=arn:aws:sns:us-west-2:769091347911:Emaily&Token=2336412f37fb687f5d51e6e2425dacbbab295929709629bc581ffe77937070b0cdad182baeda8c7cc3b88118106f7e25b9c64ca0f73a03435a8db406d63246ce9289b5a627a480a79cd65bb3aa3dc1363ad9cca3a6d983fc97d8575d18da65e56d423ab3b11e458f43f5fa804681965d",
        "Timestamp": "2022-04-22T18:13:06.659Z",
        "SignatureVersion": "1",
        "Signature": "FYj7bKnv71j4ouIqlMarzYVpnhu3IgeJa69IBCvAHQP/6XcKBmzWmSM0x9QbTNuCncYRTDEzsICs/PducAR5kTgandGJ9RbuecXoeQM9dTM70ktCyWmblyh5v8LEcQisSXvdscQ3/tTCkL4PMzxOQAHvR/6YRHnr6Z3tf7WdBdkzxcdzR131Px1EUjxdR3zLfMgH41gh7MeBdxFgVnCjsZ8R3Wd4CEJgmujsCmDh18f8B2BdTNLPlgnohRbBqy6xixDQHyE45YNQe54bGM+VR9yJxoLGrJUf/VRvEJUgfVDrmYdQOBzKLAGr368DUZpFmvZVPsaG/Xr+zFQq0zjhpg==",
        "SigningCertURL": "https://sns.us-west-2.amazonaws.com/SimpleNotificationService-7ff5318490ec183fbaddaa2a969abfda.pem"
    }
//confirm subscription
    /*if (resp.SubscribeURL) {
        superagent.get(resp.SubscribeURL).end((err, res) => {
            if (err) {
                console.error(new Date(), `Error at subscription: ${err.name}`);
                //res.sendStatus(500);
            } else {
                console.log(new Date(), `success to subscribe`);
                //res.sendStatus(200);
            }
        });
    }*/


    const notifi = {
        "Type": "Notification",
        "MessageId": "95a0f81c-4327-5733-9988-a2c0688e055f",
        "TopicArn": "arn:aws:sns:us-west-2:769091347911:Emaily",
        "Subject": "Amazon SES Email Event Notification",
        "Message": "{" +
            "\"eventType\":\"Click\"," +
            "\"mail\":{" +
            "\"timestamp\":\"2022-04-21T19:35:28.439Z\"," +
            "\"source\":\"blithe2021@gmail.com\"," +
            "\"sendingAccountId\":\"769091347911\"," +
            "\"messageId\":\"010101804d9f51b7-431d073a-fd21-4ae2-b252-c01d4adf9644-000000\"," +
            "\"destination\":[\"sophiaff88@yahoo.com\"]," +
            "\"headersTruncated\":false," +
            "\"headers\":[{\"name\":\"From\",\"value\":\"blithe2021@gmail.com\"},{\"name\":\"To\",\"value\":\"sophiaff88@yahoo.com\"},{\"name\":\"Subject\",\"value\":\"sns\"},{\"name\":\"MIME-Version\",\"value\":\"1.0\"},{\"name\":\"Content-Type\",\"value\":\"text/html; charset=UTF-8\"},{\"name\":\"Content-Transfer-Encoding\",\"value\":\"7bit\"},{\"name\":\"Date\",\"value\":\"Thu, 21 Apr 2022 19:35:28 +0000 (UTC)\"},{\"name\":\"Message-ID\",\"value\":\"null\"}]," +
            "\"commonHeaders\":{\"from\":[\"blithe2021@gmail.com\"],\"date\":\"Thu, 21 Apr 2022 19:35:28 +0000 (UTC)\",\"to\":[\"sophiaff88@yahoo.com\"],\"messageId\":\"010101804d9f51b7-431d073a-fd21-4ae2-b252-c01d4adf9644-000000\",\"subject\":\"sns\"}," +
            "\"tags\":{\"ses:operation\":[\"SendEmail\"],\"ses:configuration-set\":[\"Emailly\"],\"ses:source-ip\":[\"24.18.166.211\"],\"ses:from-domain\":[\"gmail.com\"],\"ses:caller-identity\":[\"ses-user\"]}}," +
            "\"click\":{\"timestamp\":\"2022-04-22T04:04:57.000Z\",\"ipAddress\":\"24.18.166.211\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36\",\"link\":\"http://localhost:3000/api/surveys/6261b2000468eb1f9c40f68a/yes\",\"linkTags\":null}}\n",
        "Timestamp": "2022-04-22T04:04:57.097Z",
        "SignatureVersion": "1",
        "Signature": "lISBGvG4fucFXebnfdcjpUdA7zS6+5S8JVYIN4XDvtsXMv+ylot4BH1aN5yO6V0T6Xw43d8bqctHRwxkiuBhzd2giJCGj4gsoEpS5k0i6mNK/8o9xyQ60LJviCYxRFBX5jiZs1hXyIRWqDyNTwfYAmhm4JnA0CYRS+bpgg00i7y5hFxl2tK5oJic5gGfE5AOafYIZi8DYdO3ZqDrhSfz/axY0ICU9BoAtwru6F7jLwrRDkG62dERVp6vloYS/V/XhXblXWtiuGSe8En8l3M7k7wOK+4Yv+30n1OmhuMykaKdMvyQ7T8QI+mIXRJbZBjtOw8sWdEa+jfBjxPaaNrB1g==",
        "SigningCertURL": "https://sns.us-west-2.amazonaws.com/SimpleNotificationService-7ff5318490ec183fbaddaa2a969abfda.pem",
        "UnsubscribeURL": "https://sns.us-west-2.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-west-2:769091347911:Emaily:ce9888d0-a19a-4b8b-92d8-022e657fbb0c"
    }

    /* const message = JSON.parse(notifi.Message);
     //console.log(message.mail.destination[0]);  **parse destination
     //console.log(message.click.link); **parse link clicked
     //return res.end()

     // create a new path
     const p = new Path('/api/surveys/:surveyId/:choice');

     // use the chain() function to deal with paths
     const event = _.chain(message)
         .map(({mail, click}) => {
             let email = message.mail.destination[0];
             // extract the surveyId and choice form path
             const match = p.test(new URL(message.click.link).pathname);
             //console.log("match found: " + match.surveyId);
             //console.log("match found: " + match.choice);
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

     res.send({});*/


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

        console.log("Building surveyDDB...");
        console.log("Building surveyDDB recipients: ", recipients);
        const surveyDDB = new surveyDDBModel({
            "id": "624f8d65876bcc4ed0d5582c",
            "title": title,
            "subject": subject,
            "body": body,
            "recipients": recipients.split(',').map(email => ({"email": email.trim()})),
            "_user": req.user.id,
            dateSent: Date.now()
            
        });
        console.log("Writing to ddb...");
        await surveyDDB.save();
        console.log("Writing to ddb finished")
        // Great place to send an email!
        // create a new mailer
        const mailer = new Mailer(survey, surveyTemplate(survey));

        try {
            // send the mailer to sendGrid
            // await mailer.send();
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
