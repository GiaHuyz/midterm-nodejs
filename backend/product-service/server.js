import "dotenv/config"
import express from "express"
import connectDb from "./config/db.js"
import createProduct from "./controllers/create.controller.js"
import getProducts from "./controllers/get.controller.js"
import removeProduct from "./controllers/remove.controller.js"
import updateProduct from "./controllers/update.controller.js"
import { handleProductQueue } from "./controllers/rabbitmq.controller.js"

connectDb()
const app = express()
app.use(express.json())

handleProductQueue()

app.get("/", getProducts)
app.post("/", createProduct)
app.put("/:id", updateProduct)
app.delete("/:id", removeProduct)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`)
})
