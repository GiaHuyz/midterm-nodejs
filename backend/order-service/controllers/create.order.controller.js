import amqp from "amqplib/callback_api.js"
import Order from "../models/Order.js"

const fetchProductDetails = (products, callback, errorCallback) => {
	amqp.connect("amqp://rabbitmq", (error0, connection) => {
		if (error0) {
			throw error0
		}
		connection.createChannel((error1, channel) => {
			if (error1) {
				throw error1
			}
			const requestQueue = "product_queue"
			const replyQueue = "order_reply_queue"

			channel.assertQueue(requestQueue, { durable: false })
			channel.assertQueue(replyQueue, { durable: false })

			let productDetails = []
			let errors = false

			channel.consume(
				replyQueue,
				(msg) => {
					if (msg !== null) {
						const response = JSON.parse(msg.content.toString())

						if (response.error) {
							errors = true
							errorCallback(`Product not found: ${response.productId}`)
							channel.close()
						} else {
							const product = products.find((p) => p.productId === response._id)

							if (product) {
								productDetails.push({
									product: response,
									quantity: product.quantity,
								})
							}

							if (productDetails.length === products.length && !errors) {
								callback(productDetails)
								channel.close()
							}
						}
					}
				},
				{ noAck: true }
			)

			products.forEach((product) => {
				channel.sendToQueue(requestQueue, Buffer.from(product.productId.toString()), {
					replyTo: replyQueue,
				})
			})
		})
	})
}

const createOrder = (req, res) => {
	const { customer, products, status } = req.body

	fetchProductDetails(
		products,
		async (productDetails) => {
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

            try {
                const savedOrder = await newOrder.save()
                res.status(201).json(savedOrder)
            } catch (err) {
                res.status(500).json({ error: err.message })
            }
		},
		(errorMessage) => {
			res.status(401).json({ message: errorMessage })
		}
	)
}

export default createOrder
