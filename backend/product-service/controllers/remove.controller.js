import amqp from "amqplib/callback_api.js"
import Product from "../models/Product.js"

const removeProduct = async (req, res) => {
	const { id } = req.params
	const uniqueReplyQueue = `order_check_reply_queue_${Date.now()}`

	try {
		amqp.connect("amqp://rabbitmq", (error0, connection) => {
			if (error0) {
				res.status(500).json({ message: "Connection error" })
				return
			}

			connection.createChannel((error1, channel) => {
				if (error1) {
					res.status(500).json({ message: "Channel creation error" })
					connection.close()
					return
				}

				const queue = "order_check_queue"
				channel.assertQueue(queue, { durable: false })
				channel.assertQueue(uniqueReplyQueue, { durable: false })

				channel.sendToQueue(queue, Buffer.from(JSON.stringify({ productId: id })), {
					replyTo: uniqueReplyQueue,
				})

				channel.consume(
					uniqueReplyQueue,
					async (msg) => {
						if (msg !== null) {
							const response = JSON.parse(msg.content.toString())
                            console.log(response)

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
							channel.deleteQueue(uniqueReplyQueue)
							channel.close()
							connection.close()
						}
					},
					{ noAck: false }
				)
			})
		})
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

export default removeProduct
