import Order from "../models/Order.js"

// Get all orders
const getOrders = async (req, res) => {
	try {
		const orders = await Order.find()
		res.status(200).json(orders)
	} catch (error) {
		res.status(500).json({ message: "Server error" })
	}
}

export default getOrders
