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

Shava.orders = {}

Shava.scene = new Scenes.BaseScene('ORDER')
Shava.scene.enter( ctx => {
    console.log(ctx.update.message)
    const orderId = ctx.update.message.chat.id
    Shava.orders[orderId] = {}
    ctx.reply( 'Выберите то, что вам по душе', Shava.keyboard, { parse_mode: 'HTML'})
})

Shava.scene.action(/product/, ctx => {
    console.log(0, ctx)

    const first_name = ctx.update.callback_query.from.first_name
    const orderId = ctx.update.callback_query.message.chat.id
    const order = Shava.orders[orderId]
    const productId = ctx.update.callback_query.data.split(':')[1]
    const product = Shava.products[productId]

    console.log(orderId, first_name)

    if (typeof order[first_name] === 'undefined') order[first_name] = []
    const products = order[first_name]

    products.push(product)

    let productsString = ''
    let cost = 0

    for (let key in order) {
        productsString += `\n${key}:`
        for (let el of order[key]) {
            productsString += `\n • ${el.name.toLowerCase()}`
            cost += el.cost
        }
    }

    console.log(1, order)
    console.log(2, Shava.orders)

    ctx.editMessageText(
        `Выберите то, что вам по душе\n${productsString}\n\nсумма: ${cost}`,
        Shava.keyboard
    )
})

Shava.scene.action('remove', ctx => {
    const first_name = ctx.update.callback_query.from.first_name
    const orderId = ctx.update.callback_query.message.chat.id
    const order = Shava.orders[orderId]
    const products = order[first_name]

    if (products.length === 0) return

    products.pop()

    console.log(order)

    let productsString = ''
    let cost = 0

    for (let key in order) {
        productsString += `\n${key}:`
        for (let el of order[key]) {
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
    const orderId = ctx.update.callback_query.message.chat.id
    const order = Shava.orders[orderId]
    let text = '<b>--- ООО ДонерБар ---</b>\n'

    let cost = 0

    for (let key in order) {
        text += `\n${key}:`
        for (let el of order[key]) {
            text += `\n - ${el.name} -- ${el.cost}`
            cost += el.cost
        }
    }

    text += `\n\n<i>ИТОГ: <b>${cost}</b></i>`
    text += `\n<i>Не забудьте скинуть денежку</i>`

    ctx.reply(text, {parse_mode: 'HTML'})
})

export default Shava
