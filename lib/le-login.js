// jshint ignore: start
/**
 * Created by yarivr on 3/10/16.
 * We want to get a token in order to access UMS with the agentmanager special user which we use as brandws to UMS
 * we have that WS temporarily until the UMS opens an API were we can listen to events without the need to login
 * as a real agent manager.  right now the convention is to have an agent manager with username msggw@liveperson.com
 * with zero chats enabled.  We have to first get otk by logging into le then we take that otk and covert to token
 * (we simulate a new session to get the token) then with that session we communicate with UMS and create the WS.
 * There is here an setTimeout interval which makes sure that all docs with ws:: have a UMS ws connection open. (in
 * @link brand-message-handler.js
 */
"use strict";

var config = require('../conf/config.js');
//var logger = require('../Log');
var FormData = require('form-data');
var fs = require('fs');
var _ = require('lodash');
//var helper = require('./Helper');
var request = require('request');
//var krypton = require('krypton');
var url = require('url');
//var lpServiceLocator = require('./lp-service-locator');
var AgentLogin = require('./errors').AgentLogin;
//var db = require('../db-manager');


/**
 * @class {LeLogin}
 * @returns {{getWsUrl: api.getWsUrl, getToken: api.getToken}}
 * @constructor
 */
function LeLogin() { // TODO: make singleton

    function getOTK(brandid, form, adminAreaUrl){
        var def = Promise.defer();

        if (_.isUndefined(adminAreaUrl)) {
            def.reject(new Error("sid:" + brandid + ", exited function getToken with undefined for adminAreaUrl"));
        }

        //get otk
        form.submit(adminAreaUrl, function (err, res) {
            var successOTK = !err && res && res.statusCode == 302;
            var redirectUrl = (res && res.headers && res.headers.location) || "none";
            redirectUrl = decodeURIComponent(redirectUrl);
            var queryData = url.parse(redirectUrl, true).query;
            if (successOTK && queryData.error) {
                var errorOTKMap = {
                    0: "Please try again.",
                    1: "login failed reason unknown",
                    6: "admin login restricted",
                    7: "old admin login restricted",
                    10: "session expired since another session is already taking place",
                    11: "account is disabled",
                    12: "account is expired",
                    13: "session is expired",
                    20: "lpa restricted",
                    100: "Please try again.",
                    110: "exceeded your concurrent limit"
                };
                if (queryData.error === "1" || queryData.error === "6" || queryData.error === "7" || queryData.error === "11" || queryData.error === "12" || queryData.error === "20") {
                    //db.filterBrandWS(brandid, config.server.scheduler.agentManagerLoginMax);
                }
                //logger.error("sid:" + brandid + ", Failed Agent Manager login, failed obtaining otk with appserver message: " + errorOTKMap[queryData.error]);
                successOTK = false;
            } else if (successOTK && redirectUrl.indexOf("/#") === -1) {
                //logger.error("sid:" + brandid + ", Failed Agent Manager login, failed obtaining otk with message, redirectUrl: " + redirectUrl);
                successOTK = false;
            }

            if (successOTK) {
                var otk = redirectUrl.substring(redirectUrl.lastIndexOf("/#,") + 3);
                //logger.debug("sid:" + brandid + ", Successfully got otk:" + otk);
                return def.resolve(otk);
            } else {
                //200OK means Server is Busy. Please try again
                //  logger.error("sid:" + brandid + ", Failed to get otk for agent manager with status code:" + (res && res.statusCode) + ", statusMessage: " + (res && res.statusMessage));
                return def.reject(new Error("sid:" + brandid + ", Failed to get otk for agent manager with status code:" + (res && res.statusCode) + ", statusMessage: " + (res && res.statusMessage)));
            }
        });

        return def.promise;
    }



    function loginToLiveEngage(brandid, otk, liveEngageUrl){
        var def = Promise.defer();

        if (_.isUndefined(liveEngageUrl)) {
            var message = "sid:" + brandid + ", exited function getToken with undefined for liveEngageUrl";
            // logger.debug(message);
            return def.reject(new Error(message));
        }

        var options = {
            url: liveEngageUrl,
            method: 'POST',
            //timeout: 30,
            //headers: headers,
            json: {
                "config": {},
                "accountId": brandid,
                "otk": otk
            }
        };

        //login agent manager
        request(options, function (error, response, body) {
            var success = !error && response && response.body && response.body.glob;
            if (success) {
                    //   logger.debug("sid:" + brandid + ", Successfully logged in to liveEngage with Agent Manager.");
                def.resolve(response.body.glob);
                return def.promise;
            }

            var message = "";
            var expired = response && response.statusCode === 400;
            var isTimeout = error && error.code === "ETIMEDOUT";
            var noResponse = !response; //helper.isNotValue(response);
            if (expired) {
                message = "sid:" + brandid + ", Failed to login to liveEngage with agent manager unknown error, probably siteId expired, status code:" + response.statusCode + ", statusMessage: " + response.statusMessage;
            } else if (isTimeout) {
                message = "sid:" + brandid + ", Failed to login to liveEngage with agent manager with timeout";
            } else if (noResponse) {
                message = "sid:" + brandid + ", Failed to login to liveEngage with agent manager with NO response.";
            } else {
                message = "sid:" + brandid + ", Failed to login to liveEngage with agent manager with status code: " + response.statusCode + " , and status message: " + response.statusMessage;
            }
            //  logger.error(message);
            def.reject(new Error(message));
        });

        return def.promise;
    }



    var api = {
        //getWsUrl: function(token) {
        //    return "wss://" + config.ams.domain + "/api/messaging/ws/2/brand/" + token;
        //},
        getToken: function(brandid, user, pass, adminAreaUrl, liveEngageUrl) {
           // logger.debug("sid:" + brandid + ", enter function getToken");
            var def = Promise.defer();

            var _user = user;//krypton.decrypt(user);
            var _pass = pass; //krypton.decrypt(pass);
            var form = new FormData();
            form.append('site', brandid);
            form.append('user', _user);  //agent manager login credentials
            form.append('pass', _pass);
            form.append('stId', _user);
            form.append('usrId', _user);
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
