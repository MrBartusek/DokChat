import React from 'react';
import { OverlayTrigger, Tooltip, TooltipProps } from 'react-bootstrap';
import { BsCheck, BsClipboard } from 'react-icons/bs';
import useCopy from '../../hooks/useCopy';
import IconButton, { IconButtonProps } from '../IconButton/IconButton';

interface CopyButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	copyText: string;
}

function CopyButton(props: CopyButtonProps) {
	const [ copied, copyAction ] = useCopy(props.copyText);

	const tooltip = (props: TooltipProps) => (
		<Tooltip {...props}>
			Copy to clipboard
		</Tooltip>
	);

	const propsCopy = Object.assign({}, props);
	delete propsCopy.copyText;
	return (
		<OverlayTrigger placement='top' overlay={tooltip}>
			<IconButton
				icon={copied ? BsCheck : BsClipboard}
				onClick={copyAction}
				size={32}
				{...propsCopy as any}
			/>
		</OverlayTrigger>
	);
}

export default CopyButton;
