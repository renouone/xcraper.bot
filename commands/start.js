import config from '../config.js'

export default (bot) => {
    bot.start(async (ctx) => {
        let message = config.helpMessage;
        ctx.reply(message)
    })
}