/*
 * @author Yariv Rosenbach
 * @repository https://github.com/yarivr/lp-labs-agent-sdk
 * Copyright 2016 LivePerson Inc - MIT license
 * https://github.com/yarivr/lp-labs-agent-sdk/LICENSE.md
 */
"use strict";

var AmsApiRequest = require('./AmsApiRequest');
let type = '.ams.ms.PublishEvent';

class ComposeEvent extends AmsApiRequest {
    constructor(params) {
        let _params =   {
            "dialogId": params.convId,
            "event": {
                "type": "ChatStateEvent",
                "chatState": "COMPOSING"
            }
        };
        super(_params, type);
    }
}

module.exports = ComposeEvent;
