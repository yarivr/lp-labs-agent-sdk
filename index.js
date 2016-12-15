/*
 * @author Yariv Rosenbach
 * @repository https://github.com/yarivr/lp-labs-agent-sdk
 * Copyright 2016 LivePerson Inc - MIT license
 * https://github.com/yarivr/lp-labs-agent-sdk/LICENSE.md
 */
"use strict";

var _ = require('lodash');
let EventEmitter = require('events');
let util = require('util');

let config = require('./conf/conf.json');
let lpCSDS = require('./lib/lp-csds');
let SocketProtocol = require('./lib/ams/socket-protocol');
let GetUserProfile = require('./lib/ams/v2/GetUserProfile');
let GetClock = require('./lib/ams/v2/GetClock');
let SubscribeExConversations = require('./lib/ams/v2/SubscribeExConversations');
let AcceptRing = require('./lib/ams/v2/AcceptRing');
let PublishEvent = require('./lib/ams/v2/PublishEvent');
let TransferToSkill = require('./lib/ams/v2/TransferToSkill');
let ResolveConversation = require('./lib/ams/v2/ResolveConversation');
let QueryMessages = require('./lib/ams/v2/QueryMessages');
let ComposeEvent = require('./lib/ams/v2/ComposeEvent');
let ActiveEvent = require('./lib/ams/v2/ActiveEvent');
let amsEmit =  require('./lib/ams/ams-emit');
let LoginError = require('./lib/errors').LoginError;
let UMSError = require('./lib/errors').UMSError;


class AgentSDK extends EventEmitter { // throws Error, UMSError, LoginError
    constructor(brandid, key, secret, lastUpdateTime) {
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
                    if (err instanceof LoginError) {
                        this.emit('error', err);
                    }
                    else {
                        let errMsg = err && err.message ? err.message : '';
                        this.emit('error', new UMSError(this.brandid, errMsg));
                    }
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
                            amsEmit(data, this);
                        });

                    });
                });
            };

            createSocket();
        }, (err) => {
            //console.log("Error getting csds data");
            this.emit("error", err);
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
    verifyConnection() {
        let getClock = new GetClock();
        return this.sp.send(getClock.getType(), getClock.getRequest());
    }
    queryMessages(convId, maxQuantity, olderThanSequence, newerThanSequence) {
        let queryMessages = new QueryMessages({
            "conversationId": convId,
            "maxQuantity": maxQuantity,
            "olderThanSequence": olderThanSequence,
            "newerThanSequence": newerThanSequence
        });
        return this.sp.send(queryMessages.getType(), queryMessages.getRequest());
    }

    compose(convId) {
        let composeEventReq = new ComposeEvent({convId: convId});
        return this.sp.send(composeEventReq.getType(), composeEventReq.getRequest());
    }

    active(convId) {
        let activeEventReq = new ActiveEvent({convId: convId});
        return this.sp.send(activeEventReq.getType(), activeEventReq.getRequest());
    }

    sendText(convId, message) { // text, hosted file, external-link
        let publishEventReq = new PublishEvent({convId: convId, message: message});
        return this.sp.send(publishEventReq.getType(), publishEventReq.getRequest());
    }

    resolveConversation(convId) {
        let resolveConvReq = new ResolveConversation({conversationId: convId});
        return this.sp.send(resolveConvReq.getType(), resolveConvReq.getRequest());
    }

    transferToSkill(convId, skillId) {
        let transferToSkillReq = new TransferToSkill({conversationId: convId, skillId: skillId, userId: this.userId });
        return this.sp.send(transferToSkillReq.getType(), transferToSkillReq.getRequest());
    }


    // TBC - START
    sendFile() {
    }

    sendLinkFile() {
    }


    resumeConversation() {
    }

    msgAcceptStatus() {

    }

    backToQueue() {
    }

    setAgentState() {
    }

    generateURLForUploadFile() {
    }

    generateURLForDownloadFile() {
    }
    // TBC - END

}

module.exports = AgentSDK;
