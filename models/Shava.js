import {Scenes} from 'telegraf'
import {Markup} from 'telegraf'
import {parse} from "dotenv";

const Shava = {}

Shava.keyboard = new Markup.inlineKeyboard(
    [
        //[{ text: '', callback_data: '{"name": "", "cost": ""}' }],
        [{ text: '170₽ КЛАССИЧЕСКАЯ', callback_data: `{"name": "КЛАССИЧЕСКАЯ", "cost": "170"}` }],
        [{ text: '210₽ C БРУСНИКОЙ И МЯТОЙ', callback_data: '{"name": "C БРУСНИКОЙ И МЯТОЙ", "cost": "210"}' }],
        [{ text: '219₽ БАБЕКЮ', callback_data: '{"name": "БАБЕКЮ", "cost": "219"}' }],
        [{ text: '180₽ СЫРНАЯ', callback_data: '{"name": "СЫРНАЯ", "cost": "180"}' }],
        [{ text: '199₽ GIROS', callback_data: '{"name": "GIROS", "cost": "199"}' }],
        [{ text: '199₽ МЕКСИКАНСКАЯ', callback_data: '{"name": "МЕКСИКАНСКАЯ", "cost": "199"}' }],
        [{ text: '150₽ ВЕГЕТАРИАНСКАЯ', callback_data: '{"name": "ВЕГЕТАРИАНСКАЯ", "cost": "150"}' }],
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
            console.log('receipt')
            return ctx.wizard.selectStep(2)
        }
        if (ctx.update.callback_query.data) {

        }
        const product = JSON.parse(ctx?.update?.callback_query?.data)
        const text = ctx.update.callback_query.message.text
        Shava.receipt.push(product)

        console.log(Shava.receipt)

        ctx.editMessageText(text + `\n • ${product.name}`, Shava.keyboard)

        return
    },
    ctx => {
        if (ctx.update['callback_query'] === undefined) return Shava.sceneErr(ctx)
        console.log('receipt', 2)

        let cost = 0
        let receipt = 'ООО Doner Bar \n ----------'

        for (let proudct of Shava.receipt) {
            console.log(proudct)
            cost += Number(proudct.cost)
            receipt += `\n${proudct.name} : ${proudct.cost}`
        }

        receipt += `\n ---------- \n <b>ИТОГ ${cost}</b>`
        receipt += '\n\n<i>Не забудьте скинуть денежку</i>'

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
