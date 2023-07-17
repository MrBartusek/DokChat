import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { BsExclamationSquare } from 'react-icons/bs';
import { LocalMessage } from '../../types/Chat';
import Lightbox from '../Lightbox/Lightbox';

export interface MessageAttachmentProps {
	message: LocalMessage
}

export default function MessageAttachment({ message }: MessageAttachmentProps) {
	const [showLightbox, setShowLightbox] = useState(false);
	const isSent = !(message.isPending || message.isFailed);

	if (isSent) {
		const attachmentType = message.attachment.mimeType.split('/')[0];
		const attachmentUrl = `/api/attachment?id=${message.id}`;

		return (
			<div className='mw-100 fs-6 d-flex' style={{ maxHeight: '200px' }}>
				{attachmentType == 'audio' && (
					<audio src={attachmentUrl} controls>
						<a href={attachmentUrl}>
							Download audio
						</a>
					</audio>
				)}
				{attachmentType == 'video' && (
					<video
						controls
						style={{ borderRadius: '1.2rem', maxHeight: '200px' }}
						height={200}
						className='w-auto'
					>
						<source src={attachmentUrl} type={message.attachment.mimeType} />
					</video>
				)}
				{attachmentType == 'image' && (
					<img
						src={attachmentUrl}
						style={{ cursor: 'pointer', borderRadius: '1.2rem', maxHeight: '200px' }}
						height={message.attachment.height}
						width={message.attachment.width}
						className='w-auto'
						alt='Message attachment failed to load'
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
			<div style={{ borderRadius: '1.2rem', height: 200, width: 100 }} className='d-flex justify-content-center align-items-center'>
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
