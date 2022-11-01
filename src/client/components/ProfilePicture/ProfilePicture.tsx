import Image, { ImageProps } from 'react-bootstrap/Image';
import React from 'react';
import './ProfilePicture.scss';
import { IconType } from 'react-icons';

interface ProfilePictureProps extends ImageProps {
    src: string,
    size?: string | number,
	onClick?: React.MouseEventHandler<HTMLImageElement>
}

function ProfilePicture(props: ProfilePictureProps) {
	const pictureSize = props.size || 38;
	return (
		<Image
			roundedCircle
			className={`bg-light ${props.onClick ? 'clickable-profile-picture' : ''}`}
			src={props.src}
			style={{
				height: pictureSize,
				width: pictureSize
			}}
			onClick={props.onClick}
			{...props}
		/>
	);
}

export default ProfilePicture;
