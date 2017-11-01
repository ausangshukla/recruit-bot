const apiai = require('apiai');
const config = require('./config');
const bodyParser = require('body-parser');
const request = require('request');
const uuid = require('uuid');

var msg_handler = require('./msg_handler');


var router = require('express').Router();

/*
 * for Facebook verification
 */
router.get('/', function(req, res) {
    console.log("request");
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
})

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
router.post('/', function(req, res) {
    var data = req.body;
    console.log(JSON.stringify(data));



    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function(pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function(messagingEvent) {
                if (messagingEvent.optin) {
                    msg_handler.receivedAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    msg_handler.receivedMessage(messagingEvent);
                } else if (messagingEvent.delivery) {
                    msg_handler.receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    msg_handler.receivedPostback(messagingEvent);
                } else if (messagingEvent.read) {
                    msg_handler.receivedMessageRead(messagingEvent);
                } else if (messagingEvent.account_linking) {
                    msg_handler.receivedAccountLink(messagingEvent);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        // Assume all went well.
        // You must send back a 200, within 20 seconds
        res.sendStatus(200);
    }
});


module.exports = router;