import { ShoppingOutlined } from "@ant-design/icons"
import { Button, Form, Input, InputNumber, Modal, Table, message } from "antd"
import axios from "axios"
import { useEffect, useState } from "react"

const Products = () => {
	const [products, setProducts] = useState([])
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [form] = Form.useForm()
	const [editingProductId, setEditingProductId] = useState(null)

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await axios.get("/api/products", {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				})
				setProducts(response.data)
			} catch (error) {
				message.error(error.response.data.message)
			}
		}

		fetchProducts()
	}, [])

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			render: (price) => `$${price.toFixed(2)}`,
		},
		{
			title: "Stock",
			dataIndex: "stock",
			key: "stock",
		},
		{
			title: "Action",
			key: "action",
			render: (_, record) => (
				<span>
					<Button type='link' onClick={() => handleEdit(record)}>
						Edit
					</Button>
					<Button type='link' danger onClick={() => handleDelete(record._id)}>
						Delete
					</Button>
				</span>
			),
		},
	]

	const handleAdd = () => {
		setEditingProductId(null)
		form.resetFields()
		setIsModalVisible(true)
	}

	const handleEdit = (product) => {
		setEditingProductId(product._id)
		form.setFieldsValue(product)
		setIsModalVisible(true)
	}

	const handleDelete = (id) => {
		axios
			.delete(`/api/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            })
			.then(() => {
				setProducts(products.filter((product) => product._id !== id))
				message.success("Product deleted successfully")
			})
			.catch((e) => message.error(e.response.data.message))
	}

	const handleModalOk = () => {
		form.validateFields().then((values) => {
			if (editingProductId) {
				axios
					.put(`/api/products/${editingProductId}`, values, {
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					})
					.then((response) => {
						setProducts(
							products.map((product) => (product._id === editingProductId ? response.data : product))
						)
						message.success("Product updated successfully")
					})
					.catch((e) => message.error(e.response.data.message))
			} else {
				axios
					.post("/api/products/", values, {
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					})
					.then((response) => {
                        if(response.data) {
                            setProducts([...products, response.data])
                            message.success("Product added successfully")
                        }
					})
					.catch((e) => message.error(e.response.data.message))
			}
			setIsModalVisible(false)
		})
	}

	return (
		<div>
			<div style={{ textAlign: "right" }}>
				<Button type='primary' onClick={handleAdd} style={{ marginBottom: 16 }}>
					Add Product
				</Button>
			</div>
			<Table columns={columns} dataSource={products} rowKey='_id' />
			<Modal
				title={editingProductId ? "Edit Product" : "Add Product"}
				open={isModalVisible}
				onOk={handleModalOk}
				onCancel={() => setIsModalVisible(false)}>
				<Form form={form} layout='vertical'>
					<Form.Item
						name='name'
						label='Name'
						rules={[{ required: true, message: "Please input the product name!" }]}>
						<Input prefix={<ShoppingOutlined />} />
					</Form.Item>
					<Form.Item
						name='price'
						label='Price'
						rules={[{ required: true, message: "Please input the price!" }]}>
						<InputNumber
							formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
							parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
							min={0}
							step={0.01}
						/>
					</Form.Item>
					<Form.Item
						name='stock'
						label='Stock'
						rules={[{ required: true, message: "Please input the stock quantity!" }]}>
						<InputNumber min={0} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	)
}

export default Products
