labs-agent-sdk
============
Easily create LiveEngage messaging Bot 

Quick Start
-----------
npm install labs-agent-sdk --save

1. Edit a copy of the example examples/getting_started/echo-bot.js
2. Set BRANDID with your LiveEngage account id
3. Set USERNAME with an agent name associated with your BOT.
4. Set PASSWORD as the password of the agent associated with your BOT.
5. run echo-bot.js:
    node echo-bot.js

Getting Started
---------------
Overview
-------------
The agent-sdk is built to wrap the agent subset protocol for our UMS service.<br/>
The sdk is divided to asynchronous events and prmoised based API .<br/>
# Configuration
    let AgentSDK = require('agent-sdk');

    /*
        brandid: LiveEngage accountid
        username: LiveEngage agent's login name
        password: LiveEngage agent's password
        timestamp: The time stamp from which LiveEngage events should be fetched
     */
     let as = new AgentSDK(brandid, username, password, timestamp);


# Events/Messages (more to come soon)
### consumer::ring
Consumer is requesting for a conversation

Sample Data:

    {
            "ringId": "WAITING",
            "ringState": amsMsg.body.ringState,
            "convId": "684fdcb0-bbf5-44ad-a39d-fcae7919d959",
            "consumerId: "98097e05-f4ab-48be-b0ee-c116edcb6f69",
            "skillId": "736937610"
    }

### consumer::contentEvent
Consumer message 

Sample Data:
    
    {
            "convId": "684fdcb0-bbf5-44ad-a39d-fcae7919d959",
            "sequence":12,
            "consumerId": "98097e05-f4ab-48be-b0ee-c116edcb6f69",
            "serverTimestamp": 1438499478874,
            "type": "ContentEvent",
            "message": "Hi there!!!",
            "contentType": "text/plain"
    }

### consumer::resolve
Consumer has resolved (closed) the conversation

Sample Data:
    
    {
            "convId": "684fdcb0-bbf5-44ad-a39d-fcae7919d959"
    }


# Methods (Promise based, more to come soon)
### acceptRing
Parameters:

        ringId 

Return (Promise) Value:

    Empty Promise

### getUserProfile(userId)

# Exceptions

# Support
yarivr@liveperson.com