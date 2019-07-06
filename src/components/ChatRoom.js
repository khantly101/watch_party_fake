import React         	from 'react'
import ReactJWPlayer 	from 'react-jw-player'
import io				from 'socket.io-client'

let savedLogin = localStorage.getItem('Data') ? JSON.parse(localStorage.getItem('Data')) : {}

class ChatRoom extends React.Component {
	state = {
		socket: io('http://localhost:3003'),
		partyRooms:[],
		partyRoomIndex: '',
		userName: savedLogin.currentUser,
		pic: savedLogin.img,
		chatMessage: '',
		playerScript: 'https://cdn.jwplayer.com/libraries/7q9W8HVG.js',
		file: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
		playerImg: 'https://drive.google.com/file/d/1l64bgzH-Y9ztqQKrDkT716_zikQnhACg/view',
		playerId: '',
		clients: []
	}

	componentWillMount() {
		this.checkRoute()

		console.log(this.props.location.state.currentUser)

		const { rooms } = this.props.location.state
		const { index } = this.props.location.state

		this.setState({
			partyRooms: rooms,
			partyRoomIndex: index
		}, () => {
			console.log(this.state.partyRooms)
			console.log(this.state.partyRoomIndex)

		})

		console.log(this.props.location.state.creator)
	}

	checkRoute() {
		if (!this.props.location.state) {
			window.location.href = '/'
		}
	}

	socketConnect = (theRoom, roomIndex, userName, pic, socket) => {
			this.state.socket.on('connect', function() {
				console.log(`Connection made`)
				console.log(`On Connection ` + theRoom)
				console.log(`On Connection ` + userName)
				console.log(`On Connection ` + pic)
				console.log(socket.id + ' ' + socket.disconnected)
				socket.emit('clientData',theRoom,roomIndex,userName,pic,socket.id )

				// Connected, let's sign-up for to receive messages for this room
				socket.emit('room', theRoom, roomIndex, userName, pic, socket.id)
			})

		}
		deleteClient = () => {

		}

	componentDidMount() {

		this.socketConnect(this.state.partyRooms[this.state.partyRoomIndex], this.state.partyRoomIndex, this.state.userName, this.state.pic,this.state.socket)

		this.state.socket.on(`addToList`, (msg, partyRoom, roomIndex, activeClients) => {

			console.log(`newClient`)
			console.log(activeClients)

			this.setState({
				clients: activeClients
			})
		})
		this.state.socket.on(`deleteFromList`, (msg,clientId) => {

			console.log(clientId + ' ' + msg)
			let deleteClient = [...this.state.clients]

			const index = deleteClient.map(theClient => theClient.sockId).indexOf(clientId)
			deleteClient.splice(index, 1)

			this.setState({
				clients: [deleteClient]
			}, () => {
				console.log(`new clients array`)
				console.log(this.state.clients)
			})
			deleteClient.filter((theClient) => {
				return theClient.sockId === clientId
			})

			alert(msg + 'at index' + index)
		})

		//Listening to responses sent from server
		this.state.socket.on(`recieveMessage`, (msg,pic,userName) => {
				 //Looking to see if we get responses back from server
				 // console.log(msg)
				 let newObject = {
					 pic: pic,
					 userName: userName,
					 message: msg
				 }
				 let partyRooms = [...this.state.partyRooms]
				 partyRooms[this.state.partyRoomIndex].messages.push(newObject)
				 this.setState({
					 partyRooms:[...this.state.partyRooms]
				 }, () => {
				 	console.log(this.state.partyRooms[this.state.partyRoomIndex].messages)
				 })
			 })

		this.state.socket.on(`play`, (msg,playerId) => {
			// console.log('Triggering ' +	msg)
			// console.log('Triggering ' + playerId)
			window.jwplayer().play()
		})

		this.state.socket.on(`stop`, (msg,playerId) => {
	 	 	// console.log('Triggering ' +	msg)
	 		// console.log('Triggering ' + playerId)
	 		window.jwplayer().stop()
 		})
	}

	componentWillUnmount() {

		this.state.socket.close()
	}

	handleChange = (event) => {
		this.setState({ [event.target.id]: event.target.value})
	}

	handleSubmit = (event) => {
		event.preventDefault()
		this.state.socket.emit(`sendMessage`, this.state.chatMessage,this.state.partyRooms[this.state.partyRoomIndex]._id,this.state.pic,this.state.userName)
		this.setState({
			chatMessage: ''
		})
	}

	sendPlay = (playerId) => {
		// console.log(`Sending ` + playerId)
		console.log(this.state.partyRooms[this.state.partyRoomIndex]._id)
		this.state.socket.emit(`play`, `sendPlay` ,this.state.partyRooms[this.state.partyRoomIndex]._id,playerId)
	}

	sendStop = (playerId) => {
		// console.log(`Sending ` + playerId)
		this.state.socket.emit(`stop`, `sendStop` ,this.state.partyRooms[this.state.partyRoomIndex]._id,playerId)
	}

	render() {

		return (
			<React.Fragment>
				<div className='row chatRow justify-content-around'>
				 	<div className='col-8'>
						<ReactJWPlayer
							playerId= { this.state.playerId }
							playerScript= {this.state.playerScript}
							file= {
											(this.state.partyRooms[this.state.partyRoomIndex].upload)?
												this.state.partyRooms[this.state.partyRoomIndex].upload:
												this.state.file
										}
						/>

						{
							(this.props.location.state.currentUser !== this.props.location.state.creator)?
							null:<button onClick={ () => { this.sendPlay() } }>Play Video</button>
						}
						{
							(this.props.location.state.currentUser !== this.props.location.state.creator)?
							null:<button onClick={ () => { this.sendStop() } }>Stop Video</button>
						}

					</div>
					<div className='col-3 bg-info'>
						<div className='chatBox'>
							{this.state.partyRooms[this.state.partyRoomIndex].messages.map((theMessage, index) => {
								return (
										<div key={index}>
											<div className='row'>
												<img className='img-thumbnail rounded chatPic col-2' src={theMessage.pic} alt='Missing' />
												<p className='col-9 align-self-center chatText text-wrap'>{theMessage.userName}</p>
											</div>
											<hr className="line" />
											<p>{theMessage.message}</p>
										</div>
									)
								})
							}
						</div>
						<div>
							<form onSubmit={this.handleSubmit} className='row'>
								<input type='text' className='form-control col-9' id='chatMessage' name='chatMessage' onChange={this.handleChange} value={this.state.chatMessage} placeholder='Type Message'/>
								<input type='submit' className='col-3' value='SEND'/>
							</form>
						</div>
					</div>
					<div>
						{this.state.clients.map((theClient, index) => {
							return (
								<div key={index}>
									<h1>This is current User List in Chat Room </h1>
									imagePlaceholder: {theClient.pic} username: {theClient.userName} socketId: {theClient.sockId} clientSocketIndex: {index}
								</div>
							)
						})}
					</div>
				</div>
			</React.Fragment>
		)
	}
}

export default ChatRoom
