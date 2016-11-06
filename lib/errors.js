/*
 * @author Yariv Rosenbach
 * @repository https://github.com/yarivr/lp-labs-agent-sdk
 * Copyright 2016 LivePerson Inc - MIT license
 * https://github.com/yarivr/lp-labs-agent-sdk/LICENSE.md
 */
"use strict";

class Login extends Error {
    constructor(brandid, code , msg, httpCode) {
        var message = `LiveEngage login failed on account ${brandid}. `;
        if (code) {
            message += `Internal code: ${code}. `;
        }
        if (msg) {
            message += `Internal error: ${msg}.  `;
        }
        if (httpCode) {
            message += `httpCode: ${httpCode}.  `;
        }
        message += `Please forward this error to labs-admin-lp@liveperson.com`;
        super(message);
    }


}

class UMS extends Error {
    constructor(brandid, message) {
        super(`A connection error occurred (brandid, internal error): (${brandid}, ${message})`);
    }
}

module.exports = {
    LoginError: Login,
    UMSError: UMS
};
