/**
 * Created by yarivr on 7/18/16.
 */
"use strict";

var _ = require('lodash');

const eventTypes = {
    ring: 'consumer::ring',
    message: 'consumer::contentEvent',
    accept: 'consumer::accept',
    seen: 'consumer::seen',
    compose: 'consumer::compose',
    resolve: 'consumer::resolve'
};

var em = function(amsMsg, emitter) {
    if (amsMsg.type == '.ams.routing.RingUpdated') {
        emitter.emit(eventTypes.ring, {
            ringId: amsMsg.body.ringId,
            convId: amsMsg.body.convId,
            consumerId: amsMsg.body.consumerId,
            skillId: amsMsg.body.skillId
        });
    }
    else if (amsMsg.type ==  '.ams.ms.OnlineEventDistribution' &&
             amsMsg.body.originatorId.indexOf('.') == -1 && amsMsg.body.event.type == 'ContentEvent') {
        emitter.emit(eventTypes.message,  {
            convId: amsMsg.body.event.dialogId,
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
            console.log(">>> handle change (from list)", change);
            if (_.has(change, 'result.conversationDetails') &&
                change.result.conversationDetails && change.result.conversationDetails.closeReason == 'CONSUMER') {
                emitter.emit(eventTypes.resolve, {convId: change.result.conversationDetails.convId});
            }
        });
    }

};

module.exports = em;
