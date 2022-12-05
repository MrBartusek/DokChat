import React from 'react';
import { Portal } from 'react-portal';
import FsLightbox, { FsLightboxProps } from 'fslightbox-react';

export interface LightBoxProps extends Omit<FsLightboxProps, 'sources'> {
	source: string
}

export default function Lightbox(props: LightBoxProps) {
	return (
		<Portal>
			<FsLightbox
				sources={[ props.source ]}
				{...props}
			/>
		</Portal>
	);
}
