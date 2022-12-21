import React, { useContext } from 'react';
import { Stack } from 'react-bootstrap';
import { BsDoorClosed, BsGear, BsInfo, BsInfoCircle } from 'react-icons/bs';
import { ChatParticipant } from '../../../types/common';
import { UserContext } from '../../context/UserContext';
import { LocalChat } from '../../types/Chat';
import IconButton from '../IconButton/IconButton';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';
import { UserCard } from '../UserList/UserList';

export interface ChatParticipantsTabProps {
	currentChat: LocalChat,
	participants?: ChatParticipant[]
}

export default function ChatParticipantsTab({ participants, currentChat }: ChatParticipantsTabProps) {
	const [ user ] = useContext(UserContext);

	if(!participants) return <SimpleLoading />;

	return (
		<Stack>
			{participants.map((part, i) => (
				<UserCard user={part} key={i} icons={(
					<span className='d-flex flex-row'>
						<IconButton icon={BsInfoCircle} size={34} />
						{part.userId !== user.id && currentChat.isGroup && (
							<IconButton icon={BsDoorClosed} size={34} />
						)}
					</span>
				)} />
			))}
		</Stack>
	);
}
