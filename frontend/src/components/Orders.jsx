import { OrderedListOutlined } from "@ant-design/icons"
import { Button, Form, Input, InputNumber, Modal, Select, Table, message } from "antd"
import axios from "axios"
import { useEffect, useState } from "react"

const { Option } = Select

const Orders = () => {
	const [orders, setOrders] = useState([])
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [form] = Form.useForm()
	const [editingOrderId, setEditingOrderId] = useState(null)
	const [products, setProducts] = useState([])
	const [selectedProducts, setSelectedProducts] = useState([])
	const [viewingOrder, setViewingOrder] = useState(null)

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

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const response = await axios.get("/api/orders", {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				})
				const ordersWithDetails = response.data.map((order) => ({
					...order,
					customerName: order.customer.name,
					customerPhone: order.customer.phone,
					productName: order.products.map((p) => p.name).join(", "),
					quantity: order.products.reduce((sum, p) => sum + p.quantity, 0),
					totalAmount: order.products.reduce((sum, p) => sum + p.price * p.quantity, 0),
				}))
				setOrders(ordersWithDetails)
			} catch (error) {
				message.error(error.response.data.message)
			}
		}

		fetchOrders()
	}, [])

	const fetchOrders = async () => {
		try {
			const response = await axios.get("/api/orders", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			})
			const ordersWithDetails = response.data.map((order) => ({
				...order,
				customerName: order.customer.name,
				customerPhone: order.customer.phone,
				productName: order.products.map((p) => p.name).join(", "),
				quantity: order.products.reduce((sum, p) => sum + p.quantity, 0),
				totalAmount: order.products.reduce((sum, p) => sum + p.price * p.quantity, 0),
			}))
			setOrders(ordersWithDetails)
		} catch (error) {
			message.error(error.response.data.message)
		}
	}

	const columns = [
		{
			title: "Customer Name",
			dataIndex: "customerName",
			key: "customerName",
		},
		{
			title: "Total Amount",
			dataIndex: "totalAmount",
			key: "totalAmount",
			render: (amount) => `$${amount?.toFixed(2)}`,
		},
		{
			title: "Action",
			key: "action",
			render: (_, record) => (
				<span>
					<Button type='link' onClick={() => handleView(record)}>
						View
					</Button>
				</span>
			),
		},
	]

	const handleAdd = () => {
		setEditingOrderId(null)
		form.resetFields()
		setIsModalVisible(true)
	}

	const handleModalOk = async () => {
		form.validateFields().then(async (values) => {
			const orderData = {
				customer: {
					name: values.customerName,
					phone: values.customerPhone,
				},
				products: selectedProducts.map((product) => ({
					productId: product._id,
					quantity: values.quantity,
				})),
				status: values.status,
			}
			if (editingOrderId) {
				setOrders(orders.map((order) => (order.id === editingOrderId ? { ...order, ...orderData } : order)))
			} else {
				try {
					const response = await axios.post("/api/orders", orderData, {
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					})
					const newOrder = {
						id: response.data.id,
						...orderData,
					}
					setOrders([...orders, newOrder])
					message.success("Order created successfully")
					await fetchOrders() // Call fetchOrders after adding a new order
				} catch (error) {
					message.error(error.response.data.message)
				}
			}
			setIsModalVisible(false)
		})
	}

	const handleProductChange = (values) => {
		const selected = products.filter((product) => values.includes(product.name))
		setSelectedProducts(selected)
		const quantity = form.getFieldValue("quantity") || 1
		const totalAmount = selected.reduce((sum, product) => sum + product.price * quantity, 0)
		form.setFieldsValue({ totalAmount })
	}

	const handleQuantityChange = (value) => {
		const totalAmount = selectedProducts.reduce((sum, product) => sum + product.price * value, 0)
		form.setFieldsValue({ totalAmount })
	}

	const handleView = (order) => {
		setViewingOrder(order)
		setIsModalVisible(true)
	}

	const handleModalCancel = () => {
		setIsModalVisible(false)
		setViewingOrder(null)
	}

	return (
		<div>
			<div style={{ textAlign: "right" }}>
				<Button type='primary' onClick={handleAdd} style={{ marginBottom: 16 }}>
					Add Order
				</Button>
			</div>
			<Table columns={columns} dataSource={orders} rowKey='id' />
			<Modal
				title={editingOrderId ? "Edit Order" : viewingOrder ? "Order Details" : "Add Order"}
				visible={isModalVisible}
				onOk={viewingOrder ? handleModalCancel : handleModalOk}
				onCancel={handleModalCancel}>
				{viewingOrder ? (
					<div>
						<p>
							<strong>Customer Name:</strong> {viewingOrder.customerName}
						</p>
						<p>
							<strong>Customer Phone:</strong> {viewingOrder.customerPhone}
						</p>
						<p>
							<strong>Products:</strong>
						</p>
						<ul>
							{viewingOrder.products.map((product, index) => (
								<li key={index}>
									<p>
										<strong>Name:</strong> {product.name}
									</p>
									<p>
										<strong>Quantity:</strong> {product.quantity}
									</p>
									<p>
										<strong>Sub Total:</strong> ${(product.price * product.quantity)?.toFixed(2)}
									</p>
								</li>
							))}
						</ul>
					</div>
				) : (
					<Form form={form} layout='vertical'>
						<Form.Item
							name='customerName'
							label='Customer Name'
							rules={[{ required: true, message: "Please input the customer name!" }]}>
							<Input prefix={<OrderedListOutlined />} />
						</Form.Item>
						<Form.Item
							name='customerPhone'
							label='Customer Phone'
							rules={[
								{ required: true, message: "Please input the customer phone!", pattern: /^\d{10}$/ },
							]}>
							<Input prefix={<OrderedListOutlined />} />
						</Form.Item>
						<Form.Item
							name='productName'
							label='Product Name'
							rules={[{ required: true, message: "Please select the product name!" }]}>
							<Select mode='multiple' onChange={handleProductChange}>
								{products.map((product) => (
									<Option key={product._id} value={product.name}>
										{product.name}
									</Option>
								))}
							</Select>
						</Form.Item>
						<Form.Item
							name='quantity'
							label='Quantity'
							rules={[{ required: true, message: "Please input the quantity!" }]}>
							<InputNumber min={1} onChange={handleQuantityChange} />
						</Form.Item>
						<Form.Item
							name='totalAmount'
							label='Total Amount'
							rules={[{ required: true, message: "Please input the total amount!" }]}>
							<InputNumber
								formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
								parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
								min={0}
								step={0.01}
								disabled
							/>
						</Form.Item>
					</Form>
				)}
			</Modal>
		</div>
	)
}

export default Orders
