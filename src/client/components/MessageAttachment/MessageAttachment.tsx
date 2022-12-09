import { SourceType } from 'fslightbox-react';
import React, { useLayoutEffect, useRef, useState } from 'react';
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

	const MAX_ATTACHMENT_HEIGHT = 230;
	const attachmentHeight = Math.min(message.attachment.height || MAX_ATTACHMENT_HEIGHT, MAX_ATTACHMENT_HEIGHT);

	if(isSent) {
		const attachmentType = message.attachment.mimeType.split('/')[0];
		const attachmentUrl = `/api/attachment?id=${message.id}`;

		return (
			<div className='mw-100' style={{height: attachmentHeight}}>
				{attachmentType == 'audio' && (
					<audio src={attachmentUrl} controls>
						<a href={attachmentUrl}>
							Download audio
						</a>
					</audio>
				)}
				{attachmentType == 'video' && (
					<video controls className='h-100 mw-100' style={{borderRadius: '1.2rem'}}>
						<source src={attachmentUrl} type={message.attachment.mimeType} />
					</video>
				)}
				{attachmentType == 'image' && (
					<img
						src={attachmentUrl}
						style={{cursor: 'pointer', borderRadius: '1.2rem', maxHeight: '200px', maxWidth: '100%' }}
						className='h-100 w-100'
						alt='Message attachment'
						onClick={() => setShowLightbox(!showLightbox)}
					/>
				)}
				<Lightbox
					type={'image'}
					toggler={showLightbox}
					source={attachmentUrl}
				/>
			</div>
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
