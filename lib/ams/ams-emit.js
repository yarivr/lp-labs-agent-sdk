/*
 * @author Yariv Rosenbach
 * @repository https://github.com/yarivr/lp-labs-agent-sdk
 * Copyright 2016 LivePerson Inc - MIT license
 * https://github.com/yarivr/lp-labs-agent-sdk/LICENSE.md
 */
"use strict";

var _ = require('lodash');

const eventTypes = {
    ring: 'consumer::ring',
    message: 'consumer::contentEvent',
    firstMessage: 'consumer::firstContentEvent',
    accept: 'consumer::accept',
    seen: 'consumer::seen',
    compose: 'consumer::compose',
    resolve: 'consumer::resolve'
};

var em = function(amsMsg, emitter) {
    if (amsMsg.type == '.ams.routing.RingUpdated' && amsMsg.body.ringState === 'WAITING') {
        //console.log(">>>>>emitting: ", eventTypes.ring);
        emitter.emit(eventTypes.ring, {
            ringId: amsMsg.body.ringId,
            ringState: amsMsg.body.ringState,
            convId: amsMsg.body.convId,
            consumerId: amsMsg.body.consumerId,
            skillId: amsMsg.body.skillId
        });
    }
    else if (amsMsg.type ==  '.ams.ms.OnlineEventDistribution' &&
             amsMsg.body.originatorId.indexOf('.') == -1 && amsMsg.body.event.type == 'ContentEvent') {
        //console.log(">>>>>emitting: ", eventTypes.message);
        emitter.emit(eventTypes.message,  {
            convId: amsMsg.body.dialogId,
            sequence: amsMsg.body.sequence,
            consumerId: amsMsg.body.originatorId,
            serverTimestamp: amsMsg.body.serverTimestamp,
            type: amsMsg.body.event.type,
            message: amsMsg.body.event.message,
            contentType: amsMsg.body.event.contentType
        });
    }
    else if (amsMsg.type == '.ams.aam.ExConversationChangeNotification' && _.has(amsMsg, 'body.changes')) {
        amsMsg.body.changes.forEach(change => {
            //console.log(">>> handle change (from list)", change);
            if (_.has(change, 'result.conversationDetails') &&
                change.result.conversationDetails && change.result.conversationDetails.closeReason == 'CONSUMER') {
                //console.log(">>>>>emitting: ", eventTypes.resolve);
                emitter.emit(eventTypes.resolve, {convId: change.result.conversationDetails.convId});
            }
        });
        if(amsMsg.body.changes.length === 1) {
            var change = amsMsg.body.changes[0];
            var lastContentEventNotification = change.type === "UPSERT" && change.result && change.result.lastContentEventNotification;
            if(lastContentEventNotification && lastContentEventNotification.sequence === 0) {
                emitter.emit(eventTypes.firstMessage,  {
                    convId: lastContentEventNotification.dialogId,
                    sequence: lastContentEventNotification.sequence,
                    consumerId: lastContentEventNotification.originatorId,
                    serverTimestamp: lastContentEventNotification.serverTimestamp,
                    type: lastContentEventNotification.event.type,
                    message: lastContentEventNotification.event.message,
                    contentType: lastContentEventNotification.event.contentType
                });
            }

        }
    }

};

module.exports = em;
