import React, { useEffect } from 'react';
import Modal, { ModalProps } from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';

interface PopupProps extends ModalProps {
	title: string;
	footer: React.ReactElement;
	static?: boolean;
	setHandleClose?: (func: () => void) => void;
	children: JSX.Element | JSX.Element[];
}

function Popup(props: PopupProps) {
	const navigate = useNavigate();
	const handleClose = () => navigate('/chat');
	useEffect(() => {
		if(!props.setHandleClose) return;
		props.setHandleClose(() => handleClose);
	}, []);

	return (
		<Modal
			show={true}
			onHide={handleClose}
			backdrop={(props.static && 'static') || true}
			keyboard={!props.static}
		>
			<Modal.Header closeButton={!props.static}>
				<Modal.Title
					as={'div'}
					style={!props.static ? {marginLeft: 22.9} : {}} // Even the space with close button
				>
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
