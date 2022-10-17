import React from 'react';
import { Container, ContainerProps } from 'react-bootstrap';
import './FullPageContainer.scss';

export interface FullPageContainerProps extends ContainerProps {
    children: JSX.Element | JSX.Element[];
	className?: string;
}

function FullPageContainer(props : FullPageContainerProps) {
	return (
		<Container
			{...props}
			fluid
			className={`fullPageContainer ${props.className}`}
		>
			{props.children}
		</Container>
	);
}

export default FullPageContainer;
