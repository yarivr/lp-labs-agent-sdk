/*
 * @author Yariv Rosenbach
 * @repository https://github.com/yarivr/lp-labs-agent-sdk
 * Copyright 2016 LivePerson Inc - MIT license
 * https://github.com/yarivr/lp-labs-agent-sdk/LICENSE.md
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