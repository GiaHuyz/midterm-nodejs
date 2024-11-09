import { OrderedListOutlined } from "@ant-design/icons"
import { Button, Form, Input, InputNumber, Modal, Select, Table } from "antd"
import React, { useState } from "react"

const { Option } = Select

const Orders = () => {
	const [orders, setOrders] = useState([
		{
			id: 1,
			customerName: "John Doe",
			productName: "Product A",
			quantity: 2,
			totalAmount: 19.98,
			status: "Pending",
		},
		{
			id: 2,
			customerName: "Jane Smith",
			productName: "Product B",
			quantity: 1,
			totalAmount: 19.99,
			status: "Shipped",
		},
	])
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [form] = Form.useForm()
	const [editingOrderId, setEditingOrderId] = useState(null)

	const columns = [
		{
			title: "Customer Name",
			dataIndex: "customerName",
			key: "customerName",
		},
		{
			title: "Product Name",
			dataIndex: "productName",
			key: "productName",
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			key: "quantity",
		},
		{
			title: "Total Amount",
			dataIndex: "totalAmount",
			key: "totalAmount",
			render: (amount) => `$${amount.toFixed(2)}`,
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
		},
		{
			title: "Action",
			key: "action",
			render: (_, record) => (
				<span>
					<Button type='link' onClick={() => handleEdit(record)}>
						Edit
					</Button>
					<Button type='link' danger onClick={() => handleDelete(record.id)}>
						Delete
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

	const handleEdit = (order) => {
		setEditingOrderId(order.id)
		form.setFieldsValue(order)
		setIsModalVisible(true)
	}

	const handleDelete = (id) => {
		setOrders(orders.filter((order) => order.id !== id))
	}

	const handleModalOk = () => {
		form.validateFields().then((values) => {
			if (editingOrderId) {
				setOrders(orders.map((order) => (order.id === editingOrderId ? { ...order, ...values } : order)))
			} else {
				const newOrder = {
					id: Math.max(...orders.map((o) => o.id)) + 1,
					...values,
				}
				setOrders([...orders, newOrder])
			}
			setIsModalVisible(false)
		})
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
				title={editingOrderId ? "Edit Order" : "Add Order"}
				visible={isModalVisible}
				onOk={handleModalOk}
				onCancel={() => setIsModalVisible(false)}>
				<Form form={form} layout='vertical'>
					<Form.Item
						name='customerName'
						label='Customer Name'
						rules={[{ required: true, message: "Please input the customer name!" }]}>
						<Input prefix={<OrderedListOutlined />} />
					</Form.Item>
					<Form.Item
						name='productName'
						label='Product Name'
						rules={[{ required: true, message: "Please input the product name!" }]}>
						<Input />
					</Form.Item>
					<Form.Item
						name='quantity'
						label='Quantity'
						rules={[{ required: true, message: "Please input the quantity!" }]}>
						<InputNumber min={1} />
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
						/>
					</Form.Item>
					<Form.Item
						name='status'
						label='Status'
						rules={[{ required: true, message: "Please select the order status!" }]}>
						<Select>
							<Option value='Pending'>Pending</Option>
							<Option value='Shipped'>Shipped</Option>
							<Option value='Delivered'>Delivered</Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	)
}

export default Orders
