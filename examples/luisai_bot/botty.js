/**
 * Created by yarivr on 10/30/16.
 */
"use strict";

var merge = require('merge');
let _ = require('lodash');
let Handlebars = require('handlebars');
let recognizerFactory = require('./recognizer-factory');
let builder = require('botbuilder');
let LivePersonConnector = require('./LivePersonConnector');
let log = require('winston');

let staticDialog = require('./botbuilder/dialog.json');
let dynamicDialog = './botbuilder/dialog.js';


class BotManager  {
    constructor() {
        this.bots = {};

        let _handleAccept = (acceptEvent, actions) => {
            for (let i = 0; i < actions.length; i++) {
                let action = actions[i];
                if (action.action == "sendText") {
                    let template = Handlebars.compile(action.val);
                    let message = template(acceptEvent.consumerProfile);
                    log.debug('send to consumer (brandid, convid, text): ' + '(' +  acceptEvent.brandId + ', ' + acceptEvent.convId + ', ' + message + ')');
                    acceptEvent.consumerApi.sendText(acceptEvent.convId, message);
                }
                else if (action.action == "transferToSkill") {
                    log.debug('transfer consumer (brandid, convid, target skillid): ' + acceptEvent.brandId + ', ' + acceptEvent.convId + ', ' + action.val + ')');
                    acceptEvent.consumerApi.transferToSkill(acceptEvent.convId, action.val);
                }
            }
        }

        let handleAccept = (conf, acceptEvent) => {
            let brandId = acceptEvent.brandId;
            let skillId = acceptEvent.skillId;
            let acceptActionsDynamic = require(dynamicDialog).events.accept[skillId];
            if (acceptActionsDynamic) {
                let actions = _.map(acceptActionsDynamic, f => {
                    return f();
                });
                _handleAccept(acceptEvent, actions);
                return;
            }

            // find Static Model
            let acceptActionsStatic = conf.static_model.events.accept;
            let actions = acceptActionsStatic.hasOwnProperty(skillId) ? acceptActionsStatic[skillId].actions : acceptActionsStatic[skillId]['-1'].actions;
            if (actions) {
                _handleAccept(acceptEvent, actions);
            }
        };

        let account = staticDialog;
        log.info("Initializing bot ...");
        _.forOwn(staticDialog.static_model.intents, function(intent) {
            intent.actions.forEach(function compileTemplates(action) {
                if(action.action == "sendText" && action.val.indexOf('{{') > -1 &&  action.val.indexOf('}}') > 0) {
                    action.template = Handlebars.compile(action.val);
                }
            });
        });


        let lp = new LivePersonConnector({
            brandid: account.brandid,
            key: account.key,
            secret: account.secret,
            timestamp: Date.now(),
            intentMap: account.static_model,
            acceptCB: function(data) {
                db.getBot(data.brandId).then(function(bot) {
                    let skillId = data.skillId;
                    handleAccept(bot, data);
                });
            }
        });

        let recognizerSettings = account.recognizer.settings;
        let bot = new builder.UniversalBot(lp);
        let recognizer = recognizerFactory.get('luisai', recognizerSettings);
        let intents = new builder.IntentDialog({recognizers: [recognizer]});
        bot.dialog('/', intents);

        intents.onDefault((session, args, next) => {
            let conf = this.bots[session.message.address.brandid].conf
            let intentMap = conf.static_model.intents;

            if (!args.intent && bot.lib.dialogs.hasOwnProperty('/None')) {
                session.replaceDialog("/None", {});
                return;
            }

            var intent = args.intent && intentMap[args.intent] && intentMap[args.intent].actions ? args.intent : 'None';

            let entities = args.entities;
            let entitiesMap = {};

            // TODO: merge entities map with consumer profile
            if (entities && entities.length) {
                entities.forEach(el => {
                    entitiesMap[el.type] = el.entity;
                });
            }

            if (session.message.address.user.profile) {
                entitiesMap = merge(entitiesMap, session.message.address.user.profile);
            }

            let actions = intentMap[intent].actions;
            if (actions) {
                for (let i = 0; i < actions.length; i++) {
                    let action = _.clone(actions[i]);

                    if (action.template) {
                        action.val = action.template(entitiesMap);
                    }
                    if (i < actions.length - 1) {
                        session.send(action);
                    }
                    else {
                        session.endDialog(action);
                    }
                }
            }
        });

        let botScript = require(dynamicDialog);
        _.forOwn(botScript.dialogs || {}, function(dialog, dialogName) {
            bot.dialog("/"+dialogName, dialog);
        });
        _.forOwn(botScript.intents || {}, function(intent,intentName) {
            intents.matches(intentName, intent);
        });

        this.bots[account.brandid] = {bot: bot, conf: account };
    }



}
let botManager = new BotManager();

module.exports = botManager;