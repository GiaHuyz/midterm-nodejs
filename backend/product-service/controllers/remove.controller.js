import amqp from "amqplib"
import { v4 as uuidv4 } from "uuid"
import Product from "../models/Product.js"

const removeProduct = async (req, res) => {
	const { id } = req.params
	const correlationId = uuidv4()

	try {
		const connection = await amqp.connect("amqp://rabbitmq")
		const channel = await connection.createChannel()
		const requestQueue = "order_check_queue"
		const replyQueue = await channel.assertQueue("", { exclusive: true })

		channel.sendToQueue(requestQueue, Buffer.from(JSON.stringify({ productId: id })), {
			correlationId: correlationId,
			replyTo: replyQueue.queue,
		})

		channel.consume(
			replyQueue.queue,
			async (msg) => {
				if (msg !== null && msg.properties.correlationId === correlationId) {
					const response = JSON.parse(msg.content.toString())

					if (response.hasOrder) {
						res.status(400).json({ message: "Cannot delete product with existing orders" })
					} else {
						const product = await Product.findByIdAndDelete(id)
						if (!product) {
							res.status(404).json({ message: "Product not found" })
						} else {
							res.status(200).json({ message: "Deleted successfully" })
						}
					}

					channel.ack(msg)
					await channel.deleteQueue(replyQueue.queue)
					await channel.close()
					await connection.close()
				}
			},
			{ noAck: false }
		)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

export default removeProduct
