/**
 * Created by yarivr on 9/20/16.
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
