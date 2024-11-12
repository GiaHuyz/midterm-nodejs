import amqp from "amqplib/callback_api.js"
import Order from "../models/Order.js"

const handleOrderCheckQueue = () => {
	amqp.connect("amqp://rabbitmq", (error0, connection) => {
		if (error0) throw error0

		connection.createChannel((error1, channel) => {
			if (error1) throw error1

			const queue = "order_check_queue"
			channel.assertQueue(queue, { durable: false })

			channel.consume(
				queue,
				async (msg) => {
					if (msg !== null) {
						const { productId } = JSON.parse(msg.content.toString())
						const orders = await Order.find({ products: { $elemMatch: { _id: productId } } }).exec()
						console.log(orders)
						const response = { hasOrder: orders.length > 0 }

						if (msg.properties.replyTo) {
							channel.assertQueue(msg.properties.replyTo, { durable: false })
							channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)))
							channel.ack(msg)
						}
					}
				},
				{ noAck: false }
			)
		})
	})
}

export { handleOrderCheckQueue }
