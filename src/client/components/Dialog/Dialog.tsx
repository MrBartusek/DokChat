import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function Dialog() {
	const [show, setShow] = useState(true);

	const handleClose = () => setShow(false);

	return (

		<Modal show={show} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Modal heading</Modal.Title>
			</Modal.Header>
			<Modal.Body>Woohoo, youre reading this text in a modal!</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
                    Close
				</Button>
				<Button variant="primary" onClick={handleClose}>
                    Save Changes
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default Dialog;
