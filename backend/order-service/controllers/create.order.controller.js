
// Mock data for orders
let orders = []

// Create a new order
const createOrder = (req, res) => {
	const newOrder = {
		id: orders.length + 1,
		items: req.body.items,
		total: req.body.total,
	}
	orders.push(newOrder)
	res.status(201).json(newOrder)
}

export default createOrder