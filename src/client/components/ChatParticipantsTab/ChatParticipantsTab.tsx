import React from 'react';
import { ChatParticipant } from '../../../types/common';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';
import UserList from '../UserList/UserList';

export interface ChatParticipantsTabProps {
	participants?: ChatParticipant[]
}

export default function ChatParticipantsTab({ participants }: ChatParticipantsTabProps) {
	if(!participants) return <SimpleLoading />;
	return (
		<UserList users={participants} />
	);
}
