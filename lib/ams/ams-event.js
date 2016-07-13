var _ = require('lodash');
var merge = require('merge');

class AmsEvent {
    var getEventType = (msg) => {
        if (msg.event) {
            switch (msg.event.type) {
                case 'AcceptStatusEvent':
                    //returning the type of status in order to separate event handling
                    return msg.event.status;
                case 'ChatStateEvent':
                    //returning the current state in order to separate event handling
                    return msg.event.chatState;
                default:
                    //currently contentEvent
                    return msg.event.type;
            }
        }
        return 'conversationState';
    };

    var getEventBody = (msg) => {
        var body;
        if (msg.event) {
            body = _.reduce(msg.event, function (result, value, key) {
                if (key != 'type') {
                    if(key == 'message'){
                        value = value.trim();
                    }
                    result[key] = value;
                }
                return result;
            }, {});
        } else {
            body = _.reduce(msg && msg.conversationDetails, function (result, value, key) {
                if (key == 'state' || key == 'closeReason') {
                    if (value != null) {
                        result[key] = value;
                    }
                }
                return result;
            }, {});
        }

        return body;
    };

    constructor(amsMsg) {
        //todo: get timestamp from AMS
        this.timestamp = Date.now();
        this.type = "consumer::" + getEventType(amsMsg);
        this.body = getEventBody(amsMsg);
    }

    toString() {
        return "\n---AmsEvent---\n" + JSON.stringify(this) + "\n------\n";
    }

    static eventTypes = {
        ring: 'consumer::ring',
        message: 'consumer::contentEvent',
        accept: 'consumer::accept',
        seen: 'consumer::seen',
        compose: 'consumer::compose',
        close: 'consumer::close'
    };

}

module.exports = AmsEvent;
