/*
 * @author Yariv Rosenbach
 * @repository https://github.com/yarivr/lp-labs-agent-sdk
 * Copyright 2016 LivePerson Inc - MIT license
 * https://github.com/yarivr/lp-labs-agent-sdk/LICENSE.md
 */
"use strict";

var AmsApiRequest = require('./AmsApiRequest');
let type = '.ams.ms.QueryMessages';

class QueryMessages extends AmsApiRequest {
    constructor(params) {
        let _params = {
            "dialogId": params.conversationId,
            "maxQuantity": params.maxQuantity,
            "olderThanSequence": params.olderThanSequence,
            "newerThanSequence": params.newerThanSequence
        };
        super(_params, type);
    }
}

module.exports = QueryMessages;
