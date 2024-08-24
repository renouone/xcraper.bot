import 'dotenv/config'
import { Context, Telegraf } from 'telegraf';


// init
const bot = new Telegraf(process.env.TOKEN);

import startCmd from "./commands/start.js"
import twitterCmd from "./commands/twitter.js"
// import scrCmd from "./commands/screenshot.js"
startCmd(bot);
twitterCmd(bot);
// scrCmd(bot);




bot.launch();
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));