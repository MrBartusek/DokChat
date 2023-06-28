import React, { useContext } from 'react';
import ReCAPTCHA, { ReCAPTCHAProps } from 'react-google-recaptcha';
import { RECAPTCHA_SITE_KEY } from '../../config';
import { SettingsContext } from '../../context/ThemeContext';

export interface DokChatCaptchaProps extends Omit<ReCAPTCHAProps, 'sitekey' | 'size'> { }

const DokChatCaptcha = React.forwardRef((props, ref) => {
	const [ settings ] = useContext(SettingsContext);

	return (
		<ReCAPTCHA
			sitekey={RECAPTCHA_SITE_KEY}
			size="invisible"
			theme={settings.theme as any}
			type="image"
			badge="bottomright"
			ref={ref as any}
			{...props}
		/>
	);
});

DokChatCaptcha.displayName  = 'DokChatCaptcha';

export default DokChatCaptcha;
