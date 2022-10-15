import Image, { ImageProps } from 'react-bootstrap/Image';
import React from 'react';

interface ProfilePictureProps extends ImageProps {
    src: string,
    size?: number
}

function ProfilePicture(props: ProfilePictureProps) {
	const pictureSize = props.size || 38;
	return (
		<Image
			roundedCircle
			className='bg-light'
			src={props.src}
			style={{
				height: pictureSize,
				width: pictureSize
			}}
			{...props}
		/>
	);
}

export default ProfilePicture;
