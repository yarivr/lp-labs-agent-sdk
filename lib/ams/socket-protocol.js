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
            this.ping = setInterval(() => this.send(".GetClock", {}), 30000);
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
                    console.log("Failed to connect");
                    setTimeout(function() { connect()}, 10000);
                });

                client.on('connect', function (connection) {
                    sp.connection = connection;
                    keepAlive();
                    sp.emit('ws::connect');
                    //keepAlive();
                    connection.on('error', function (error) {
                        // TODO: close connection
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

                                    }
                                    else {
                                        console.log(">>>err sp1");
                                        sp.reqs[reqId].reject(jmsg.body);
                                    }
                                    delete sp.reqs[reqId];
                                }
                                else {  // ams msg
                                    //if (jmsg.type == ".GetClock$Response") {
                                    //}
                                    //else {
                                        sp.emit('ams::data', jmsg);
                                    //}
                                }
                            }
                            catch (err) {
                                console.log(">>>err sp2: ", err.message);
                            }
                        }
                    });

                });
                // config.ams.wsBaseUrl + "/api/messaging/ws/2/brand/" + token;
                client.connect(sp.wsUrl + "/api/messaging/ws/2/brand/" + token);
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
                //delete reqs[reqId];
                if (sp.reqs.hasOwnProperty(reqId)) {
                    delete sp.reqs[reqId];
                    if (sp.connection) {
                        sp.connection.close( WebSocketConnection.CLOSE_REASON_INTERNAL_SERVER_ERROR);// TODO: more natural code
                    }
                }

            }, 30000);
        }catch(err){
            //logger.error('socket-protocol.js.send msggw failed sending message ' + JSON.stringify(body) + ' to ams, message: ' + (err && err.message) + ', stack: ' + (err && err.stack));
            def.reject(err);
        }

        return def.promise;
    }

    close() {
        this.connection.close( WebSocketConnection.CLOSE_REASON_INTERNAL_SERVER_ERROR);// TODO: more natural code
    }

};

module.exports = SocketProtocol;