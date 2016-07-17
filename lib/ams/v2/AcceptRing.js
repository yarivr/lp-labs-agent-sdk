/**
 * Created by yarivr on 7/13/16.
 */
"use strict";

var AmsApiRequest = require('./AmsApiRequest');
let type = '.ams.routing.UpdateRingState';

class AcceptRing extends AmsApiRequest {
    constructor(params) {
        let _params =  {
            "ringId": params.ringId,
            "ringState": "ACCEPTED"
        };
        super(_params, type);
    }
}

module.exports = AcceptRing;
