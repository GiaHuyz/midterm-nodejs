
// Mock data for orders
let orders = []

// Get all orders
const getOrders = (req, res) => {
	res.json(orders)
}

export default getOrders