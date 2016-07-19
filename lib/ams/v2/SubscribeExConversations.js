/**
 * Created by yarivr on 7/13/16.
 */
"use strict";

var AmsApiRequest = require('./AmsApiRequest');
let type = '.ams.aam.SubscribeExConversations';

class SubscribeExConversations extends AmsApiRequest {
    constructor(params) {
        let _params =  {
            "maxLastUpdatedTime": null,
            "minLastUpdatedTime": params.minLastUpdatedTime,
            "brandId": params.brandId,
            "maxETTR": null,
            "agentIds": [
                params.userId
            ],
            "convState": [ "OPEN","LOCKED", "CLOSE"]
        };
        super(_params, type);
    }
}

module.exports = SubscribeExConversations;