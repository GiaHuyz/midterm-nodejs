import { LoginOutlined, LogoutOutlined, OrderedListOutlined, ShoppingOutlined, UserOutlined } from "@ant-design/icons"
import { Layout, Menu } from "antd"
import React, { useState } from "react"
import { Link, Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import Login from "./components/Login"
import Orders from "./components/Orders"
import Products from "./components/Products"
import Register from "./components/Register"
import Users from "./components/Users"

const { Header, Content, Footer } = Layout

const App = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(true)

	const handleLogout = () => {
		setIsAuthenticated(false)
	}

	return (
		<Router>
			<Layout className='layout' style={{ minHeight: "100vh" }}>
				<Header>
					<div className='site-layout-content' style={{ margin: "0 auto", maxWidth: "1200px" }}>
						<Menu theme='dark' mode='horizontal' defaultSelectedKeys={["1"]}>
							{isAuthenticated ? (
								<>
									<Menu.Item key='1' icon={<UserOutlined />}>
										<Link to='/users'>Users</Link>
									</Menu.Item>
									<Menu.Item key='2' icon={<ShoppingOutlined />}>
										<Link to='/products'>Products</Link>
									</Menu.Item>
									<Menu.Item key='3' icon={<OrderedListOutlined />}>
										<Link to='/orders'>Orders</Link>
									</Menu.Item>
									<Menu.Item key='4' icon={<LogoutOutlined />} onClick={handleLogout}>
										Logout
									</Menu.Item>
								</>
							) : (
								<Menu.Item key='5' icon={<LoginOutlined />}>
									<Link to='/login'>Login</Link>
								</Menu.Item>
							)}
						</Menu>
					</div>
				</Header>
				<Content style={{ padding: "0 50px" }}>
					<div className='site-layout-content' style={{ margin: "16px auto", maxWidth: "1200px" }}>
						<Routes>
							<Route path='/login' element={<Login setIsAuthenticated={setIsAuthenticated} />} />
							<Route path='/register' element={<Register />} />
							<Route path='/users' element={isAuthenticated ? <Users /> : <Navigate to='/login' />} />
							<Route
								path='/products'
								element={isAuthenticated ? <Products /> : <Navigate to='/login' />}
							/>
							<Route path='/orders' element={isAuthenticated ? <Orders /> : <Navigate to='/login' />} />
							<Route
								path='/'
								element={isAuthenticated ? <Navigate to='/users' /> : <Navigate to='/login' />}
							/>
						</Routes>
					</div>
				</Content>
			</Layout>
		</Router>
	)
}

export default App
