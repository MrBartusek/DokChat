import React, { useContext } from 'react';
import ReCAPTCHA, { ReCAPTCHAProps } from 'react-google-recaptcha';
import { SettingsContext } from '../../context/ThemeContext';
import { useClientConfig } from '../../hooks/useClientConfig';

export interface DokChatCaptchaProps extends Omit<ReCAPTCHAProps, 'sitekey' | 'size'> { }

const DokChatCaptcha = React.forwardRef((props, ref) => {
	const [settings] = useContext(SettingsContext);
	const clientConfig = useClientConfig();

	if (!clientConfig.recaptchaSiteKey) return <></>;

	return (
		<ReCAPTCHA
			sitekey={clientConfig.recaptchaSiteKey}
			size="invisible"
			theme={settings.theme as any}
			type="image"
			badge="bottomright"
			ref={ref as any}
			{...props}
		/>
	);
});

DokChatCaptcha.displayName = 'DokChatCaptcha';

export default DokChatCaptcha;
