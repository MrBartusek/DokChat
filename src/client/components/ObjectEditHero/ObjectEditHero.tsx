import React from 'react';
import ChangeableAvatar from '../ChangeableAvatar/ChangeableAvatar';
import CopyButton from '../CopyButton/CopyButton';
import { FileUploaderResult } from '../FileUploader/FileUploader';

export interface ObjectEditHeroProps {
    currentAvatar: string;
    avatarUploader: FileUploaderResult;
    setAvatarUploader: React.Dispatch<React.SetStateAction<FileUploaderResult>>;
    title: string | React.ReactNode;
    subTitle?: string;
	copyText?: string;
}

export default function ObjectEditHero({ currentAvatar, avatarUploader, setAvatarUploader, title, subTitle, copyText }: ObjectEditHeroProps) {
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
				{copyText && <CopyButton copyText={copyText} />}
			</span>
			<p className="text-muted">
				{subTitle}
			</p>
		</div>
	);
}
