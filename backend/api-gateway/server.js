import cors from "cors"
import "dotenv/config"
import express from "express"
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware"
import jwt from "jsonwebtoken"

const app = express()
app.use(
	cors({
		origin: "host.docker.internal:3000",
		methods: "GET,POST,PUT,DELETE",
	})
)

function authenticateToken(req, res, next) {
	const token = req.headers["authorization"]?.split(" ")[1]
	if (!token) return res.status(401).json({ message: "Access denied" })

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ message: "Invalid token" })
		req.user = user
		next()
	})
}

app.use(
	"/api/users",
	createProxyMiddleware({
		target: process.env.USER_SERVICE_URL,
		changeOrigin: true,
		onProxyReq: fixRequestBody,
		pathRewrite: {
			"^/api/users": "/",
		},
	})
)

app.use(
	"/api/products",
	authenticateToken,
	createProxyMiddleware({
		target: process.env.PRODUCT_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			"^/api/products": "/",
		},
	})
)

app.use(
	"/api/orders",
	authenticateToken,
	createProxyMiddleware({
		target: process.env.ORDER_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			"^/api/orders": "/",
		},
	})
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res) => {
	res.status(404).json({ message: "API endpoint not found" })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`API Gateway running on port ${PORT}`)
})
