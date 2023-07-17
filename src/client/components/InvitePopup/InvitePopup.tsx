import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import InviteConfirm from '../InviteConfirm/InviteConfirm';
import Popup from '../Popup/Popup';

function InvitePopup() {
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const { key } = useParams();

	return (
		<Popup title='Invite' setHandleClose={setHandleClose}>
			<InviteConfirm handleClose={handleClose} inviteKey={key} />
		</Popup>
	);
}

export default InvitePopup;
