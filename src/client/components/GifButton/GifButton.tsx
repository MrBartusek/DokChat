import GifPicker, { TenorImage } from 'gif-picker-react';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { AiOutlineGif } from 'react-icons/ai';
import { TENOR_API_KEY } from '../../config';
import { FileUploaderResult } from '../FileUploader/FileUploader';
import IconButton from '../IconButton/IconButton';

export interface EmojiButtonProps {
    fileUploader: FileUploaderResult;
    color?: string;
}

function GifButton({ fileUploader, color }: EmojiButtonProps) {
	async function handleGifClick(image: TenorImage) {
		// Workaround to close popover
		document.body.click();
		const file = await getFileFromUrl(image.url);
		fileUploader.setFile(file);
	}

	const gifPicker = (
		<Popover style={{maxWidth: 500}}>
			<Popover.Body className='p-0'>
				<GifPicker tenorApiKey={TENOR_API_KEY} onGifClick={handleGifClick} />
			</Popover.Body>
		</Popover>
	);

	return (
		<OverlayTrigger trigger="click" placement="top-start" overlay={gifPicker} rootClose>
			<IconButton icon={AiOutlineGif} size={34}  type='button' color={color} />
		</OverlayTrigger>
	);
}

async function getFileFromUrl(url: string): Promise<File> {
	const response = await fetch(url);
	const data = await response.blob();
	return new File([ data ], 'Tenor Gif', {
		type: data.type || 'image/gif'
	});
}

export default GifButton;
