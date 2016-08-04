/**
 * Created by yarivr on 8/4/16.
 */

"use strict";

let request = require('request');
let config = require('../conf/config.js');
let services = {};

function LPCSDS() {
    function getAllServices(brandid, services) {
        let _getServices = function(domain, brandid, services) {
            // http://192.168.21.129/csdr/account/qa6573138/service/baseURI.json?version=1.0
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
            if (Object.keys(services).length) {
                Promise.resolve(services);
            }
            else {
                return getAllServices(brandid, ['adminArea', 'liveEngage', 'asyncMessagingEnt']).then(result => {
                    services.adminAreaUrl = 'https://' + result.adminArea + '/hc/s-' + brandid + '/web/m-LP/mlogin/home.jsp';
                    services.liveEngageUrl = 'https://' + result.liveEngage + '/le/account/' + brandid + '/session';
                    services.asyncMessagingEnt = 'wss://' + result.asyncMessagingEnt;
                    return services;
                });
            }
        }
    };

    return api;
}

let api =  LPCSDS();
//api.getServices('qa6573138', ['adminArea', 'liveEngage', 'asyncMessagingEnt'])


module.exports = LPCSDS();