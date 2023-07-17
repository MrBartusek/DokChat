import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

export interface MaskedTextProps {
	masked: string;
	text: string;
}

export default function MaskedText({ masked, text }: MaskedTextProps) {
	const [ show, setShow ] = useState(false);
	return (
		<span className='text-nowrap'>
			<span className='text-muted'> {show ? text : masked}</span>
			&nbsp;
			<Button variant='link' className='link-secondary' onClick={() => setShow(!show)}>
				{show ? 'Hide' : 'Show'}
			</Button>
		</span>
	);
}
