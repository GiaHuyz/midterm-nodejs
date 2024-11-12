import amqp from "amqplib"
import Order from "../models/Order.js"

const handleOrderCheckQueue = async () => {
	try {
		const connection = await amqp.connect("amqp://rabbitmq")
		const channel = await connection.createChannel()

		const queue = "order_check_queue"
		await channel.assertQueue(queue, { durable: false })

		channel.consume(
			queue,
			async (msg) => {
				if (msg !== null) {
					try {
						const { productId } = JSON.parse(msg.content.toString())

						const orders = await Order.find({ products: { $elemMatch: { _id: productId } } }).exec()
						const response = { hasOrder: orders.length > 0 }

						if (msg.properties.replyTo && msg.properties.correlationId) {
							channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
								correlationId: msg.properties.correlationId,
							})
						}

						channel.ack(msg)
					} catch (error) {
						console.error("Error processing message:", error)
					}
				}
			},
			{ noAck: false }
		)

		process.on("exit", () => {
			connection.close()
			console.log("Connection closed")
		})
	} catch (error) {
		console.error("Error connecting to RabbitMQ:", error)
	}
}

export { handleOrderCheckQueue }
