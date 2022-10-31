import React from 'react';

interface SeparatorProps {
	width?: string | number
	height?: string | number
}

export default function Separator({ width, height }: SeparatorProps) {
	return (
		<div role='none' className='p-0' style={{minWidth: width || '100%', minHeight: height || '100%'}}></div>
	);
}
