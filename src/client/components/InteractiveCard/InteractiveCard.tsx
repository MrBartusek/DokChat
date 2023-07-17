import React from 'react';
import { IconType } from 'react-icons';
import { BsChevronRight } from 'react-icons/bs';
import './InteractiveCard.scss';

export interface InteractiveCardProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	title: string,
	description?: string
	icon: IconType,
	iconColor?: string,
	disabled?: boolean,
	onClick?: React.MouseEventHandler<HTMLButtonElement>,
	showArrow?: boolean
}

const InteractiveCard = React.forwardRef((props: InteractiveCardProps, ref: React.ForwardedRef<any>) => {
	const iconEl = React.createElement(
		props.icon, { size: 19 }
	);
	const passProps = Object.assign({}, props);
	delete passProps.icon;
	delete passProps.showArrow;
	delete passProps.iconColor;
	passProps.className += ` interactiveCard ${props.disabled ? 'disabled' : 'enabled'}`;
	return (
		<button ref={ref} {...passProps}>
			<div className='icon' style={{ color: props.iconColor }}>
				{iconEl}
			</div>
			<div className='d-flex flex-column flex-fill'>
				<div className='text-truncate text-nowrap text-start'>
					{props.title}
				</div>
				<div className='text-muted text-truncate text-start' style={{ fontSize: '0.85em' }}>
					{props.description}
				</div>
			</div>
			{props.showArrow && (
				<div className='arrow-right'>
					<BsChevronRight />
				</div>
			)}
		</button>
	);
});

InteractiveCard.displayName = 'IconButton';

export default InteractiveCard;
