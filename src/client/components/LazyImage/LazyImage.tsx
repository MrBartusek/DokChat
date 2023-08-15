import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';

export interface LazyImageProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> { }

export default function LazyImage(props: LazyImageProps) {
	const [ loaded, setLoaded ] = useState(false);

	useEffect(() => {
		setLoaded(false);
	}, [ props.src ]);

	return (
		<>
			<img
				{...props}
				onLoad={() => setLoaded(true)}
				onError={() => setLoaded(true)}
				style={{display: loaded ? 'inherit' : 'none' }}
			/>
			{!loaded && <Spinner animation="border" variant='secondary' role="status" aria-hidden="true" />}
		</>
	);
}
