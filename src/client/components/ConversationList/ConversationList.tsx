import React from 'react';
import { Col, Row, Stack, Image } from 'react-bootstrap';
import { ChatListResponse, EndpointResponse } from '../../../types/endpoints';
import { useFetch } from '../../hooks/useFetch';
import LoadingWrapper from '../LoadingWrapper/LoadingWrapper';
import './ConversationList.scss';

function ConversationList() {
	const chatList = useFetch<EndpointResponse<ChatListResponse>>('chat/list', true);

	return (
		<Row className='h-100'>
			<LoadingWrapper loading={chatList.loading}>
				<Stack gap={1} className="align-items-center py-1">
					{chatList.res?.data.map((chat) => (
						<Conversation
							key={chat.id}
							avatar={chat.avatar}
							name={chat.title}
							lastMessage={chat.lastMessage}
						/>
					))}
				</Stack>
			</LoadingWrapper>
		</Row>
	);
}

interface ConversationProps {
    avatar: string,
	name: string,
	lastMessage: {
		content: string,
		author: string
	}
}

function Conversation(props: ConversationProps) {
	return (
		<Row className='conversation p-1 flex-row rounded-3 w-100' style={{height: 65}}>
			<Col xs='auto' className="d-flex align-items-center">
				<Image roundedCircle src={props.avatar} style={{height: '48px'}} />
			</Col>
			<Col xs='auto' className='d-flex justify-content-center flex-column py-0 px-1'>
				<div className='fw-bold'>
					{props.name}
				</div>
				<div className='text-muted text-truncate' style={{'fontSize': '0.85em'}}>
					{props.lastMessage ? (
						<span>{props.lastMessage.author}: s {props.lastMessage.content}</span>
					): 'Click to start the conversation!'}

				</div>
			</Col>
		</Row>
	);
}

export default ConversationList;
