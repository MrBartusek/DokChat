import React from 'react';
import ChangeableAvatar from '../ChangeableAvatar/ChangeableAvatar';
import { FileUploaderResult } from '../FileUploader/FileUploader';

export interface ObjectEditHeroProps {
    currentAvatar: string;
    avatarUploader: FileUploaderResult;
    setAvatarUploader: React.Dispatch<React.SetStateAction<FileUploaderResult>>;
    title: string | React.ReactNode;
    subTitle?: string;
}

export default function ObjectEditHero({ currentAvatar, avatarUploader, setAvatarUploader, title, subTitle }: ObjectEditHeroProps) {
	return (
		<div className='d-flex align-items-center flex-column mb-3'>
			<ChangeableAvatar
				size={90}
				currentAvatar={currentAvatar}
				fileUploader={avatarUploader}
				setFileUploader={setAvatarUploader}
			/>
			<span className='lead fw-bold mt-2 mx-1 d-flex align-items-center'>
				{title}
			</span>
			<p className="text-muted">
				{subTitle}
			</p>
		</div>
	);
}
