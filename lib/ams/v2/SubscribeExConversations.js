/**
 * Created by yarivr on 7/13/16.
 */

var AmsApiRequest = require('./AmsApiRequest');

class SubscribeExConversations extends AmsApiRequest {
    constructor(params) {
        let _params =  {
            "maxLastUpdatedTime": null,
            "minLastUpdatedTime": params.minLastUpdatedTime,
            "brandId": params.brandId,
            "maxETTR": null,
            "agentIds": [
                ""
            ],
            "convState": [ "OPEN","LOCKED", "CLOSE"]
        };
        super(_params);
    }
}

module.exports = SubscribeExConversations;