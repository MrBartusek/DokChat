
import { useEffect, useState } from 'react';

export function useDocumentReady(): boolean {
	const [ documentState, setDocumentState ] = useState(document.readyState);

	useEffect(() => {
		document.addEventListener('readystatechange', readyStateChange);
		return () => {
			document.removeEventListener('readystatechange', readyStateChange);
		};
	}, []);

	function readyStateChange() {
		setDocumentState(document.readyState);
	}

	return documentState == 'complete';
}
