/*
 * @author Yariv Rosenbach
 * @repository https://github.com/yarivr/lp-labs-agent-sdk
 * Copyright 2016 LivePerson Inc - MIT license
 * https://github.com/yarivr/lp-labs-agent-sdk/LICENSE.md
 */
"use strict";

let _ = require('lodash');
let builder = require('botbuilder');

module.exports = {
    "events": {
        "accept": (function () {
            let res = {};
            res["-1"] = [
                function () {
                    return {action: "sendText", val: "Hello, I'm botty the bot, how can I help you?"};
                }
            ];
            return res;
        }())
    },
    dialogs: {
        "None": [
            function (session, args, next) {
                session.endDialog("Oops, I didn't get that :(");
            }
        ],
    },
    intents: {
        "greeting": [
            function (session, results, next) {
                builder.Prompts.text(session, "Hi, What is your favorate color?");
            },
            function (session, results, next) {
                let response = results.response ? results.response.toLowerCase() : '';
                session.endDialog("Got it, good bye");

            }
        ],

    }
};