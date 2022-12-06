import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { BsExclamationSquare } from 'react-icons/bs';
import { LocalMessage } from '../../types/Chat';
import Lightbox from '../Lightbox/Lightbox';

export interface MessageAttachmentProps {
    message: LocalMessage
}

export default function MessageAttachment({ message } : MessageAttachmentProps) {
	const [ showLightbox, setShowLightbox ] = useState(false);
	const isSent = !(message.isPending || message.isFailed);
	const attachmentUrl = `/api/attachment?id=${message.id}`;

	if(isSent) {
		return (
			<>
				<img
					src={attachmentUrl}
					style={{borderRadius: '1.2rem', maxHeight: 230, width: '100%', cursor: 'pointer'}}
					alt='Message attachment'
					onClick={() => setShowLightbox(!showLightbox)}
				/>
				<Lightbox
					type="image"
					toggler={showLightbox}
					source={attachmentUrl}
				/>
			</>
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
