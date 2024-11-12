import amqp from "amqplib"
import { v4 as uuidv4 } from "uuid"
import Order from "../models/Order.js"

async function fetchProductDetails(products) {
	const connection = await amqp.connect("amqp://rabbitmq")
	const channel = await connection.createChannel()

	const requestQueue = "product_queue"
	const replyQueue = await channel.assertQueue("", { exclusive: true })

	const correlationId = uuidv4()
	let productDetails = []

	return new Promise((resolve, reject) => {
		products.forEach((product) => {
			channel.sendToQueue(requestQueue, Buffer.from(JSON.stringify(product)), {
				correlationId,
				replyTo: replyQueue.queue,
			})
		})

		channel.consume(
			replyQueue.queue,
			(msg) => {
				if (msg !== null && msg.properties.correlationId === correlationId) {
					const response = JSON.parse(msg.content.toString())

					if (response.error) {
						reject(response)
					} else {
						const product = products.find((p) => p.productId === response._id)

						if (product) {
							productDetails.push({
								product: response,
								quantity: product.quantity,
							})
						}

						if (productDetails.length === products.length) {
							resolve(productDetails)
							setTimeout(() => {
                                channel.deleteQueue(replyQueue.queue)
								channel.close()
								connection.close()
							}, 500)
						}
					}
				}
			},
			{ noAck: true }
		)
	})
}

const createOrder = async (req, res) => {
	const { customer, products, status } = req.body

	try {
		const productDetails = await fetchProductDetails(products)
		const total = productDetails.reduce((acc, item) => acc + item.product.price * item.quantity, 0)

		const newOrder = new Order({
			customer: { name: customer.name, phone: customer.phone },
			products: productDetails.map((item) => ({
				_id: item.product._id,
				name: item.product.name,
				price: item.product.price,
				quantity: item.quantity,
			})),
			total,
			status,
		})

		const savedOrder = await newOrder.save()
		res.status(201).json(savedOrder)
	} catch (err) {
		if (err.status === 404) return res.status(404).json({ error: `Product with ID ${err.productId} not found` })
		res.status(500).json({ error: err.message })
	}
}

export default createOrder
