/**
 * Created by yarivr on 7/13/16.
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
