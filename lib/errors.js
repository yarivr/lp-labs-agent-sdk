/**
 * Created with IntelliJ IDEA.
 * User: yarivr
 * Date: 10/11/15
 * Time: 11:37 AM
 * To change this template use File | Settings | File Templates.
 */

var util = require('util');


function AgentLogin(brandid) {
    this. _brandid = brandid;
    Error.call(this, "WS login failed for site " + brandid);
}

util.inherits(AgentLogin, Error);
AgentLogin.prototype.getBrandId = function() {
    return this._brandid;
};

module.exports.AgentLogin = AgentLogin;
