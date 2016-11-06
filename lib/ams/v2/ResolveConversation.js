/*
 * @author Yariv Rosenbach
 * @repository https://github.com/yarivr/lp-labs-agent-sdk
 * Copyright 2016 LivePerson Inc - MIT license
 * https://github.com/yarivr/lp-labs-agent-sdk/LICENSE.md
 */
"use strict";

var AmsApiRequest = require('./AmsApiRequest');
let type = '.ams.cm.UpdateConversationField';

class ResolveConversation extends AmsApiRequest {
    constructor(params) {
        let _params = {
            "conversationId": params.conversationId,
            "conversationField": {
                "field": "ConversationStateField",
                "conversationState": "CLOSE"
            }
        };
        super(_params, type);
    }
}

module.exports = ResolveConversation;
