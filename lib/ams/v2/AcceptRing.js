/*
 * @author Yariv Rosenbach
 * @repository https://github.com/yarivr/lp-labs-agent-sdk
 * Copyright 2016 LivePerson Inc - MIT license
 * https://github.com/yarivr/lp-labs-agent-sdk/LICENSE.md
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
