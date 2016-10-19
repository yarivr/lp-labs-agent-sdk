/**
 * Created by yarivr on 10/19/16.
 */
"use strict";

var AmsApiRequest = require('./AmsApiRequest');
let type = '.ams.ms.PublishEvent';

class ActiveEvent extends AmsApiRequest {
    constructor(params) {
        let _params =   {
            "dialogId": params.convId,
            "event": {
                "type": "ChatStateEvent",
                "chatState": "ACTIVE"
            }
        };
        super(_params, type);
    }
}

module.exports = ActiveEvent;
