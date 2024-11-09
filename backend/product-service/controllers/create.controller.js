import Product from "../models/Product.js"

const createProduct = async (req, res) => {
    const { name, price, stock } = req.body

    if(!name || !price || !stock) return res.status(400).json({ message: "All fields are required" })

    try {
        const product = new Product({ name, price, stock })
        await product.save()
        res.status(201).json(product)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export default createProduct
