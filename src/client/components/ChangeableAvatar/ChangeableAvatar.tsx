import React, { useEffect, useState } from 'react';
import FileUploader, { FileUploaderResult } from '../FileUploader/FileUploader';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

export interface ChangeableAvatarProps {
	fileUploader: FileUploaderResult;
	setFileUploader: React.Dispatch<React.SetStateAction<FileUploaderResult>>;
	currentAvatar: string;
	size?: number;
}

export default function ChangeableAvatar({ size, fileUploader, setFileUploader, currentAvatar }: ChangeableAvatarProps) {
	const [ uploadedAvatar, setUploadedAvatar ] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			if (fileUploader.file) {
				const url = await fileUploader.getURL();
				setUploadedAvatar(url);
			}
			else {
				setUploadedAvatar(null);
			}

		})();
	}, [ fileUploader ]);

	return (
		<>
			<ProfilePicture
				src={uploadedAvatar || currentAvatar}
				size={size}
				onClick={() => fileUploader.click()}
			/>
			<FileUploader onChange={setFileUploader} />
		</>
	);
}
