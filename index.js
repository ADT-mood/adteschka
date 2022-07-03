import {session, Telegraf} from 'telegraf'
import {Scenes} from 'telegraf'
import Config from './config.js'
import dotenv from 'dotenv'

import Shava from './models/Shava.js'

dotenv.config()

const stage = new Scenes.Stage()
stage.register(Shava.scene)

const bot = new Telegraf(process.env.TOKEN)
bot.telegram.setMyCommands(Config.commands)
bot.use(session())
bot.use(stage.middleware())

bot.command('start', ctx => {
    ctx.reply('start')
    console.log('strat')
})

bot.command('shava', ctx => ctx.scene.enter('ORDER'))

console.log(process.env.TOKEN)

bot.launch()
