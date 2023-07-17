import React from 'react';
import ChangeableAvatar from '../ChangeableAvatar/ChangeableAvatar';
import CopyButton from '../CopyButton/CopyButton';
import { FileUploaderResult } from '../FileUploader/FileUploader';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
import Separator from '../Separator/Separator';

export interface OObjectHeroProps {
	currentAvatar: string;
	isOnline?: boolean;
	avatarUploader?: FileUploaderResult;
	setAvatarUploader?: React.Dispatch<React.SetStateAction<FileUploaderResult>>;
	title: string | React.ReactNode;
	subTitle?: string;
	copyText?: string;
}

export default function ObjectHero({ currentAvatar, avatarUploader, setAvatarUploader, title, subTitle, copyText, isOnline }: OObjectHeroProps) {
	return (
		<div className='d-flex align-items-center flex-column mb-3'>
			{avatarUploader && setAvatarUploader ? (
				<ChangeableAvatar
					size={90}
					currentAvatar={currentAvatar}
					fileUploader={avatarUploader}
					setFileUploader={setAvatarUploader}
				/>
			) : (
				<ProfilePicture
					size={90}
					src={currentAvatar}
				/>
			)}
			<span className='lead fw-bold mt-2 mx-1 d-flex align-items-center'>
				{copyText && <Separator width={32} />}
				{title}
				{copyText && <CopyButton copyText={copyText} />}
			</span>
			<p className="text-muted">
				{subTitle}
			</p>
		</div>
	);
}
