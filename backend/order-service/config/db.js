import mongoose from "mongoose"

const connectDb = () => mongoose
	.connect("mongodb://mongodb:27017/orders")
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("Failed to connect to MongoDB", err))

export default connectDb
