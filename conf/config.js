var _ = require('lodash');
var fs = require('fs');
var merge = require('merge');

function Config() {
    //var privateConfig =  '../../../../conf/msg-gw/config.json';
    //var dd = require(privateConfig);

    //var config = merge(require('../conf/conf.json'), require(privateConfig));
    var config = require('./conf.json');
    return config;

}


/**
 * From here onwards this code section is not a functional code 
 * It is purely an Intellij intelisense
 */


/**
 * @property queryMessages {Number} how many ms in between agent (was named brand) ws is polling the UMS for new messages.
 * @constructor
 * **/
function TransactionTimes(queryMessages) {
    this.queryMessages = queryMessages;
}

/**
 * @param batchTime {Number} [ms] The interval that msggw will poll accounts from database to verify that brand WS is open and if not open one.  recommanded values: dev: 10000, qa/production: 60000
 * @constructor
 */
function Scheduler(batchTime) {
    this.batchTime = batchTime;
}

/**
 * @property outgoingRESTTimeoutMS {number} Timeout for connecting from messaging app to external systems such as get the user profile in milliseconds.
 * @property muteNoizyLogging {boolean} Today the server works in debug log level, there are some places such as GetClock where it's noisy and with true it would block these logging.
 * @property wsTtl {number} When msggw sends a message to AMS via WS if it notices the last time it received any message from AMS via WS is larger than this ttl it would close the socket!
 * @property transactionTimes {TransactionTimes}
 * @property scheduler {Sheduler}
 * @constructor
 */
function Server(outgoingRESTTimeoutMS, muteNoizyLogging, wsTtl, scheduler, transactionTimes) {
    this.outgoingRESTTimeoutMS = outgoingRESTTimeoutMS;
    this.muteNoizyLogging = muteNoizyLogging;
    this.wsTtl = wsTtl;
    this.transactionTimes = transactionTimes;
}

/**
 * @param server {Server}
 * @constructor
 */
function Configuration(server) { this.server = server; }

/** @type {Configuration} */ 
module.exports = Config();
