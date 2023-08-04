import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

function InvitePage(): JSX.Element {
	const { key } = useParams();

	return (
		<Navigate to={`/chat/invite/${key}`} />
	);
}

export default InvitePage;
