import React from 'react';
import DownloadHeader from '../components/DownloadHeader/DownloadHeader';
import Layout from '../components/Layout/Layout';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

function DownloadPage() {
	return (
		<Layout zeroHeightNavbar>
			<ScrollToTop />
			<DownloadHeader />
		</Layout>
	);
}

export default DownloadPage;
