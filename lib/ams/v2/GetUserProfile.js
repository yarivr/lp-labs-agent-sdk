/**
 * Created by yarivr on 7/18/16.
 */

"use strict";

var AmsApiRequest = require('./AmsApiRequest');
let type = '.ams.userprofile.GetUserProfile';

class GetUserProfile extends AmsApiRequest {
    constructor(params) {
        let _params =  {
            "userId":""
        };
        super(_params, type);
    }
}

module.exports = GetUserProfile;