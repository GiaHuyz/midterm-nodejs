import "dotenv/config"
import express from "express"
import connectDb from "./config/db.js"
import createOrder from "./controllers/create.order.controller.js"
import getOrders from "./controllers/get.orders.controller.js"
import { handleOrderCheckQueue } from "./controllers/rabbitmq.controller.js"
import jwt from "jsonwebtoken"

connectDb()
const app = express()
app.use(express.json())

handleOrderCheckQueue()

function authenticateToken(req, res, next) {
	const token = req.headers["authorization"]?.split(" ")[1]
	if (!token) return res.status(401).json({ message: "Access denied" })

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ message: "Invalid token" })
		req.user = user
		next()
	})
}

app.use((req, res, next) => {
	const containerName = process.env.HOSTNAME || "unknown-container"
	console.log(`[${new Date().toISOString()}] ${containerName} - ${req.method} ${req.originalUrl}`)
	next()
})

app.use(authenticateToken)

app.post("/", createOrder)
app.get("/", getOrders)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`)
})
