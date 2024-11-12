import "dotenv/config"
import express from "express"
import connectDb from "./config/db.js"
import loginController from "./controller/login.controller.js"
import registerController from "./controller/register.controller.js"

connectDb()
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
	const containerName = process.env.HOSTNAME || "unknown-container"
	console.log(`[${new Date().toISOString()}] ${containerName} - ${req.method} ${req.originalUrl}`)
	next()
})

app.post("/register", registerController)
app.post("/login", loginController)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`User Service running on port ${PORT}`)
})
