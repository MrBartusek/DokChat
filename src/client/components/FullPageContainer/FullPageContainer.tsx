import React, { useEffect, useState } from 'react';
import { Container, ContainerProps } from 'react-bootstrap';

export interface FullPageContainerProps extends ContainerProps {
	children: JSX.Element | JSX.Element[];
	className?: string;
}

function FullPageContainer(props: FullPageContainerProps) {
	const [innerHeight, setInnerHeight] = useState(window.innerHeight);

	useEffect(() => {
		function handleResize() {
			setInnerHeight(window.innerHeight);
		}

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<Container
			{...props}
			fluid
			style={{
				minHeight: 0,
				overflowX: 'hidden',
				maxHeight: innerHeight,
				height: innerHeight
			}}
			className={`fullPageContainer ${props.className || ''}`}
		>
			{props.children}
		</Container>
	);
}

export default FullPageContainer;
