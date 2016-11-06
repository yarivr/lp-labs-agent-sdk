/*
 * @author Yariv Rosenbach
 * @repository https://github.com/yarivr/lp-labs-agent-sdk
 * Copyright 2016 LivePerson Inc - MIT license
 * https://github.com/yarivr/lp-labs-agent-sdk/LICENSE.md
 */
"use strict";

let config = require('../conf/conf.json');
let FormData = require('form-data');
let _ = require('lodash');
let request = require('request');
let url = require('url');
let LoginError = require('./errors').LoginError;

function LeLogin() {

    function getOTK(brandid, form, adminAreaUrl){
        if (_.isUndefined(adminAreaUrl)) {
            return Promise.reject(new LoginError(brandid, undefined, "undefined adminAreaUrl", undefined));
        }

        let def = Promise.defer();
        form.submit(adminAreaUrl, function (err, res) {
            let successOTK = !err && res && res.statusCode == 302;
            let redirectUrl = (res && res.headers && res.headers.location) || "none";
            redirectUrl = decodeURIComponent(redirectUrl);
            let queryData = url.parse(redirectUrl, true).query;

            let otkErrCode = undefined;
            let otkErrMsg = undefined;
            let httpCode = undefined;

            let errorMessage = '';
            if (successOTK && queryData.error) {
                var errorOTKMap = {
                    0: "Please try again.",
                    1: "login failed reason unknown",
                    6: "admin login restricted",
                    7: "old admin login restricted",
                    9: "password expired",
                    10: "session expired since another session is already taking place",
                    11: "account is disabled",
                    12: "account is expired",
                    13: "session is expired",
                    20: "lpa restricted",
                    100: "Please try again.",
                    110: "exceeded your concurrent limit"
                };
                if (queryData.error === "1" || queryData.error === "6" || queryData.error === "7" || queryData.error === "11" || queryData.error === "12" || queryData.error === "20") {
                    otkErrMsg = errorOTKMap[queryData.error];
                    otkErrCode = queryData.error;
                }
                successOTK = false;
            } else if (successOTK && redirectUrl.indexOf("/#") === -1) {
                successOTK = false;
            }

            if (successOTK) {
                var otk = redirectUrl.substring(redirectUrl.lastIndexOf("/#,") + 3);
                def.resolve(otk);
            } else {
                httpCode = res && res.statusCode ? res.statusCode : undefined;
                def.reject(new LoginError(brandid, otkErrCode , otkErrMsg, httpCode));
            }
        });

        return def.promise;
    }

    function loginToLiveEngage(brandid, otk, liveEngageUrl){
        if (_.isUndefined(liveEngageUrl)) {
            return Promise.reject(new LoginError(brandid, undefined, "undefined liveEngageUrl", undefined));
        }

        let def = Promise.defer();

        let options = {
            url: liveEngageUrl,
            method: 'POST',
            //timeout: 10000,
            json: {
                "config": {},
                "accountId": brandid,
                "otk": otk
            }
        };

        request(options, function (error, response, body) {
            let success = !error && response && response.body && response.body.glob;
            if (success) {
                def.resolve(response.body.glob);
            }

            let message = "";
            let expired = response && response.statusCode === 400;
            let isTimeout = error && error.code === "ETIMEDOUT";
            let noResponse = !response; //helper.isNotValue(response);
            if (expired) {
                message = "Failed to login to liveEngage with unknown error, probably siteId expired, statusMessage: " + response.statusMessage;
            } else if (isTimeout) {
                message = "Failed to login to liveEngage with timeout error";
            } else if (noResponse) {
                message = "LiveEngage login service is unavailable";
            } else {
                message = "Failed to login to liveEngage:" + response.statusMessage;
            }
            let errCode = error && error.code ? error.code : undefined;
            let httpCode = response && response.statusCode ? response.statusCode : undefined
            def.reject(new LoginError(brandid, errCode, message, httpCode));
        });

        return def.promise;
    }

    var api = {
        getToken: function(brandid, user, pass, adminAreaUrl, liveEngageUrl) {
            let def = Promise.defer();

            let form = new FormData();
            form.append('site', brandid);
            form.append('user', user);  //agent manager login credentials
            form.append('pass', pass);
            form.append('stId', user);
            form.append('usrId', user);
            form.append('Inf', '2');
            form.append('addUsrPrm', 'no');
            form.append('lang', 'en-US');
            form.append('lpservice', 'liveEngage');
            form.append('servicepath', 'a/~~accountid~~/#,~~ssokey~~');

            getOTK(brandid, form, adminAreaUrl).then(function(otk){
                loginToLiveEngage(brandid, otk, liveEngageUrl).then(function(glob){
                    def.resolve(glob);
                }).catch(function(error){
                    def.reject(new AgentManagerLogin(brandid));
                });
            }).catch(function(error){
                def.reject(new AgentManagerLogin(brandid));
            });

            return def.promise;
        }
    };

    return api;
}

module.exports = LeLogin();
