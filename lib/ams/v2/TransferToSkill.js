/**
 * Created by yarivr on 8/7/16.
 */
"use strict";

var AmsApiRequest = require('./AmsApiRequest');
let type = '.ams.cm.UpdateConversationField';

class TransferToSkill extends AmsApiRequest {
    constructor(params) {
        let _params =  {
            "conversationId": params.conversationId,
            "conversationField": [{
                "field": "Skill",
                "type": "UPDATE",
                "skill": params.skillId
            }, {
                "field": "ParticipantsChange",
                "type": "REMOVE",
                "userId": params.userId,
                "role": "ASSIGNED_AGENT"
            }]
        };
        super(_params, type);
    }
}

module.exports = TransferToSkill;