import { Kafka } from 'kafkajs'

const BROKER_1 = process.env.KAFKA_URL
const BROKER_2 = process.env.KAFKA_URL
const BROKER_3 = process.env.KAFKA_URL
const STRAPI_URL = process.env.STRAPI_URL
const TOKEN = process.env.STRAPI_TOKEN
const TOPIC = process.env.TOPIC || 'stock'
const BEGINNING = process.env.BEGINNING == 'true' || 'false'
const ERROR_TOPIC = process.env.ERROR_TOPIC || 'errors'

const log = (...str) => console.log(`${new Date().toUTCString()}: `, ...str)

const kafka = new Kafka({
  clientId: 'stock-consumer',
  brokers: [BROKER_1, BROKER_2, BROKER_3],
})

const consumer = kafka.consumer({ groupId: 'stock-creator' })
const producer = kafka.producer()

const consume = async () => {
  await Promise.all([consumer.connect(), producer.connect()])
  await consumer.subscribe({ topic: TOPIC, fromBeginning: BEGINNING })

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const strProduct = message.value.toString()
        const stock = JSON.parse(strProduct)
        log('creating', strProduct)
        log(stock, await applyStockChange(stock))
        log('created', strProduct)
      } catch (error) {
        console.error(error)
        if (ERROR_TOPIC)
          producer.send({
            topic: ERROR_TOPIC,
            messages: [{ value: JSON.stringify({ error, message }) }],
          })
      }
    },
  })
}

const applyStockChange = async (stock) => {
  console.log(stock)
  if (stock.id === undefined || stock.type === undefined || stock.amount === undefined)
    throw new Error('invalid format')

  const product = await fetch(STRAPI_URL + '/api/products/' + stock.id, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
  })
    .then((r) => r.json())
    .then((r) => r.data)

  const changeStock = (stock.type === 'IN' ? 1 : -1) * stock.amount

  if (product.attributes.stock_available + changeStock < 0) throw new Error('negative stock')

  const data = {
    stock_available: product.attributes.stock_available + changeStock,
  }

  console.log(JSON.stringify({ data }))
  const res = await fetch(STRAPI_URL + '/api/products/' + stock.id, {
    method: 'PUT',
    body: JSON.stringify({
      data,
    }),
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'content-type': 'application/json',
    },
  })
  if (res.status === 200) {
    const response = await res.json()
    return response
  }
  return 'error'
}

await consume()
