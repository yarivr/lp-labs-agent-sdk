/**
 * Created by yarivr on 7/13/16.
 */
"use strict";

class AmsApiRequest {
    constructor(params) {
        this.params = params;
    }

    getRequest() {
        return this.params;
    }

    getType() {
        return this.type;
    }
}

module.exports = AmsApiRequest;
