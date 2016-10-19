/**
 * Created by yarivr on 7/10/16.
 */
"use strict";

var _ = require('lodash');
let EventEmitter = require('events');
let util = require('util');

let config = require('./conf/config');
let lpCSDS = require('./lib/lp-csds');
let SocketProtocol = require('./lib/ams/socket-protocol');
let GetUserProfile = require('./lib/ams/v2/GetUserProfile');
let SubscribeExConversations = require('./lib/ams/v2/SubscribeExConversations');
let AcceptRing = require('./lib/ams/v2/AcceptRing');
let PublishEvent = require('./lib/ams/v2/PublishEvent');
let TransferToSkill = require('./lib/ams/v2/TransferToSkill');
let ResolveConversation = require('./lib/ams/v2/ResolveConversation');
let ComposeEvent = require('./lib/ams/v2/ComposeEvent');
let ActiveEvent = require('./lib/ams/v2/ActiveEvent');
let amsEmit =  require('./lib/ams/ams-emit');


class AgentSDK extends EventEmitter { // todo monitor the socket,
    constructor(brandid, key, secret, lastUpdateTime) {
        // init brand-ws, subscribeEx
        // register, receive
        super();
        lpCSDS.getServices(brandid).then(services => {
            this.amsUrl = services.asyncMessagingEnt;
            this.adminAreaUrl = services.adminAreaUrl;
            this.liveEngageUrl = services.liveEngageUrl;
            this.brandid = brandid;
            this.key = key;
            this.secret = secret;
            this.lastUpdateTime = lastUpdateTime;
            this.userId = undefined;

            let createSocket = () => {
                this.sp = new SocketProtocol(brandid, key, secret, this.amsUrl, this.adminAreaUrl, this.liveEngageUrl);

                this.sp.on('error', err => {
                    // TODO: ... reopen ws if
                });

                let getUid = () => {
                    if (this.userId) {
                        return Promise.resolve(this.userId);
                    }
                    else {
                        return this.sp.send('.ams.userprofile.GetUserProfile', {userId: ""}).then(agentProfile => {
                            this.userId = agentProfile.userId;
                            return this.userId;
                        });
                    }
                };

                this.sp.on('ws::connect', () => {
                    // in case of error close and re-create
                    //subscribeExConversations()
                    let getUserProfileReq
                    getUid().then(userId => {

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
        });
    }

    /*
        API's (Agent -> Consumer)
     */


    acceptRing(ringId) {
        let acceptRingReq = new AcceptRing({brandId: this.brandid, ringId: ringId });
        return this.sp.send(acceptRingReq.getType(), acceptRingReq.getRequest());
    }

    getUserProfile(userId) {
        let userProfileReq = new GetUserProfile({ userId: userId });
        return this.sp.send(userProfileReq.getType(), userProfileReq.getRequest());
    }

    compose(convid) {
        let composeEventReq = new ComposeEvent({convId: convId});
        return this.sp.send(composeEventReq.getType(), composeEventReq.getRequest());
    }

    active(convid) {
        let activeEventReq = new ActiveEvent({convId: convId});
        return this.sp.send(activeEventReq.getType(), activeEventReq.getRequest());
    }

    sendText(convId, message, composeTimeout) { // text, hosted file, external-link
        //let sp = this.sp;
        //let composeEventReq = new ComposeEvent({convId: convId});
        //return this.sp.send(composeEventReq.getType(), composeEventReq.getRequest()).then(() => {
        //    let tmo = composeTimeout ? composeTimeout : 2000;
        //    setTimeout(() => {
        //        let activeEventReq = new ActiveEvent({convId: convId});
        //        return sp.send(activeEventReq.getType(), activeEventReq.getRequest()).then(() => {
        //            let publishEventReq = new PublishEvent({convId: convId, message: message});
        //            return sp.send(publishEventReq.getType(), publishEventReq.getRequest());
        //        });
        //    }, tmo);
        //});
        let publishEventReq = new PublishEvent({convId: convId, message: message});
        return this.sp.send(publishEventReq.getType(), publishEventReq.getRequest());
    }

    sendFile() {

    }

    sendLinkFile() {

    }

    resolveConversation(convId) {
        let resolveConvReq = new ResolveConversation({conversationId: convId});
        return this.sp.send(resolveConvReq.getType(), resolveConvReq.getRequest());
    }

    transferToSkill(convId, skillId) {
        let transferToSkillReq = new TransferToSkill({conversationId: convId, skillId: skillId, userId: this.userId });
        return this.sp.send(transferToSkillReq.getType(), transferToSkillReq.getRequest());
    }


    // TBD - START
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
    // TBD - END

}

module.exports = AgentSDK;
