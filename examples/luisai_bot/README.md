# LiveEngage Bot with AI
### Initialization
1. npm install
2. Create Luis AI application at: https://www.luis.ai
2.1 get key and appid 
2.2 Create 'greeting' intent which associated with the utterances:
        'Hi', 'Hello', 'Good morning', 'Good evening', 'morning' 
3. In LiveEngage create:
   1) Agent which you will associate with your bot
   2) 'support' skill which will be used as a transfer skill
   3) Agent which will be associated with the support skill
   4) export your skills list in order to get the integer id of the 'support' skill.
4. edit the file botbuilder/dialog.json and set the values of the place older variable (surrounded by '@@')
   
### Running the example
1. run node botty.js
2. connect as a consumer and request for a new conversation.
   the following flow should be initiated:
   1) Bot send: "Hello, I'm botty the bot, how can I help you?"
   2) send as consumer a greeting term
   3) Bot responds with: "Hi, What is your favorate color?"
   4) Send as consumer a color name
   5) 
   
### Next steps
   1) Learn the botbuilder documentation:
      https://docs.botframework.com/en-us/node/builder/guides/examples/
   2) Understand the static configuration (dialog.json) 
      and the dynamic configuration (dialog.js) of the Bot skeleton
   3) Understand the code inside botty.js that combine between static 
      and dynamic configurations of the bot logic.
   4) change the bot to have a more sophisticated logic   
    
#### For Questions, comments
mail to: yarivr@liveperson.com
      
   
   