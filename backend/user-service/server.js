import express from "express"
import 'dotenv/config'
import registerController from "./controller/register.controller.js"
import loginController from "./controller/login.controller.js"
import connectDb from "./config/db.js"

connectDb()
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post("/register", registerController)
app.post("/login", loginController)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`User Service running on port ${PORT}`)
})
