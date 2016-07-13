/**
 * Created by yarivr on 7/10/16.
 */
"use strict";

var EventEmitter = require('events');
var util = require('util');

var SocketProtocol = require('./lib/ams/socket-protocol');


class AgentSDK extends EventEmitter { // todo monitor the socket
    constructor(brandid, key, secret, lastUpdateTime) {
        // init brand-ws, subscribeEx
        // register, receive
        super();
        this.brandid = brandid;
        this.key = key;
        this.secret = secret;

        this.sp = new SocketProtocol(brandid, key, secret, 'wss://qatrunk.dev.lprnd.net',
                'https://hc/s-qa51953286/web/m-LP/mlogin/home.jsp', 'https://qtvr-wap08.dev.lprnd.net/le/account/qa51953286/session');

        this.sp.on('error', err => {
           // TODO: ...
        });

        this.sp.on('ws::connect', () =>  {
            // in case of error close and re-create
            //subscribeExConversations()
            /*
             Consumer -> Agent
             */
            this.sp.on('ams::data', data => {
                var amsEvent = new AmsEvent(data);
                this.emit(amsEvent.type, amsEvent.data); // consumer::ring, consumer::msg, consumer::accept, consumer::seen, consumer::compose, consumer::close
            });

        });


    }

    /*
        API's (Agent -> Consumer)
     */


    acceptRing() {

    }

    getUserProfile() {

    }

    publishEvent() { // text, hosted file, external-link

    }


    closeConversation() {

    }

    resumeConversation() {

    }

    msgAcceptStatus() {

    }

    //updateTTR() {
    //
    //}

    backToQueue() {

    }

    setAgentState() {

    }


    generateURLForUploadFile() {

    }

    generateURLForDownloadFile() {

    }

}
/// https://hc/s-qa51953286/web/m-LP/mlogin/home.jsp
//  https://qtvr-wap08.dev.lprnd.net/le/account/qa51953286/session
let as = new AgentSDK('qa51953286', 'tester@lp.com', '12345678', Date.now());


module.exports = AgentSDK;
