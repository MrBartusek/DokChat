import React, { ChangeEvent, useEffect, useRef } from 'react';

export interface FileUploaderResult {
    click?: () => void;
	reset?: () => void;
    file?: File;
    getURL?: () => Promise<string>;
    getBase64?: () => Promise<string>;
}

interface FileUploaderProps {
    onChange: React.Dispatch<React.SetStateAction<FileUploaderResult>>
}

export default function FileUploader({ onChange }: FileUploaderProps) {
	const uploaderRef = useRef<HTMLInputElement>(null);

	useEffect(() => resetHook(), []);
	const resetHook = () => onChange({ click: onClick, reset: onReset });

	const onClick = () => uploaderRef.current.click();
	function onReset() {
		uploaderRef.current.value = null;
		resetHook();
	}

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
				reset: onReset,
				file: file,
				getBase64: () => getBase64(file),
				getURL: () => getURL(file)
			});
		}
		resetHook();
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
