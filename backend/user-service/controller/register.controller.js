import bcrypt from "bcryptjs"
import User from "../model/User.js"

const registerController = async (req, res) => {
	const { email, password } = req.body
    
    if(!email || !password) return res.status(400).json({ message: "Please fill in all fields" })

	const existingUser = await User.findOne({ email })
	if (existingUser) return res.status(400).json({ message: "User already exists" })

	const hashedPassword = await bcrypt.hash(password, 10)
	const user = new User({ email, password: hashedPassword })

	try {
		await user.save()
		res.status(201).json({ message: "User registered successfully" })
	} catch (error) {
		res.status(500).json({ message: "Failed to register user" })
	}
}

export default registerController