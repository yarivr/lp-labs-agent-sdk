/**
 * Created by yarivr on 7/10/16.
 */
"use strict";

let EventEmitter = require('events');
let util = require('util');

let SocketProtocol = require('./lib/ams/socket-protocol');
let SubscribeExConversations = require('./lib/ams/v2/SubscribeExConversations');


class AgentSDK extends EventEmitter { // todo monitor the socket,
    constructor(brandid, key, secret, lastUpdateTime) {
        // init brand-ws, subscribeEx
        // register, receive
        super();
        this.brandid = brandid;
        this.key = key;
        this.secret = secret;
        this.lastUpdateTime = lastUpdateTime;

        this.sp = new SocketProtocol(brandid, key, secret, 'wss://qatrunk.dev.lprnd.net',
                'https://hc1.dev.lprnd.net/hc/s-qa6573138/web/m-LP/mlogin/home.jsp', 'https://qtvr-wap08.dev.lprnd.net/le/account/qa6573138/session');

        this.sp.on('error', err => {
           // TODO: ... reopen ws if
        });

        this.sp.on('ws::connect', () =>  {
            // in case of error close and re-create
            //subscribeExConversations()
            let subscribeExReq = new SubscribeExConversations({brandId: this.brandid, minLastUpdatedTime: this.lastUpdateTime });
            this.sp.send(subscribeExReq.getType(), subscribeExReq.getRequest()).catch((err) => {
                // TODO:
            });

            /*
             Consumer -> Agent
             */
            this.sp.on('ams::data', data => {
                console.log(">>data:", data);
                var amsEvent = new AmsEvent(data);
                this.emit(amsEvent.type, amsEvent.data); // consumer::ring, consumer::msg, consumer::accept, consumer::seen, consumer::compose, consumer::close
                // TODO: update lastUpdateTime
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
let as = new AgentSDK('qa6573138', 'bot@liveperson.com', '12345678', Date.now());
//let as = new AgentSDK('qa6573138', 'bot@liveperson.com', 'zeroplease2014!', Date.now());


module.exports = AgentSDK;
