import React from 'react';
import { OverlayTrigger, TooltipProps } from 'react-bootstrap';
import { BsCheck, BsClipboard } from 'react-icons/bs';
import useCopy from '../../hooks/useCopy';
import IconButton from '../IconButton/IconButton';
import UpdatingTooltip from '../UpdatingTooltip/UpdatingTooltip';

interface CopyButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	copyText: string;
}

function CopyButton(props: CopyButtonProps) {
	const [ copied, copyAction ] = useCopy(props.copyText);

	const tooltip = (props: TooltipProps) => (
		<UpdatingTooltip {...props}>
			{copied ? 'Copied!' : 'Copy to clipboard'}
		</UpdatingTooltip>
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
