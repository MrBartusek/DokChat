import React from 'react';
import { Stack } from 'react-bootstrap';
import { ChatParticipant } from '../../../types/common';
import { LocalChat } from '../../types/Chat';
import ParticipantCard from '../ParticipantCard/ParticipantCard';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';

export interface ChatParticipantsTabProps {
	currentChat: LocalChat,
	participants?: ChatParticipant[]
}

export default function ChatParticipantsTab({ participants, currentChat }: ChatParticipantsTabProps) {

	if(!participants) return <SimpleLoading />;

	return (
		<Stack className='overflow-auto'>
			{participants.map((part, i) => (
				<ParticipantCard key={i} participant={part} currentChat={currentChat} />
			))}
		</Stack>
	);
}
