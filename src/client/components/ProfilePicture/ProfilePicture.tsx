import React from 'react';
import Image, { ImageProps } from 'react-bootstrap/Image';
import './ProfilePicture.scss';

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
