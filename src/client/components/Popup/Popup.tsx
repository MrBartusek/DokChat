import React, { useContext, useEffect } from 'react';
import Modal, { ModalProps } from 'react-bootstrap/Modal';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { SettingsContext } from '../../context/ThemeContext';
import { Theme } from '../../hooks/useSettings';
import InteractiveButton from '../InteractiveButton/InteractiveButton';

interface PopupProps extends ModalProps {
	title: string;
	footer?: JSX.Element | JSX.Element[];
	static?: boolean;
	setHandleClose?: (func: () => void) => void;
	children: JSX.Element | JSX.Element[];
}

function Popup(props: PopupProps) {
	const navigate = useNavigate();
	const handleClose = () => navigate('/chat');
	const [settings] = useContext(SettingsContext);

	useEffect(() => {
		if (!props.setHandleClose) return;
		props.setHandleClose(() => handleClose);
	}, []);

	const closeVariant = settings.theme == Theme.DARK ? 'white' : null;

	return (
		<Modal
			show={true}
			onHide={handleClose}
			backdrop={(props.static && 'static') || true}
			keyboard={!props.static}
			data-theme={settings.theme}
		>
			<ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => (
				<>
					<Modal.Header closeButton={true} closeVariant={closeVariant}>
						<Modal.Title>Error</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						Failed to render this popup at this time. Please try again later.
					</Modal.Body>
					<Modal.Footer>
						<InteractiveButton onClick={handleClose}>
							Close
						</InteractiveButton>
					</Modal.Footer>
				</>
			)}>
				<Modal.Header closeButton={!props.static} closeVariant={closeVariant}>
					<Modal.Title
						as={'div'}
						style={!props.static ? { marginLeft: 22.9 } : {}} // Even the space with close button
					>
						{props.title}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{props.children}
				</Modal.Body>
				{props.footer && (
					<Modal.Footer>
						{props.footer}
					</Modal.Footer>
				)}
			</ErrorBoundary>
		</Modal>
	);
}

export default Popup;
