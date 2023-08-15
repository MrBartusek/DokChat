import React, { useState } from 'react';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';
import TwoFactorCodeInput from '../TwoFactorCodeInput/TwoFactorCodeInput';
import Separator from '../Separator/Separator';

interface TwoFactorAuthenticationPopupProps {
    setCode: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    handleSubmit?: React.FormEventHandler<HTMLFormElement>;
    error?: string;
}

function TwoFactorLoginPopup({setCode, error, isLoading, handleSubmit}: TwoFactorAuthenticationPopupProps) {
	return (
		<Popup
			title='Two Factor Authentication'
			footer={<Separator height={'1em'}/>}
		>
			<div className='text-muted'>
				This account is protected by Two-Factor authentication (2FA). Please
                insert 6-digit code from your authenticator app below.
			</div>
			<TwoFactorCodeInput setCode={setCode} isLoading={isLoading} handleSubmit={handleSubmit} />
			{error && <span className='text-danger'>{error}</span>}
		</Popup>
	);
}

export default TwoFactorLoginPopup;
