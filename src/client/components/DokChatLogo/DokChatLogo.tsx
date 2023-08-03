import React from 'react';

interface DokChatLogoProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
	variant?: 'black' | 'white' | 'blue';
}

export default function DokChatLogo(props: DokChatLogoProps) {
	return (
		<img {...props} src={`./img/logo/dokchat-logo-${props.variant || 'blue'}.png`} alt="DokChat logo" />
	);
}
