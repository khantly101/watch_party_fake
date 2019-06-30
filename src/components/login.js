import React from 'react'

let baseURL = 'http://localhost:3003' 

class NewUser extends React.Component {
	state = {
		userName: '',
		password: ''
	}

	handleChange = (event) => {
		this.setState({ [event.target.id]: event.target.value})
	}

	handleSubmit = (event) => {
		event.preventDefault()
		fetch(baseURL + '/sessions', {
			method: 'POST',
			body: JSON.stringify(
				{
					userName: this.state.userName,
					password: this.state.password
				}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then (res => res.json())
		.then (resJson => {
			this.setState({
				userName: '',
				password: ''
			})
		}).catch (error => console.error({'Error': error}))
	}

	render () {
		return (
			<div>
				<form onSubmit={this.handleSubmit}>
					<label htmlFor="userName"></label>
					<input type="text" id="userName" name="userName" onChange={this.handleChange} value={this.state.userName} placeholder="userName"/>
					<label htmlFor="password"></label>
					<input type="password" id="password" name="password" onChange={this.handleChange} value={this.state.password} placeholder="password"/>
					<input type="submit" value="Log In"/>
				</form>
			</div>
		)
	}
}

export default NewUser