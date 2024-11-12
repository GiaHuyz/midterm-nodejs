import mongoose from "mongoose"

const orderSchema = new mongoose.Schema(
	{
		customer: {
			name: {
				type: String,
				required: true,
			},
			phone: {
				type: String,
				required: true,
				match: [/^\d{10}$/, "Please enter a valid phone number"],
			},
		},
		products: [
			{
				_id: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
				},
				name: {
					type: String,
					required: true,
				},
				price: {
					type: Number,
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
				},
			},
		],
		total: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
)

const Order = mongoose.model("Order", orderSchema)

export default Order
