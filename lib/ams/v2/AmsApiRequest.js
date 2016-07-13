/**
 * Created by yarivr on 7/13/16.
 */


class AmsApiRequest {
    constructor(params) {
        this.params = params;
    }

    getRequest() {
        return this.params;
    }
}

module.exports = AmsApiRequest;
