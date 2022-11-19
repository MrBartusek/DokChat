import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

export interface FileUploaderResult {
    click?: () => void;
    file?: File;
    getURL?: () => Promise<string>;
    getBase64?: () => Promise<string>;
}

interface FileUploaderProps {
    onChange: React.Dispatch<React.SetStateAction<FileUploaderResult>>
}

export default function FileUploader({ onChange }: FileUploaderProps) {
	const uploaderRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		onChange({ click: onClick });
	}, []);

	const onClick = () => uploaderRef.current.click();

	function getBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = error => reject(error);
		});
	}

	function getURL(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = error => reject(error);
		});
	}

	function onInputChange(event: ChangeEvent<HTMLInputElement>) {
		if (event.target.files && event.target.files[0]) {
			const file = event.target.files[0];
			return onChange({
				click: onClick,
				file: file,
				getBase64: () => getBase64(file),
				getURL: () => getURL(file)
			});
		}
		onChange({ click: onClick });
	}

	return (
		<input
			type="file"
			accept="image/*"
			ref={uploaderRef}
			style={{display: 'none'}}
			onChange={onInputChange}
		/>
	);
}
