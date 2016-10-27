/**
 * Created by yarivr on 7/12/16.
 */
"use strict";

var _ = require('lodash');
var EventEmitter = require('events');
var util = require('util');
var WebSocketClient = require('websocket').client;
var WebSocketConnection = require('websocket').connection;

var leLogin = require('../le-login');

class SocketProtocol extends EventEmitter {
    constructor(brandid, login, password, wsUrl, adminAreaUrl, liveEngageUrl) { // TODO: handle keep Alive
        super();
        this.brandid = brandid;
        this.login = login;
        this.password = password;
        this.wsUrl = wsUrl;
        this.adminAreaUrl = adminAreaUrl;
        this.liveEngageUrl = liveEngageUrl;
        this.connection = null;
        this.reqs = {};
        this.msgId = 0;
        this.ping = undefined;

        let keepAlive = () => {
            this.ping = setInterval(() => this.send(".GetClock", {}) , 30000);
        }

        let haltKeepAlive = () => {
            if (this.ping) {
                clearInterval(this.ping);
                this.ping = undefined;
            }
        }

        let authorize = () => {
            return leLogin.getToken(this.brandid, this.login, this.password, this.adminAreaUrl, this.liveEngageUrl);
        };

        let connect = () => {
            let sp = this;
            authorize(this.key, this.secret).then(function (token) {
                var client = new WebSocketClient();

                client.on('connectFailed', function (error) {
                    //console.log("Failed to connect");
                    setTimeout(function() { connect()}, 10000);
                });

                client.on('connect', function (connection) {
                    sp.connection = connection;
                    keepAlive();
                    sp.emit('ws::connect');
                    connection.on('error', function (error) {
                        connection.close(WebSocketConnection.CLOSE_REASON_INTERNAL_SERVER_ERROR);

                    });
                    connection.on('close', function () {
                        haltKeepAlive();
                        setTimeout(function () {
                            connect()
                        }, 5000);
                    });
                    connection.on('message', function (message) {
                        sp.lastReceiveTime = Date.now();

                        if (message.type === 'utf8') {
                            var jmsg = null;
                            try {
                                jmsg = JSON.parse(message.utf8Data);
                                var reqId = jmsg.reqId;
                                if (reqId && sp.reqs[reqId]) {  // msg approval
                                    if (jmsg.code && jmsg.code == 200) {
                                        sp.reqs[reqId].resolve(jmsg.body);

                                    }// Ring state updated successfully
                                    else if (jmsg.body.indexOf('successfully') > 0) { // TODO: avoid this hack once AMS API is fixed
                                        sp.reqs[reqId].resolve(jmsg.body);
                                    }
                                    else {
                                        console.log(">>>err sp1");
                                        sp.reqs[reqId].reject(jmsg.body);
                                    }
                                    delete sp.reqs[reqId];
                                }
                                else {  // ams msg
                                    sp.emit('ams::data', jmsg);
                                }
                            }
                            catch (err) {
                                console.log(">>>err sp2: ", err.message);
                            }
                        }
                    });

                });
                client.connect(sp.wsUrl + "/ws_api/account/" + sp.brandid + "/messaging/brand/" + token + "?v=2");
            })
        }

        connect();
    };

    send(type, body) {
        if (!this.connection.connected) {
            return Promise.reject("connection error");
        }

        let sp = this;
        let genId = () =>  {
            return this.msgId++;
        };
        let reqId = genId();
        let def = this.reqs[reqId] = Promise.defer();

        let sendToSocket= msg => {
            var sMsg = JSON.stringify(msg);
            if (this.connection.connected) {
                this.connection.sendUTF(sMsg);
            }
            //TDO: close socket if idle for server.wsTtl period
        };

        try{
            sendToSocket({
                kind: "req",
                type: type,
                id: reqId,
                body: body
                //headers?
            });
            setTimeout(function() {
                def.reject(new Error("Socket Protocol Msg timeout, type: " + type));
                if (sp.reqs.hasOwnProperty(reqId)) {
                    delete sp.reqs[reqId];
                    if (sp.connection) {
                        sp.connection.close( WebSocketConnection.CLOSE_REASON_INTERNAL_SERVER_ERROR);// TODO: more natural code
                    }
                }

            }, 10000);
        }catch(err){
            def.reject(err);
        }

        return def.promise;
    }

    close() {
        this.connection.close( WebSocketConnection.CLOSE_REASON_INTERNAL_SERVER_ERROR);// TODO: more natural code
    }

};

module.exports = SocketProtocol;
