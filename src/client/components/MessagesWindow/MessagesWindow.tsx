import React from 'react';
import { Row, Stack } from 'react-bootstrap';

function MessagesWindow() {
	return (
		<Row className='d-flex flex-grow-1'>
			<Stack style={{'flexDirection': 'column-reverse'}}>
				<Message />
				<Message />
			</Stack>
		</Row>
	);
}

function Message() {
	return (
		<div>
			message
		</div>
	);

}

export default MessagesWindow;
