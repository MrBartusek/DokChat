import React, { useContext, useState } from 'react';
import { Button } from 'react-bootstrap';

import { UserContext } from '../../context/UserContext';
import CopyButton from '../CopyButton/CopyButton';
import Popup from '../Popup/Popup';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

function SettingsPopup() {
	const [ user ] = useContext(UserContext);
	const [ handleClose, setHandleClose ] = useState<() => void>(null);

	return (
		<Popup
			title="Your profile"
			footer={(
				<Button variant='secondary' onClick={handleClose}>
					Close
				</Button>
			)}
			setHandleClose={setHandleClose}
		>
			<div className='d-flex align-items-center flex-column'>
				<ProfilePicture src={user.avatarUrl} size={80}/>
				<span className='lead fw-bold mt-2 d-flex align-items-center'>
					<span className='mx-1' style={{paddingLeft: 32}}>
						{user.username}
						<span className="text-muted">#{user.tag}</span>
					</span>
					<CopyButton copyText={user.discriminator} />
				</span>
				<p className="text-muted">
					Online
				</p>
			</div>
		</Popup>
	);
}

export default SettingsPopup;
