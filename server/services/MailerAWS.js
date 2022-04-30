const aws = require("aws-sdk");
const keys = require('../config/keys');
const Mailer = require("./Mailer");
const surveyTemplate = require("./emailTemplates/surveyTemplate");
const bodyParser = require('body-parser')
const ses = new aws.SES({
    accessKeyId: "AKIA37R6MPLKLB2KGXTH",
    secretAccessKey: "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",
    region: "us-east-1"
});

function MailerAWS({subject, recipients}, emailBody, sender) {
    //extract address from recipients.
    const toAddress = new Array();
    recipients.forEach(({email}) => toAddress.push(email));
    for (var index = 0; index < toAddress.length; index++) {
        var arr = [toAddress[index]];
        const params = {
            ConfigurationSetName: "SurveyEmail",
            Destination: {
                ToAddresses: arr//["sophiaff88@yahoo.com", "hello@yahoo.com"]
            },
            Message: {
                Body: {
                    Html: {
                        Data: emailBody
                        /*"<div style=\"text-align: center;\">" +
                        "<h3>I'd like your input!</h3>" +
                        "<p>Please answer the following question:</p>" +
                        "<p>Do you like our product?</p>" +
                        "<div>" +
                        "<a href=\"${keys.redirectDomain}/api/surveys/${survey.id}/yes\">Yes</a>" +
                        "</div>" +
                        "</div>" +
                        "<div style=\"text-align: center;\">" +
                        "<a href=\"${keys.redirectDomain}/api/surveys/${survey.id}/no\">No</a>" +
                        //"<a href={{no_link}}>Yes</a>" +
                        "</div>" +
                        "</div>"*/
                    }
                },
                Subject: {
                    Data: subject
                }
            },
            Source: sender
        };
        //console.log("in awsmailer params html:  " + params.Message.Body.Html.Data.toString())
        ses.sendEmail(params, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });
    }
}

module.exports = MailerAWS;


/*const params = {
    ConfigurationSetName:"Emailly",
    Destination:{
        ToAddresses:["sophiaff88@yahoo.com"]
    },
    Message: {
        Body: {
            Html: {
                Data:
                    "<div style=\"text-align: center;\">" +
                    "<h3>I'd like your input!</h3>" +
                    "<p>Please answer the following question:</p>" +
                    "<p>Do you like our product?</p>" +
                    "<div>" +
                    "<a href=\"${keys.redirectDomain}/api/surveys/${survey.id}/yes\">Yes</a>" +
                    "</div>" +
                    "</div>" +
                    "<div style=\"text-align: center;\">" +
                    "<a href=\"${keys.redirectDomain}/api/surveys/${survey.id}/no\">No</a>" +
                    "</div>" +
                    "</div>"
            }
        },
        Subject: {
            Data: "hello"
        }
    },
    Source: "blithe2021@gmail.com"
    };

    ses = new aws.SES({
    accessKeyId: "AKIA3GELKUXDYJZGUSR6",
    secretAccessKey: "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",
    region: "us-west-2"
});
ses.sendEmail(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else console.log(data);
});*/


/*
// Create email template
const par = {
    "Template": {
        "TemplateName": "MyTemplate",
        "SubjectPart": "{{t_subject}}",
        "HtmlPart": "<div style=\"text-align: center;\">" +
            "<h3>I'd like your input!</h3>" +
            "<p>Please answer the following question:</p>" +
            "<p>{{question}}</p>" +
            "<div>" +
            "<a href=\"${keys.redirectDomain}/api/surveys/${survey.id}/yes\">Yes</a>" +
            "</div>" +
            "</div>" +
            "<div style=\"text-align: center;\">" +
            "<a href=\"${keys.redirectDomain}/api/surveys/${survey.id}/no\">No</a>" +
            //"<a href={{no_link}}>Yes</a>" +
            "</div>" +
            "</div>"
    }
}

mailerAWS.ses.createTemplate(par, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
});

const params = {
    Destination:{
        ToAddresses:["sophiaff88@yahoo.com"]
    },
    Source: "blithe2021@gmail.com",
    Template: "MyTemplate",
    TemplateData: "{ \"t_subject\":\"reviewer\",\"question\":\"Do you like our product?\", \"survey.id\":\"2\" }"
};

console.log("");
mailerAWS.send(params)*/
