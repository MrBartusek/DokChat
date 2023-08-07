import React from 'react';
import { Container } from 'react-bootstrap';
import Layout from '../components/Layout/Layout';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import { usePageInfo } from '../hooks/usePageInfo';

function PrivacyPolicyPage() {

	usePageInfo({
		title: 'Privacy Policy'
	});

	return (
		<Layout>
			<ScrollToTop />
			<Container className='my-5'>
				<h1 className='mb-3'>Privacy Policy for DokChat</h1>

				<p>
					At DokChat, accessible from <a href="https://dokchat.dokurno.dev/">https://dokchat.dokurno.dev/</a>,
					one of our main priorities is the privacy of our users. This Privacy Policy document contains types
					of information that is collected and recorded by DokChat and how we use it.
				</p>

				<p>
					If you have additional questions or require more information about our Privacy Policy, do
					not hesitate to contact us. You can contact DokChat support by e-mail address: {' '}
					<a href="mailto:dokchat@dokurno.dev">dokchat@dokurno.dev</a>
				</p>

				<h2 className='mb-3'>1. Personal information that we collect</h2>

				<p>
					We collect personal information that you voluntarily provide to us when you register on the Services,
					express an interest in obtaining information about us or our products and Services, when you participate in
					activities on the Services, or otherwise When you contact us.
					The personal information that we collect depends on the context of your interactions with us and the Services,
					the choices you make, and the products and features you use. The personal information we collect may include the
					following:
				</p>

				<ul>
					<li>E-mail address</li>
					<li>Username</li>
					<li>Password</li>
					<li>Created messages and attachments</li>
					<li>Behavior patterns</li>
				</ul>

				<p>
					We do not process sensitive information within the meaning of the GDPR.
				</p>

				<h2 className='mb-3'>2. Usage of Third-Party Login Providers</h2>

				<p>
					Our Services offer you the ability to register and log in using your third-party social
					media account details (like your Facebook or Google accounts). Where you choose to do this, we will
					receive certain profile information about you from your social media provider. The profile information
					we receive may vary depending on the social media provider concerned, but will often include your name,
					email address and profile picture, as well as other information you choose to make public on such a social
					media platform.
				</p>

				<p>
					We will use the information we receive only for the purposes that are described in this privacy notice or
					that are otherwise made clear to you on the relevant Services. Please note. that we do not control, and
					are not responsible for, other uses of your personal information by your third-party social media provider.
					We recommend that you review their privacy notice to understand how they collect, use, and share
					your personal information, and how you can set your privacy preferences on their sites and apps.
				</p>

				<h2 className='mb-3'>3. General Data Protection Regulation (GDPR)</h2>
				<p>
					We are a Data Controller of your information.
				</p>

				<p>
					DokChat legal basis for collecting and using the personal information described in this
					Privacy Policy depends on the Personal Information we collect and the specific context in
					which we collect the information:
				</p>
				<ul>
					<li>DokChat needs to perform a contract with you</li>
					<li>You have given DokChat permission to do so</li>
					<li>Processing your personal information is in DokChat legitimate interests</li>
					<li>DokChat needs to comply with the law</li>
				</ul>

				<p>
					DokChat will retain your personal information only for as long as is necessary for the purposes
					set out in this Privacy Policy. We will retain and use your information to the extent necessary
					to comply with our legal obligations, resolve disputes, and enforce our policies.
				</p>

				<p>
					If you are a resident of the European Economic Area (EEA), you have certain data protection rights.
					If you wish to be informed what Personal Information we hold about you and if you want it to be removed
					from our systems, please contact us.
				</p>
				<p>
					In certain circumstances, you have the following data protection rights:
				</p>
				<ul>
					<li>The right to access, update or to delete the information we have on you.</li>
					<li>The right of rectification.</li>
					<li>The right to object.</li>
					<li>The right of restriction.</li>
					<li>The right to data portability</li>
					<li>The right to withdraw consent</li>
				</ul>

				<h2 className='mb-3'>4. Log Files</h2>

				<p>
					DokChat follows a standard procedure of using log files. These files log visitors when they visit websites.
					All hosting companies do this and a part of hosting services&apos; analytics. The information collected by log
					files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp,
					referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally
					identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users&apos;
					movement on the website, and gathering demographic information.
				</p>

				<h2 className='mb-3'>5. Cookies and Web Beacons</h2>

				<p>
					Like any other website, DokChat uses &apos;cookies&apos;. These cookies are used to store information including visitors&apos;
					preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize
					the users&apos; experience by customizing our web page content based on visitors&apos; browser type and/or other information.
					DokChat may also use cookies, web beacons and other similar technologies from third-party partners such as Google, for
					measurement services, better targeting advertisements and for marketing purposes.
				</p>

				<h2 className='mb-3'>6. Children&apos;s Information</h2>

				<p>
					Another part of our priority is adding protection for children while using the internet. We encourage parents
					and guardians to observe, participate in, and/or monitor and guide their online activity.
				</p>

				<p>
					DokChat does not knowingly collect any Personal Identifiable Information from children under the age of 13.
					If you think that your child provided this kind of information on our website, we strongly encourage you to
					contact us immediately and we will do our best efforts to promptly remove such information from our records.
				</p>

				<h2 className='mb-3'>7. Online Privacy Policy Only</h2>

				<p>
					Our Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to
					the information that they shared and/or collect in DokChat. This policy is not applicable to any information
					collected offline or via channels other than this website.
				</p>

				<h2 className='mb-3'>8. Consent</h2>

				<p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
			</Container>
		</Layout>

	);
}

export default PrivacyPolicyPage;
