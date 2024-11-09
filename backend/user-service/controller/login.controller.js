import 'dotenv/config'
import jwt from "jsonwebtoken"
import User from "../model/User.js"
import bcrypt from "bcryptjs"

const loginController = async (req, res) => {
	const { email, password } = req.body

    if(!email || !password) return res.status(400).json({ message: "Please fill in all fields" })

	const user = await User.findOne({ email })
	if (!user) return res.status(400).json({ message: "User does not exist" })

	const isMatch = await bcrypt.compare(password, user.password)
	if (!isMatch) return res.status(400).json({ message: "Invalid credentials" })

	const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" })
	res.json({ token })
}

export default loginController