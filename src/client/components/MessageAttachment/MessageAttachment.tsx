import React from 'react';
import { Spinner } from 'react-bootstrap';
import { BsExclamationSquare } from 'react-icons/bs';
import { LocalMessage } from '../../types/Chat';

export interface MessageAttachmentProps {
    message: LocalMessage
}

export default function MessageAttachment({ message } : MessageAttachmentProps) {
	const isSent = !(message.isPending || message.isFailed);

	if(isSent) {
		return (
			<img
				src={`/api/attachment?id=${message.id}`}
				style={{borderRadius: '1.2rem', maxHeight: 230, width: '100%'}}
				alt='Message attachment'
			/>
		);
	}
	else {
		return (
			<div style={{borderRadius: '1.2rem', height: 200, width: 100}} className='d-flex justify-content-center align-items-center'>
				{message.isPending && !message.isFailed && (
					<Spinner variant='light' animation='border' />
				)}
				{message.isFailed && (
					<BsExclamationSquare />
				)}
			</div>
		);
	}
}
