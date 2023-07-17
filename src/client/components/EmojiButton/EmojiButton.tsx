import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import React, { useContext } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { BsEmojiSmileFill } from 'react-icons/bs';
import { SettingsContext } from '../../context/ThemeContext';
import IconButton from '../IconButton/IconButton';

export interface EmojiButtonProps {
	onEmojiClick?: ((emoji: EmojiClickData, event: MouseEvent) => void);
	color?: string;
}

function EmojiButton({ onEmojiClick, color }: EmojiButtonProps) {
	const [ settings ] = useContext(SettingsContext);

	const emojiPicker = (
		<Popover style={{ maxWidth: 500 }} className="bg-transparent">
			<Popover.Body className='p-0'>
				<EmojiPicker
					lazyLoadEmojis={true}
					emojiStyle={EmojiStyle.TWITTER}
					previewConfig={{ showPreview: false }}
					theme={settings.theme as any}
					onEmojiClick={onEmojiClick}
				/>
			</Popover.Body>
		</Popover>
	);

	return (
		<OverlayTrigger trigger="click" placement="top-end" overlay={emojiPicker} rootClose>
			<IconButton icon={BsEmojiSmileFill} size={32} type='button' color={color} />
		</OverlayTrigger>
	);
}

export default EmojiButton;
