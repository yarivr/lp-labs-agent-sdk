/**
 * Created by haggais on 7/20/16.
 */
"use strict";

var AgentSDK = require('../../index');
var mb = require('botbuilder').Message;
var async = require('async');
let Handlebars = require('handlebars');
let log = require('winston');

var LivePersonConnector = (function () {
    function LivePersonConnector(settings) {
        var _this = this;
        this.brandid = settings.brandid;
        this.key = settings.key;
        this.secret = settings.secret;
        this.timestamp = settings.timestamp;
        //this.transferSkill = settings.transferSkill;
        this.as = new AgentSDK(this.brandid, this.key, this.secret, this.timestamp);
        this.profiles = {};
        this.acceptCB = settings.acceptCB;

        this.as.on('error', function(e) {
           log.error(e.message);
        });

        this.as.on('consumer::ring', function (data) {
            var consumerId = data.consumerId;
            var convId = data.convId;
            var skillId = data.skillId;
            log.debug(">>>CONSUMER Ringing: " +  JSON.stringify(data));

            if(data.ringState !== 'WAITING') {
                log.debug(">>>CONSUMER Ringing is not WAITING, ignoring");
                return;
            }

            _this.as.acceptRing(data.ringId).then(function () {
                log.debug(">>> ring accepted");
                _this.as.getUserProfile(data.consumerId).then(function (data) {
                    log.debug(">>>Consumer Profile: " + JSON.stringify(data));
                    data['skillId'] = skillId;
                    _this.profiles[data.userId] = data;
                    _this.acceptCB({
                        brandId: _this.brandid,
                        convId: convId,
                        skillId: skillId,
                        consumerProfile: data,
                        consumerApi:  _this.as
                    });
                });
            }).catch(function (err) {
                log.debug(err.message);
            });
        });

        this.as.on('consumer::contentEvent', function(data) {
            log.debug("GOT Message from consumer (brandid, jparams): " + '(' + _this.brandid + ', ' + JSON.stringify(data) + ')');
            if (data.message.indexOf('transfer') == 0) {
                if (_this.transferSkill)
                    _this.as.transferToSkill(data.convId, _this.transferSkill);
            }
            else {
                var msg = new mb()
                    .address({channelId: 'liveperson', user: {id: data.consumerId, profile: _this.profiles[data.consumerId] }, conversation: {id: data.convId }, brandid: _this.brandid})
                    .timestamp()
                    .text(data.message)
                    /*.attachments(attachments)*/;
                let _msg = msg.toMessage();
                log.debug("Analyzing consumer message as:" + _msg);
                _this.handler(_msg);
            }
        });
    }

    LivePersonConnector.prototype.listen = function () {
    };

    LivePersonConnector.prototype.onEvent = function (handler) {
        this.handler = handler;
    };

    LivePersonConnector.prototype.send = function (messages, done) {
        var _this = this;

        function sendLP(action, convid, val, idx) {
            if (action == "sendText") {
                var deferred = Promise.defer();

                _this.as.compose(convid).then(function() {
                    setTimeout(function() {
                        _this.as.active(convid).then(function() {
                            _this.as.sendText(convid, val).then(function() {
                                deferred.resolve();
                            });
                        });
                    }, 2000 * (idx + 1));
                } ).catch(function(err) {
                    deferred.reject();
                });

                return deferred.promise;
            }
            else {
                return _this.as[action](convid, val);
            }

        }

        function sendSynchronously(idx) {
            if (idx == messages.length) {
                done();
            }
            else {
                var msg = messages[idx];
                var isJmsg = msg instanceof Object && msg.action;
                if (isJmsg) {
                    log.debug(msg.action + ', ' + _this.brandid + ' , ' + msg.address.conversation.id + ', ' + msg.val);
                    sendLP(msg.action, msg.address.conversation.id, msg.val, idx).then(function() {
                        sendSynchronously(idx+1);
                    });
                }
                else {
                    var message = msg.text;
                    if (!message) {
                        return;
                    }
                    log.debug('sendText' + ', ' + _this.brandid + ' , ' + msg.address.conversation.id + ', ' + message);
                    sendLP('sendText', msg.address.conversation.id, message, idx).then(function() {
                        sendSynchronously(idx+1);
                    });
                }
            }
        }

        sendSynchronously(0);
    };

    return LivePersonConnector;
})();

module.exports = LivePersonConnector;
