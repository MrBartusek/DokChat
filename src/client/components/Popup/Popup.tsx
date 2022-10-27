import React, { useEffect } from 'react';
import Modal, { ModalProps } from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';

interface PopupProps extends ModalProps {
	title: string;
	footer: React.ReactElement;
	setHandleClose?: (func: () => void) => void;
}

function Popup(props: PopupProps) {
	const navigate = useNavigate();
	const handleClose = () => navigate('/chat');
	useEffect(() => {
		if(!props.setHandleClose) return;
		props.setHandleClose(() => handleClose);
	}, []);

	return (
		<Modal show={true} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title as={'div'}>
					{props.title}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{props.children}
			</Modal.Body>
			<Modal.Footer>
				{props.footer}
			</Modal.Footer>
		</Modal>
	);
}

export default Popup;
