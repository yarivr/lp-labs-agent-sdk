/**
 * Created by yarivr on 7/10/16.
 */
"use strict";

var EventEmitter = require('events');
var util = require('util');

var SocketProtocol = require('./lib/ams/socket-protocol');


class AgentSDK extends EventEmitter {
    constructor(brandid, key, secret, lastUpdateTime) {
        // init brand-ws, subscribeEx
        // register, receive
        this.brandid = brandid;
        this.key = key;
        this.secret = secret;

        this.sp = new SocketProtocol(brandid, key, secret, amsUrl, adminAreaUrl, leUrl);
        /*
            Consumer -> Agent
         */
        sp.on('ams::data', function(err, data) {
            var amsEvent = new AmsEvent(data);
            this.emit(amsEvent.type, amsEvent.data); // consumer::ring, consumer::msg, consumer::accept, consumer::seen, consumer::compose, consumer::close
        });
    }

    /*
        API's (Agent -> Consumer)
     */
    subscribeExConversations() {

    }

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

    updateTTR() {

    }

    backToQueue() {

    }

    setAgentState() {

    }


    generateURLForUploadFile() {

    }

    generateURLForDownloadFile() {

    }

}

let as = new AgentSDK('qa6573138', 'bot@liveperson.com', '12345678', Date.now());


module.exports = AgentSDK;
