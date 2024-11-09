import Product from "../models/Product.js"

const removeProduct = async (req, res) => {
    const { id } = req.params

    try {
        const product = await Product.findByIdAndDelete(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        res.json({ message: "Product removed" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export default removeProduct
