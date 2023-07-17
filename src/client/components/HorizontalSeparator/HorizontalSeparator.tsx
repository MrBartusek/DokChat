import React from 'react';
import './HorizontalSeparator.scss';

export interface HorizontalSeparatorProps {
	text: string
}

export default function HorizontalSeparator({ text }: HorizontalSeparatorProps) {
	return (
		<div className='horizontal-separator my-3'>
			{text}
		</div>
	);
}
