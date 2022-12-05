import React, { useContext, useEffect } from 'react';
import Modal, { ModalProps } from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import { SettingsContext } from '../../context/ThemeContext';
import { Theme, useSettings } from '../../hooks/useSettings';

interface PopupProps extends ModalProps {
	title: string;
	footer: JSX.Element | JSX.Element[];
	static?: boolean;
	setHandleClose?: (func: () => void) => void;
	children: JSX.Element | JSX.Element[];
}

function Popup(props: PopupProps) {
	const navigate = useNavigate();
	const handleClose = () => navigate('/chat');
	const [ settings ] = useContext(SettingsContext);

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
			data-theme={settings.theme}
		>
			<Modal.Header closeButton={!props.static} closeVariant={settings.theme == Theme.DARK ? 'white' : null}>
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
