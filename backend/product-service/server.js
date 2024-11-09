import "dotenv/config"
import express from "express"
import connectDb from "./config/db.js"
import createProduct from "./controllers/create.controller.js"
import updateProduct from "./controllers/update.controller.js"
import removeProduct from "./controllers/remove.controller.js"
import getProducts from "./controllers/get.controller.js"

connectDb()
const app = express()
app.use(express.json())

app.get("/", getProducts)
app.post("/", createProduct)
app.put("/:id", updateProduct)
app.delete("/:id", removeProduct)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`User Service running on port ${PORT}`)
})
