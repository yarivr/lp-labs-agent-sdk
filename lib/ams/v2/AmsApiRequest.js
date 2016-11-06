/*
 * @author Yariv Rosenbach
 * @repository https://github.com/yarivr/lp-labs-agent-sdk
 * Copyright 2016 LivePerson Inc - MIT license
 * https://github.com/yarivr/lp-labs-agent-sdk/LICENSE.md
 */
"use strict";

class AmsApiRequest {
    constructor(params, type) {
        this.params = params;
        this.type = type;
    }

    getRequest() {
        return this.params;
    }

    getType() {
        return this.type;
    }
}

module.exports = AmsApiRequest;
