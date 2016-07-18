"use strict";

var _ = require('lodash');
//var merge = require('merge');
const eventTypes = {
    ring: 'consumer::ring',
    message: 'consumer::contentEvent',
    accept: 'consumer::accept',
    seen: 'consumer::seen',
    compose: 'consumer::compose',
    close: 'consumer::close'
}

class AmsEvent {

    constructor(amsMsg) {
        let getEventType = msg => {
            if (msg.type) {
                switch (msg.type) {
                    case '.ams.routing.RingUpdated':
                        return eventTypes.ring;
                    case '.ams.ms.OnlineEventDistribution':
                        if (msg.body.originatorId.indexOf('.') == -1 && msg.body.event.type == 'ContentEvent') {
                            return eventTypes.message;
                        }
                    case 'UPSERT':
                        if (_.has(msg, 'result.conversationDetails') &&
                            msg.result.conversationDetails && msg.result.conversationDetails.closeReason == 'CONSUMER')
                            return eventTypes.close;
                    default:
                        return '';

                    //case 'AcceptStatusEvent':
                    //    //returning the type of status in order to separate event handling
                    //    return msg.event.status;
                    //case 'ChatStateEvent':
                    //    //returning the current state in order to separate event handling
                    //    return msg.event.chatState;
                    //default:
                    //    //currently contentEvent
                    //    return msg.event.type;
                }
            }

            return '';
        };

        let getEventBody = (msg) => {
            if (msg.body)
                return msg.body;

            if (msg.result)
                return msg.result;

            return {};
        };

        //todo: get timestamp from AMS
        this.timestamp = Date.now();
        this.type = getEventType(amsMsg);
        this.data = getEventBody(amsMsg);
    }

    toString() {
        return "\n---AmsEvent---\n" + JSON.stringify(this) + "\n------\n";
    }

    getType() {
        return this.type;
    }

    getData() {
        return this.data;
    }

    static eventTypes() {
        return eventTypes;
    };

}

module.exports = AmsEvent;
