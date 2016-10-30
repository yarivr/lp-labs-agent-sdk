/**
 * Created by yarivr on 8/31/16.
 */
"use strict";

let builder = require('botbuilder');

class RecognizerFactory {
    get(type, settings) {
        if (type === 'luisai') {
            return new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=' + settings.id + '&subscription-key=' + settings.key);
        }
        throw new Error("Failed to create recognizer of type " + type);
    }
}

let rf = new RecognizerFactory();

module.exports =  rf;
