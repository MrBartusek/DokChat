import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { Theme } from 'emoji-picker-react';
import Utils from '../../helpers/utils';

interface DokChatLogoProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
	variant?: 'black' | 'white' | 'blue' | 'auto';
}

export default function DokChatLogo(props: DokChatLogoProps) {
	const [ settings ] = useSettings();

	let variant = props.variant;

	if(variant == 'auto') {
		variant = settings.theme == Theme.LIGHT ? 'blue' : 'white';
	}
	return (
		<img {...props} src={Utils.getBaseUrl() + `/img/logo/dokchat-logo-${variant || 'blue'}.png`} alt="DokChat logo" />
	);
}
