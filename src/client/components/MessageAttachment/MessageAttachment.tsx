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

	if(isSent) {
		const attachmentType = message.attachment.mimeType.split('/')[0];
		const attachmentUrl = `/api/attachment?id=${message.id}`;

		return (
			<div className='my-1'>
				{attachmentType == 'audio' && (
					<audio src={attachmentUrl} controls>
						<a href={attachmentUrl}>
							Download audio
						</a>
					</audio>
				)}
				{attachmentType == 'video' && (
					<video width="100%" height={260} controls>
						<source src={attachmentUrl} type={message.attachment.mimeType} />
					</video>
				)}
				{attachmentType == 'image' && (
					<img
						src={attachmentUrl}
						style={{borderRadius: '1.2rem', maxHeight: 260, width: '100%', cursor: 'pointer'}}
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
