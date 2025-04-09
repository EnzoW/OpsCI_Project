import { Kafka } from 'kafkajs'
const BROKER_1 = process.env.KAFKA_URL
const BROKER_2 = process.env.KAFKA_URL
const BROKER_3 = process.env.KAFKA_URL
const STRAPI_URL = process.env.STRAPI_URL
const TOKEN = process.env.STRAPI_TOKEN
const TOPIC = process.env.TOPIC || 'event'
const BEGINNING = process.env.BEGINNING == 'true' || 'false'
const ERROR_TOPIC = process.env.ERROR_TOPIC || 'errors'

const log = (...str) => console.log(`${new Date().toUTCString()}: `, ...str)

if (!TOKEN) {
  throw new Error('STRAPI_TOKEN not set!')
}

const kafka = new Kafka({
  clientId: 'event-consumer',
  brokers: [BROKER_1, BROKER_2, BROKER_3],
})

const consumer = kafka.consumer({ groupId: 'event-creator' })
const producer = kafka.producer()

const consume = async () => {
  await Promise.all([consumer.connect(), producer.connect()])
  await consumer.subscribe({ topic: TOPIC, fromBeginning: BEGINNING })

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const strProduct = message.value.toString()
        const event = JSON.parse(strProduct)
        log('creating', strProduct)
        log(event.name, await createEvent(event))
        log('created', strProduct)
      } catch (error) {
        if (ERROR_TOPIC)
          producer.send({
            topic: ERROR_TOPIC,
            messages: [{ value: { error, message } }],
          })
      }
    },
  })
}

const createEvent = async (event) => {
  const res = await fetch(STRAPI_URL + '/api/events', {
    method: 'POST',
    body: JSON.stringify({
      data: event,
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
