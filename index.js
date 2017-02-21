'use strict';

const Alexa = require('alexa-sdk');
const transitController = require('./controllers/transitInfo');

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    //Use LaunchRequest, instead of NewSession if you want to use the one-shot model
    // Alexa, ask [my-skill-invocation-name] to (do something)...
    'LaunchRequest': function () {
        this.attributes['speechOutput'] = languageString.WELCOME_STRING;
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['repromptSpeech'] = languageString.WELCOME_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['For instructions, say help me'])
    },
    'PathGuideIntent': function () {
        const sourceStation = this.event.request.intent.slots.Source.value.toLowerCase();
        const destStation = this.event.request.intent.slots.Destination.value.toLowerCase();
        const self = this;
        return transitController.getNextTrain(sourceStation, destStation)
            .then(function (output) {
                console.log(`API Response: ${JSON.stringify(output, null, 2)}`);

                if (output.isError) {
                    self.attributes['speechOutput'] = output.data;
                    self.attributes['repromptSpeech'] = languageString.ITEM_NOT_FOUND_REPROMPT;
                } else {
                    self.attributes['speechOutput'] = output.data;
                }
                speechOutput += repromptSpeech;
                const cardTitle = `Path Guide : Next train from ${sourceStation} to ${destStation}`;
                self.emit(':tellWithCard', output.data, cardTitle, output.data);
            });
    },
    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = languageString.HELP_MESSAGE;
        this.attributes['repromptSpeech'] = languageString.HELP_REPROMPT;
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', languageString.STOP_MESSAGE);
    }
};

const languageString = {
    WELCOME_STRING: 'Welcome to the Path App',
    WELCOME_REPROMPT: 'For help, say help me',
    SKILL_NAME: 'Path Guide',
    REPEAT_MESSAGE: 'Try saying repeat',
    ITEM_NOT_FOUND_REPROMPT: 'What else can I help with?',
    HELP_MESSAGE: 'You can ask questions such as train from Grove Street to World Trade Center ...Now, what can I help you with?',
    HELP_REPROMPT: 'You can say things like Hoboken to Thirty Third Street...Now, what can I help you with?',
    STOP_MESSAGE: 'Goodbye!'
};