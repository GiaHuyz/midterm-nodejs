import amqp from "amqplib/callback_api.js"
import Product from "../models/Product.js"

const handleProductQueue = () => {
	amqp.connect("amqp://rabbitmq", (error0, connection) => {
		if (error0) throw error0

		connection.createChannel((error1, channel) => {
			if (error1) throw error1

			const queue = "product_queue"
			channel.assertQueue(queue, { durable: false })

			channel.consume(queue, async (msg) => {
				if (msg !== null) {
					const productId = msg.content.toString()

					try {
						const product = await Product.findById(productId).exec()

						if (msg.properties.replyTo) {
							if (!product) {
								channel.sendToQueue(
									msg.properties.replyTo,
									Buffer.from(
										JSON.stringify({
											error: "Product not found",
											productId,
										})
									)
								)
							} else {
								channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(product)))
							}
						}
					} catch (error) {
						console.error("Error fetching product:", error)
					}
					channel.ack(msg)
				}
			})
		})
	})
}

export { handleProductQueue }
