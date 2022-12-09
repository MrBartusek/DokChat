import React, { useContext, useEffect, useState } from 'react';
import Image, { ImageProps } from 'react-bootstrap/Image';
import { OnlineManagerContext } from '../../context/OnlineManagerContext';
import './ProfilePicture.scss';

interface ProfilePictureProps extends ImageProps {
    src: string,
    size?: string | number,
	userId?: string,
	showStatus?: boolean
	onClick?: React.MouseEventHandler<HTMLImageElement>
}

function ProfilePicture(props: ProfilePictureProps) {
	const pictureSize = props.size || 38;
	const getOnlineStatus = useContext(OnlineManagerContext);
	const [ isOnline, setOnline ] = useState(false);

	useEffect(() => {
		if(!props.showStatus) return setOnline(false);
		const [ online ] = getOnlineStatus(props.userId);
		setOnline(online);
	}, [ getOnlineStatus, props.showStatus ]);

	const passProps = Object.assign({}, props);
	delete passProps.showStatus;
	delete passProps.userId;

	return (
		<div className='position-relative'>
			<Image
				roundedCircle
				className={`bg-light ${props.onClick ? 'clickable-profile-picture' : ''}`}
				src={props.src}
				style={{
					height: pictureSize,
					width: pictureSize
				}}
				onClick={props.onClick}
				{...passProps}
			/>
			{isOnline && <div className='online-dot' aria-hidden="true"></div>}
		</div>
	);
}

export default ProfilePicture;
