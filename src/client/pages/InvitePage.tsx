import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import './InvitePage.scss';

function InvitePage(): JSX.Element {
	const { key } = useParams();

	return (
		<Navigate to={`/chat/invite/${key}`} />
	);
}

export default InvitePage;
