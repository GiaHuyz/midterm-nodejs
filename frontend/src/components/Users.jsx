import { UserOutlined } from "@ant-design/icons"
import { Button, Form, Input, Modal, Table } from "antd"
import React, { useState } from "react"

const Users = () => {
	const [users, setUsers] = useState([
		{ id: 1, name: "John Doe", email: "john@example.com" },
		{ id: 2, name: "Jane Smith", email: "jane@example.com" },
	])
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [form] = Form.useForm()
	const [editingUserId, setEditingUserId] = useState(null)

	const columns = [
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Email",
			dataIndex: "email",
			key: "email",
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
		setEditingUserId(null)
		form.resetFields()
		setIsModalVisible(true)
	}

	const handleEdit = (user) => {
		setEditingUserId(user.id)
		form.setFieldsValue(user)
		setIsModalVisible(true)
	}

	const handleDelete = (id) => {
		setUsers(users.filter((user) => user.id !== id))
	}

	const handleModalOk = () => {
		form.validateFields().then((values) => {
			if (editingUserId) {
				setUsers(users.map((user) => (user.id === editingUserId ? { ...user, ...values } : user)))
			} else {
				const newUser = {
					id: Math.max(...users.map((u) => u.id)) + 1,
					...values,
				}
				setUsers([...users, newUser])
			}
			setIsModalVisible(false)
		})
	}

	return (
		<div>
			<div style={{textAlign: "right"}}>
				<Button type='primary' onClick={handleAdd} style={{ marginBottom: 16, marginLeft: "auto" }}>
					Add User
				</Button>
			</div>

			<Table columns={columns} dataSource={users} rowKey='id' />
			<Modal
				title={editingUserId ? "Edit User" : "Add User"}
				visible={isModalVisible}
				onOk={handleModalOk}
				onCancel={() => setIsModalVisible(false)}>
				<Form form={form} layout='vertical'>
					<Form.Item name='name' label='Name' rules={[{ required: true, message: "Please input the name!" }]}>
						<Input prefix={<UserOutlined />} />
					</Form.Item>
					<Form.Item
						name='email'
						label='Email'
						rules={[
							{ required: true, message: "Please input the email!" },
							{ type: "email", message: "Please enter a valid email!" },
						]}>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	)
}

export default Users
