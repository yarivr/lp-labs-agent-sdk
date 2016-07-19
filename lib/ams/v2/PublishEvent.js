/**
 * Created by yarivr on 7/18/16.
 */
"use strict";

var AmsApiRequest = require('./AmsApiRequest');
let type = '.ams.ms.PublishEvent';

class PublishEvent extends AmsApiRequest {
    constructor(params) {
        let _params =   {
                "dialogId": params.convId,
                "event": {
                    "type": "ContentEvent",
                    "contentType": "text/plain",
                    "message": params.message
                }
            };
        super(_params, type);
    }
}

module.exports = PublishEvent;