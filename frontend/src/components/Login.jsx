import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Form, Input, message } from "antd"
import axios from "axios"
import React from "react"
import { Link, useNavigate } from "react-router-dom"

const Login = ({ setIsAuthenticated }) => {
	const navigate = useNavigate()

	const onFinish = async (values) => {
		try {
			const response = await axios.post("/api/users/login", values)
            localStorage.setItem("token", response.data.token)
			setIsAuthenticated(true)
			message.success("Login successful")
			navigate("/")
		} catch (error) {
			message.error(error.response.data.message)
		}
	}

	return (
		<div style={{ maxWidth: "300px", margin: "100px auto" }}>
			<h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>
			<Form name='normal_login' initialValues={{ remember: true }} onFinish={onFinish}>
				<Form.Item name='email' rules={[{ required: true, message: "Please input your email!" }]}>
					<Input prefix={<UserOutlined />} placeholder='Email' />
				</Form.Item>
				<Form.Item name='password' rules={[{ required: true, message: "Please input your Password!" }]}>
					<Input prefix={<LockOutlined />} type='password' placeholder='Password' />
				</Form.Item>
				<Form.Item>
					<Button type='primary' htmlType='submit' style={{ width: "100%" }}>
						Log in
					</Button>
					Or <Link to='/register'>register now!</Link>
				</Form.Item>
			</Form>
		</div>
	)
}

export default Login
