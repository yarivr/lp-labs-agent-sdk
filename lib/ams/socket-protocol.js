/**
 * Created by yarivr on 7/12/16.
 */
"use strict";

var EventEmitter = require('events');
var util = require('util');
var WebSocketClient = require('websocket').client;
var WebSocketConnection = require('websocket').connection;

var leLogin = require('../le-login');
var AmsEvent = require('./ams-event');

class SocketProtocol extends EventEmitter {
    constructor(brandid, key, secret, amsUrl, adminAreaUrl, leUrl, wsUrl) {
        let sp = this;
        this.brandid = brandid;
        this.login = login;
        this.password = password;
        this,amsUrl = amsUrl;
        this.adminAreaUrl = adminAreaUrl;
        this.leUrl = leUrl;
        this.wsUrl = wsUrl;
        this.connection = null;
        this.reqs = {};
        this.msgId = 0;

        function authorize()   {
            return leLogin.getToken(sp.brandid, sp.key, sp.secret)

        };

        function sendToSocket(msg) {
            var sMsg = JSON.stringify(msg);
            if (sp.connection.connected) {
                sp.connection.sendUTF(sMsg);
            }

            //TDO: close socket if idle for server.wsTtl period
        };

        function genId()  {
            return sp.msgId++;
        }

        connect().then(function() {
           console.log(">>INITIATED");
        });
    };

    connect() {
        authorize(this.key, this.secret).then(function(token) {
            var client = new WebSocketClient();

            client.on('connectFailed', function (error) {
                ret.reject(error);// emit an error
            });

            client.on('connect', function (connection) {
                this.connection = connection;
                keepAlive();
                ret.resolve(sp);// emit success
                connection.on('error', function (error) {
                    // TODO: close connection
                    connection.close( WebSocketConnection.CLOSE_REASON_INTERNAL_SERVER_ERROR);

                });
                connection.on('close', function () {
                    haltKeepAlive();
                });
                connection.on('message', function (message) {
                    this.lastReceiveTime = Date.now();

                    if (message.type === 'utf8') {
                        var jmsg = null;
                        try {
                            jmsg = JSON.parse(message.utf8Data);
                            var reqId = jmsg.reqId;
                            if (reqId && this.reqs[reqId]) {  // msg approval
                                if (jmsg.code && jmsg.code == 200) {
                                    this.reqs[reqId].resolve(jmsg.body);

                                }
                                else {
                                    this.reqs[reqId].reject(jmsg.body);
                                }
                                delete this.reqs[reqId];
                            }
                            else {  // ams msg
                                if (jmsg.type == ".GetClock$Response") {
                                }
                                else {
                                    emit('ams::data', jmsg);
                                }
                            }
                        }
                        catch(err) {}
                    }
                });

            });
            client.connect(this.wsUrl);
        });
    }

    send() {
        let reqId = genId();
        let def = this.reqs[reqId] = Promise.defer();
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
                if (this.reqs.hasOwnProperty(reqId)) {
                    delete reqs[reqId];
                    if (this.connection) {
                        this.connection.close( WebSocketConnection.CLOSE_REASON_INTERNAL_SERVER_ERROR);
                    }
                }

            }, config.ams.reqTimeOut);
        }catch(err){
            logger.error('socket-protocol.js.send msggw failed sending message ' + JSON.stringify(body) + ' to ams, message: ' + (err && err.message) + ', stack: ' + (err && err.stack));
            def.reject(err);
        }

        return def.promise;
    }

};
