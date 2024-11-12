import amqp from "amqplib"
import Product from "../models/Product.js"

const handleProductQueue = async () => {
	const connection = await amqp.connect("amqp://rabbitmq")
	const channel = await connection.createChannel()
	const queue = "product_queue"

	await channel.assertQueue(queue, { durable: false })

	channel.consume(queue, async (msg) => {
		const productMessage = JSON.parse(msg.content.toString())

		try {
			const product = await Product.findById(productMessage.productId).exec()

			if (msg.properties.replyTo) {
				if (!product) {
					channel.sendToQueue(
						msg.properties.replyTo,
						Buffer.from(JSON.stringify({ status: 404, productId: productMessage.productId })),
						{ correlationId: msg.properties.correlationId }
					)
				} else {
					channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(product)), {
						correlationId: msg.properties.correlationId,
					})
					await Product.findByIdAndUpdate(productMessage.productId, { $inc: { stock: -productMessage.quantity } })
				}
			}
		} catch (error) {
			console.error("Error fetching product:", error)
		}

		channel.ack(msg)
	})
}

export { handleProductQueue }
