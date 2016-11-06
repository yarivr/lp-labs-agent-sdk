/*
 * @author Yariv Rosenbach
 * @repository https://github.com/yarivr/lp-labs-agent-sdk
 * Copyright 2016 LivePerson Inc - MIT license
 * https://github.com/yarivr/lp-labs-agent-sdk/LICENSE.md
 */
"use strict";

let request = require('request');
let config = require('../conf/conf.json');
let services = new Map();

function LPCSDS() {
    function getAllServices(brandid, services) {
        let _getServices = function(domain, brandid, services) {
            let defer = Promise.defer();
            let options = {
                url: 'http://' + domain + '/csdr/account/' + brandid + '/service/baseURI.json?version=1.0',
                method: 'GET'
            };
            request(options, function (error, response, body) {
                if (error) {
                    defer.reject();
                }
                else {
                    try {
                        let jresult = JSON.parse(response.body);
                        if (!jresult.baseURIs || !jresult.baseURIs.length) {
                            defer.reject();
                        }
                        else if (jresult.baseURIs.length > 0) {
                            let result = {};
                            let baseURIs = jresult.baseURIs;
                            baseURIs.forEach((baseURI) => {
                                if (services.indexOf(baseURI.service) > -1) {
                                    result[baseURI.service] = baseURI.baseURI;
                                }
                            });
                            defer.resolve(result);
                        }
                    }
                    catch(e) {
                        defer.reject();
                    }
                }

            });

            return defer.promise;
        }

        return _getServices(config.csds.prodDomain, brandid, services).catch(() => {
            return  _getServices(config.csds.devDomain, brandid, services);
        });
    }

    let api = {
        getServices: function(brandid) {
            if (services.has(brandid)) {
                Promise.resolve(services.get(brandid));
            }
            else {
                return getAllServices(brandid, ['adminArea', 'liveEngage', 'asyncMessagingEnt']).then(result => {
                    let brandServices = {
                        adminAreaUrl: 'https://' + result.adminArea + '/hc/s-' + brandid + '/web/m-LP/mlogin/home.jsp',
                        liveEngageUrl: 'https://' + result.liveEngage + '/le/account/' + brandid + '/session',
                        asyncMessagingEnt: 'wss://' + result.asyncMessagingEnt
                    }
                    services.set(brandid, brandServices);
                    setTimeout(()=> {
                        services.delete(brandid);
                    }, config.csds.ttl);
                    return brandServices;
                });
            }
        }
    };

    return api;
}

let api =  LPCSDS();

module.exports = LPCSDS();