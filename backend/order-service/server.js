import "dotenv/config"
import express from "express"
import connectDb from "./config/db.js"
import createOrder from "./controllers/create.order.controller.js"
import getOrders from "./controllers/get.orders.controller.js"

connectDb()
const app = express()
app.use(express.json())

app.post("/", createOrder)
app.get("/", getOrders)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`User Service running on port ${PORT}`)
})
