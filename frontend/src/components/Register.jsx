import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Form, Input, message } from "antd"
import React from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const Register = () => {
	const navigate = useNavigate()

	const onFinish = async (values) => {
		try {
			await axios.post("/api/users/register", values)
			message.success("Registration successful")
			navigate("/login")
		} catch (error) {
			message.error(error.response.data.message)
		}
	}

	return (
		<div style={{ maxWidth: "300px", margin: "100px auto" }}>
			<h2 style={{ textAlign: "center", marginBottom: "20px" }}>Register</h2>
			<Form name='normal_register' initialValues={{ remember: true }} onFinish={onFinish}>
				<Form.Item
					name='email'
					rules={[
						{ required: true, message: "Please input your Email!" },
						{ type: "email", message: "Please enter a valid email!" },
					]}>
					<Input prefix={<MailOutlined />} placeholder='Email' />
				</Form.Item>
				<Form.Item name='password' rules={[{ required: true, message: "Please input your Password!" }]}>
					<Input prefix={<LockOutlined />} type='password' placeholder='Password' />
				</Form.Item>
				<Form.Item
					name='confirm'
					dependencies={["password"]}
					rules={[
						{ required: true, message: "Please confirm your password!" },
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue("password") === value) {
									return Promise.resolve()
								}
								return Promise.reject(new Error("The two passwords do not match!"))
							},
						}),
					]}>
					<Input prefix={<LockOutlined />} type='password' placeholder='Confirm Password' />
				</Form.Item>
				<Form.Item>
					<Button type='primary' htmlType='submit' style={{ width: "100%" }}>
						Register
					</Button>
					Or <Link to='/login'>login now!</Link>
				</Form.Item>
			</Form>
		</div>
	)
}

export default Register
