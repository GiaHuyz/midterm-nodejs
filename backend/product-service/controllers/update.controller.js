import Product from "../models/Product.js"

const updateProduct = async (req, res) => {
    const { id } = req.params
    const { name, price, stock } = req.body

    try {
        const product = await Product.findByIdAndUpdate(id, { name, price, stock }, { new: true })
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        res.json(product)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export default updateProduct
