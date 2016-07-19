/**
 * Created by yarivr on 7/10/16.
 */
"use strict";

var _ = require('lodash');
let EventEmitter = require('events');
let util = require('util');

let SocketProtocol = require('./lib/ams/socket-protocol');
let GetUserProfile = require('./lib/ams/v2/GetUserProfile');
let SubscribeExConversations = require('./lib/ams/v2/SubscribeExConversations');
let AcceptRing = require('./lib/ams/v2/AcceptRing');
let PublishEvent = require('./lib/ams/v2/PublishEvent');
//let AmsEvent = require('./lib/ams/ams-event');
let amsEmit =  require('./lib/ams/ams-emit');


class AgentSDK extends EventEmitter { // todo monitor the socket,
    constructor(brandid, key, secret, lastUpdateTime) {
        // init brand-ws, subscribeEx
        // register, receive
        super();
        this.brandid = brandid;
        this.key = key;
        this.secret = secret;
        this.lastUpdateTime = lastUpdateTime;
        this.userId = undefined;

        let createSocket = () => {
            this.sp = new SocketProtocol(brandid, key, secret, 'wss://qatrunk.dev.lprnd.net',
                'https://hc1.dev.lprnd.net/hc/s-qa6573138/web/m-LP/mlogin/home.jsp', 'https://qtvr-wap08.dev.lprnd.net/le/account/qa6573138/session');

            this.sp.on('error', err => {
                // TODO: ... reopen ws if
            });

            let getUid = () => {
                if (this.userId) {
                    Promise.resolve(this.userId);
                }
                else {
                    return this.sp.send('.ams.userprofile.GetUserProfile', { userId: "" }).then(agentProfile =>  {
                        this.userId = agentProfile.userId;
                        return this.userId;
                    });
                }
            };

            this.sp.on('ws::connect', () =>  {
                // in case of error close and re-create
                //subscribeExConversations()
                let getUserProfileReq
                getUid().then(userId =>  {

                    let subscribeExReq = new SubscribeExConversations({
                        brandId: this.brandid,
                        minLastUpdatedTime: this.lastUpdateTime,
                        userId: userId
                    });
                    this.sp.send(subscribeExReq.getType(), subscribeExReq.getRequest()).catch((err) => {
                        this.sp.close();
                    });

                    /*
                     Consumer -> Agent
                     */
                    this.sp.on('ams::data', data => { // consumer::ring, consumer::msg, consumer::accept, consumer::seen, consumer::compose, consumer::close
                        console.log(">>>GOT From AMS: ", data);
                        amsEmit(data, this);
                    });

                });
            });
        };

        createSocket();
    }

    /*
        API's (Agent -> Consumer)
     */


    acceptRing(ringId) {
        let acceptRingReq = new AcceptRing({brandId: this.brandid, ringId: ringId });
        return this.sp.send(acceptRingReq.getType(), acceptRingReq.getRequest()).catch((err) => {
            console.log(">>>Failed to accept ring");
        });
    }

    getUserProfile() {

    }

    sendText(convId, message) { // text, hosted file, external-link
        let publishEventReq = new PublishEvent({convId: convId, message: message});
        return this.sp.send(publishEventReq.getType(), publishEventReq.getRequest()).catch((err) => {
            console.log(">>>Failed to echo message");
        });
    }

    sendFile() {

    }

    sendLinkFile() {

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
as.on('consumer::ring', (data) => {
    console.log(">>>CONSUMER Ringing: ", data);
    as.acceptRing(data.ringId);

});

as.on('consumer::contentEvent', (data) => {
    console.log(">>>GOT Message from consumer: ", data);
    console.log(">>>Echo to consumer");
    as.sendText(data.convId, "[echo]: " + data.message)
});

//let as = new AgentSDK('qa6573138', 'bot@liveperson.com', 'zeroplease2014!', Date.now());


module.exports = AgentSDK;
