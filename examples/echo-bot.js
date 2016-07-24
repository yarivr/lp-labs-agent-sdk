/**
 * Created by yarivr on 7/24/16.
 */
"use strict";

let config = require('../conf/config');
let AgentSDK = require('../index');

/*let as = new AgentSDK('qa6573138', 'bot@liveperson.com', '12345678', Date.now(), 'wss://qatrunk.dev.lprnd.net',
 'https://hc1.dev.lprnd.net/hc/s-qa6573138/web/m-LP/mlogin/home.jsp', 'https://qtvr-wap08.dev.lprnd.net/le/account/qa6573138/session');*/
let as = new AgentSDK('qa6573138', 'bot@liveperson.com', '12345678', Date.now(), config.ams.domain,
    config.login.tokenUrl, config.login.loginUrl);
as.on('consumer::ring', data => {
    console.log(">>>CONSUMER Ringing: ", data);
    as.acceptRing(data.ringId).then(() => {
        console.log(">>> ring accepted");
        as.getUserProfile(data.consumerId).then(
                data => { console.log(">>>Consumer Profile: ", data); });
    }).catch((err) => {
        console.log(err.message);
    });

    /*    as.getUserProfile(data.consumerId).then(
     data => { console.log(">>>Consumer Profile: ", data); })});*/
});

as.on('consumer::contentEvent', data => {
    console.log(">>>GOT Message from consumer: ", data);
    console.log(">>>Echo to consumer");
    as.sendText(data.convId, "[echo]: " + data.message);
});
