import {Scenes} from 'telegraf'
import {Markup} from 'telegraf'
import {parse} from "dotenv";

const Shava = {}

Shava.products = [
    {"name": "КЛАССИЧЕСКАЯ", "cost": 170},
    {"name": "C БРУСНИКОЙ И МЯТОЙ", "cost": 210},
    {"name": "БАБЕКЮ", "cost": 219},
    {"name": "СЫРНАЯ", "cost": 180},
    {"name": "GIROS", "cost": 199},
    {"name": "МЕКСИКАНСКАЯ", "cost": 199},
    {"name": "ВЕГЕТАРИАНСКАЯ", "cost": 150},
    {"name": "МИНИ", "cost": 99},
]

Shava.keyboard = new Markup.inlineKeyboard(
    [
        //[{ text: '', callback_data: '{"name": "", "cost": ""}' }],
        [{ text: '❌ Отменить', callback_data: 'close' }],
        [{ text: '170₽ КЛАССИЧЕСКАЯ', callback_data: `product:0`}],
        [{ text: '210₽ C БРУСНИКОЙ И МЯТОЙ', callback_data: 'product:1' }],
        [{ text: '219₽ БАБЕКЮ', callback_data: 'product:2' }],
        [{ text: '180₽ СЫРНАЯ', callback_data: 'product:3' }],
        [{ text: '199₽ GIROS', callback_data: 'product:4' }],
        [{ text: '199₽ МЕКСИКАНСКАЯ', callback_data: 'product:5' }],
        [{ text: '150₽ ВЕГЕТАРИАНСКАЯ', callback_data: 'product:6' }],
        [{ text: '99₽ МИНИ', callback_data: `product:7` }],
        [{ text: '↩️ Убрать последний', callback_data: 'remove' }, { text: '💸 Посчитать', callback_data: 'receipt' }],
    ]
)

Shava.scene = new Scenes.BaseScene('ORDER')
Shava.scene.enter( ctx => {
    console.log(ctx.update.message)
    const first_name = ctx.update.message.from.first_name
    ctx.session.__scenes.state[first_name] = []
    ctx.reply( 'Выберите то, что вам по душе', Shava.keyboard, { parse_mode: 'HTML'})
})

Shava.scene.action(/product/, ctx => {
    console.log(0, ctx.session.__scenes.state)
    const state = ctx.session.__scenes.state
    const first_name = ctx.update.callback_query.from.first_name
    const productId = ctx.update.callback_query.data.split(':')[1]
    const product = Shava.products[productId]

    if (typeof state[first_name] === 'undefined') state[first_name] = []
    const products = state[first_name]

    products.push(product)

    let productsString = ''
    let cost = 0

    for (let key in state) {
        productsString += `\n${key}:`
        for (let el of state[key]) {
            productsString += `\n • ${el.name.toLowerCase()}`
            cost += el.cost
        }
    }

    console.log(1, state)

    ctx.editMessageText(
        `Выберите то, что вам по душе\n${productsString}\n\nсумма: ${cost}`,
        Shava.keyboard
    )
})

Shava.scene.action('remove', ctx => {
    const state = ctx.session.__scenes.state
    const first_name = ctx.update.callback_query.from.first_name
    const products = state[first_name]

    if (products.length === 0) return

    products.pop()

    console.log(state)

    let productsString = ''
    let cost = 0

    for (let key in state) {
        productsString += `\n${key}:`
        for (let el of state[key]) {
            productsString += `\n • ${el.name}`
            cost += el.cost
        }
    }


    ctx.editMessageText(
        `Выберите то, что вам по душе\n${productsString}\n\nсумма: ${cost}`,
        Shava.keyboard
    )
})

Shava.scene.action('close', ctx => {
    ctx.deleteMessage()
    ctx.scene.leave()
})

Shava.scene.action('receipt', ctx => {
    ctx.deleteMessage()
    const state = ctx.session.__scenes.state
    let text = '<b>--- ООО ДонерБар ---</b>\n'

    let cost = 0

    for (let key in state) {
        text += `\n${key}:`
        for (let el of state[key]) {
            text += `\n - ${el.name} -- ${el.cost}`
            cost += el.cost
        }
    }

    text += `\n\n<i>ИТОГ: <b>${cost}</b></i>`
    text += `\n<i>Не забудьте скинуть денежку</i>`

    ctx.reply(text, {parse_mode: 'HTML'})
})

export default Shava
