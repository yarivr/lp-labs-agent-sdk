/*
 * @author Yariv Rosenbach
 * @repository https://github.com/yarivr/lp-labs-agent-sdk
 * Copyright 2016 LivePerson Inc - MIT license
 * https://github.com/yarivr/lp-labs-agent-sdk/LICENSE.md
 */
"use strict";

let AgentSDK = require('../index');
let BRANDID = "BRANDID"; // LiveEngage accountid
let USERNAME = "BOT LE LOGIN NAME"; // LiveEngage agent's login name
let PASSWORD = "BOT LE PASSWORD"; // LiveEngage agent's password
let LAST_EVENT_TIMESTAMP = Date.now(); // The time stamp from which LiveEngage events should be fetched
let TRANSFER_SKILL_ID = -1 // Should be skill id (integer number) which the Bot should transfer a conversation to. -1 is equal to any skill

let as = new AgentSDK(BRANDID, USERNAME, PASSWORD, Date.now());
as.on('consumer::ring', data => {
    as.acceptRing(data.ringId).then(() => {
        console.log(">>> ring accepted");
        as.getUserProfile(data.consumerId).then(
                data => { console.log(">>>Consumer Profile: ", data); });
    }).catch((err) => {
        console.log(err.message);
    });
});

as.on('consumer::contentEvent', data => {
    console.log(">>>GOT Message from consumer: ", data);
    console.log(">>>Echo to consumer");
    if (data.message.indexOf('transfer') == 0) {
        as.transferToSkill(data.convId, TRANSFER_SKILL_ID);
    }
    else {
        as.sendText(data.convId, "[echo]: " + data.message);
    }
});
