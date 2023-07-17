import React from 'react';
import { toArray, Twemoji } from 'react-emoji-render';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './DokChatMarkdown.scss';

export interface DokChatMarkdownProps {
	text: string;
	className: string;
}

export default function DokChatMarkdown({ text, className }: DokChatMarkdownProps): JSX.Element {
	const parseEmojis = (value: string): JSX.Element => {
		const emojisArray = toArray(value);

		const newValue = emojisArray.reduce((previous: React.ReactElement, current: React.ReactElement) => {
			if (typeof current === 'string') {
				return (
					<>
						{previous}
						<ReactMarkdown
							allowedElements={['a', 'strong', 'em', 'del', 'pre', 'code', 'blockquote']}
							unwrapDisallowed
							className={'dokchat-markdown-element' + className}
							linkTarget="_blank"
							remarkPlugins={[remarkGfm]}
						>
							{current}
						</ReactMarkdown>
					</>

				);
			}
			return (
				<>
					{previous}
					<Twemoji text={current.props.children} />
				</>
			);
		}, '');

		return newValue as JSX.Element;
	};

	return parseEmojis(text);
}
