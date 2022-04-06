import {Scenes} from 'telegraf'
import {Markup} from 'telegraf'
import {parse} from "dotenv";

const Shava = {}

Shava.keyboard = new Markup.inlineKeyboard(
    [
        //[{ text: '', callback_data: '' }],
        [{ text: '170₽ КЛАССИЧЕСКАЯ', callback_data: `{"name": "КЛАССИЧЕСКАЯ", "cost": "170"}` }],
        [{ text: '99₽ МИНИ', callback_data: `{"name": "МИНИ", "cost": "99"}` }],
        [{ text: '❌ Отменить', callback_data: 'close' }, { text: '💸 Посчитать', callback_data: 'receipt' }],
    ]
)

Shava.receipt = []

Shava.scene = new Scenes.WizardScene(
    'SHAVA',
    ctx => {
        ctx.reply('Выберите то, что вам по душе', Shava.keyboard)
        return ctx.wizard.next()
    },
    ctx => {
        if (ctx.update['callback_query'] === undefined) return Shava.sceneErr(ctx)
        if (ctx?.update?.callback_query?.data === 'close') {
            ctx.deleteMessage()
            Shava.receipt = []
            return ctx.scene.leave()
        }
        if (ctx?.update?.callback_query?.data === 'receipt') {
            return ctx.wizard.next()
        }

        const product = JSON.parse(ctx?.update?.callback_query?.data)
        const text = ctx.update.callback_query.message.text
        Shava.receipt.push(product)

        console.log(Shava.receipt)
        console.log()

        ctx.editMessageText(text + `\n • ${product.name}`, Shava.keyboard)

        const index = ctx.wizard.cursor
        return ctx.wizard.selectStep(index)
    },
    ctx => {
        if (ctx.update['callback_query'] === undefined) return Shava.sceneErr(ctx)

        let cost = 0
        let receipt = 'ООО Doner Bar \n ----------'

        for (let proudct of Shava.receipt) {
            console.log(proudct)
            cost += Number(proudct.cost)
            receipt += `\n${proudct.name} : ${proudct.cost}`
        }

        receipt += `\n ---------- \n <b>ИТОГ ${cost}</b>`
        receipt += '\n<i>Не забудьте скинуть денежку</i>'

        ctx.deleteMessage()
        ctx.reply(receipt, { parse_mode: 'HTML' })
        return ctx.scene.leave()
    }
    )

Shava.sceneErr = function(ctx) {
    console.log('err')
    Shava.receipt = []
    ctx.deleteMessage(ctx.message.message_id - 1)
    ctx.reply('Ай шайтанаме не понимате две?')
    return ctx.scene.leave()
}

export default Shava
