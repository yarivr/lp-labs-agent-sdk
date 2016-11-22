lp-labs-agent-sdk
=================
Easily create LiveEngage messaging Bot.
This is an initial version which will be extended soon. 

Quick Start
-----------
npm install agent-sdk --save

1. Edit a copy of the example examples/getting_started/echo-bot.js
2. Create a LiveEngage account with messaging enabled.
3. Set BRANDID with your LiveEngage account id
4. Set USERNAME with an agent name associated with your BOT.
5. Set PASSWORD as the password of the agent associated with your BOT.
6. run echo-bot.js:
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


# Consumer (to agent) Events/Messages (more to come soon)
### consumer::ring
Consumer is requesting for a conversation

Sample Data:

    {
            "ringId": "WAITING",
            "ringState": "646f0078-bb1f-4faf-8353-15be257e4f8f",
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


# Agent APIs Methods (Promise based, more to come soon)
### acceptRing
Accept a consumer request for a conversation

Parameters:

        ringId 

Return (Promise) Value:

    Empty Promise

### getUserProfile
Get the profile of a consumer

Parameters:

    userId

Return (Promise) Value:
    
    {
        "firstName":"user1",
        "lastName":"last1",
        "userId":"63d22d42-354c-44b2-b351-3f4e6454c3ef",
        "avatarUrl":"avatarUrl",
        "role":null,
        "backgndImgUri":"backgndImgUri",
        "description":"auto description",
        "privateData":{
            "mobileNum":"0",
            "mail":"",
            "pushNotificationData":{
            "serviceName":"",
            "certName":"",
            "token":""
        }
    }
    
### compose
Send a compose notification

Parameters:

    convId
    
Return (Promise) Value:

    Empty Promise
        
### active
Send an online notification

Parameters:

    convId
    
Return (Promise) Value:

    Empty Promise
     
### sendText
Send text message
    
Parameters:

    convId
    message
           
Return (Promise) Value:

    Empty Promise           
  
### resolveConversation
Resolve (close) conversation
 
Parameters:

    convId 
    
Return (Promise) Value:

    Empty Promise    
    
# Error events
### Login
Bot (LiveEngage agent) Login failure 

### UMS
A UMS API or network error 


# More Advanced Bot Example
Under the directory examples/luisai_bot, there is more advanced example based on Microsoft's:
1. botbuilder framework 
2. Luis AI

In the file README.md you will find a useful information for running this example.

# Important issues
1. It's important to register to the sdk errors.
2. A LoginError is triggered in case that the bot failed to login to LiveEngage.
   In case that the LoginError is due to "password expired", a new password should
   be set in LiveEngage and used while initiating an agent-sdk instance.
3. In order to use transferToSkill methods a valid skill id should be used.  
   The list of skill ids can be obtained by a csv export inside the LiveEngage console (users->skills) 

# Support
yarivr@liveperson.com