import React, { useContext } from 'react';
import { Alert } from 'react-bootstrap';
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import AccountBannedPage from '../../pages/AccountBannedPage';
import ChatPage from '../../pages/ChatPage';
import GetDokchatPage from '../../pages/GetDokchatPage';
import EmailConfirmPage from '../../pages/EmailConfirmPage';
import HomePage from '../../pages/HomePage';
import InvitePage from '../../pages/InvitePage';
import LoginPage from '../../pages/LoginPage';
import PasswordResetPage from '../../pages/PasswordResetPage';
import PrivacyPolicyPage from '../../pages/PrivacyPolicy';
import RegisterPage from '../../pages/RegisterPage';
import EmailConfirmer from '../EmailConfirmer/EmailConfirmer';
import ErrorPage from '../ErrorPage/ErrorPage';
import NewPasswordDialog from '../NewPasswordDialog/NewPasswordDialog';
import PasswordResetForm from '../PasswordResetForm/PasswordResetForm';
import Utils from '../../helpers/utils';
import ElectronLoginPage from '../../pages/ElectronLoginPage';
import ElectronHandoffPage from '../../pages/ElectronHandoffPage';
import ElectronWelcomePage from '../../pages/ElectronWelcomePage';

const ChatDetailsPopupLazy = React.lazy(() => import('../ChatDetailsPopup/ChatDetailsPopup'));
const NewChatPopupLazy = React.lazy(() => import('../NewChatPopup/NewChatPopup'));
const SettingsPopupLazy = React.lazy(() => import('../SettingsPopup/SettingsPopup'));
const EmailConfirmPopupLazy = React.lazy(() => import('../EmailConfirmPopup/EmailConfirmPopup'));
const DeleteAccountPopupLazy = React.lazy(() => import('../DeleteAccountPopup/DeleteAccountPopup'));
const GroupLeavePopupLazy = React.lazy(() => import('../GroupLeavePopup/GroupLeavePopup'));
const ChatHidePopupLazy = React.lazy(() => import('../ChatHidePopup/ChatHidePopup'));
const UserPopupLazy = React.lazy(() => import('../UserPopup/UserPopup'));
const UserBlockPopupLazy = React.lazy(() => import('../UserBlockPopup/UserBlockPopup'));
const InvitePopupLazy = React.lazy(() => import('../InvitePopup/InvitePopup'));

function Router() {
	const ConditionalRouter = Utils.isElectron() ? HashRouter : BrowserRouter;

	return (
		<ConditionalRouter>
			<Routes>
				<Route path="chat" element={
					<PrivateRoute>
						<ChatPage />
					</PrivateRoute>
				}>
					<Route path=":chatId" element={null} />
					<Route path=":chatId/details" element={
						<React.Suspense fallback={null}>
							<ChatDetailsPopupLazy />
						</React.Suspense>
					} />
					<Route path=":chatId/leave" element={
						<React.Suspense fallback={null}>
							<GroupLeavePopupLazy />
						</React.Suspense>
					} />
					<Route path=":chatId/hide" element={
						<React.Suspense fallback={null}>
							<ChatHidePopupLazy />
						</React.Suspense>
					} />
					<Route path="user/:userId" element={
						<React.Suspense fallback={null}>
							<UserPopupLazy />
						</React.Suspense>
					} />
					<Route path="user/:userId/block" element={
						<React.Suspense fallback={null}>
							<UserBlockPopupLazy />
						</React.Suspense>
					} />
					<Route path="new" element={
						<React.Suspense fallback={null}>
							<NewChatPopupLazy />
						</React.Suspense>
					} />
					<Route path="profile" element={
						<React.Suspense fallback={null}>
							<SettingsPopupLazy />
						</React.Suspense>
					} />
					<Route path="email-confirm" element={
						<React.Suspense fallback={null}>
							<EmailConfirmPopupLazy />
						</React.Suspense>
					} />
					<Route path="delete-account" element={
						<React.Suspense fallback={null}>
							<DeleteAccountPopupLazy />
						</React.Suspense>
					} />
					<Route path="invite/:key" element={
						<React.Suspense fallback={null}>
							<InvitePopupLazy />
						</React.Suspense>
					} />
				</Route>

				<Route path="/" element={
					<ElectronDenyRoute>
						<HomePage />
					</ElectronDenyRoute>} />
				<Route path="about" element={<HomePage scrollToAbout />} />
				<Route path="privacy-policy" element={<PrivacyPolicyPage />} />
				<Route path="get" element={<GetDokchatPage />} />
				<Route path="i/:key" element={
					<PrivateRoute>
						<InvitePage />
					</PrivateRoute>
				} />

				<Route path="login" element={
					<PublicOnlyRoute>
						<LoginPage />
					</PublicOnlyRoute>
				} />

				<Route path="register" element={
					<PublicOnlyRoute>
						<RegisterPage />
					</PublicOnlyRoute>
				} />

				<Route path="forgot-password" element={
					<PublicOnlyRoute>
						<PasswordResetPage />
					</PublicOnlyRoute>
				}>
					<Route path="" element={<PasswordResetForm />} />
					<Route path=":token" element={<NewPasswordDialog />} />
				</Route>

				<Route path="email-confirm" element={
					<EmailConfirmPage />
				}>
					<Route path="" element={<Alert variant='danger'>No token provided</Alert>} />
					<Route path=":token" element={<EmailConfirmer />} />
				</Route>

				<Route path="suspended" element={
					<PrivateRoute isSuspendedRoute>
						<AccountBannedPage />
					</PrivateRoute>
				} />

				<Route path="electron-login" element={<ElectronLoginPage />} />
				<Route path="handoff" element={
					<PrivateRoute>
						<ElectronHandoffPage />
					</PrivateRoute>} />
				<Route path="electron-welcome" element={<ElectronWelcomePage />} />

				{/* 404 */}
				<Route path="*" element={<ErrorPage title="404" message="This page was not found" />} />
			</Routes>
		</ConditionalRouter>
	);
}

export default Router;

interface SpecialRouteProps {
	children: JSX.Element,
	isSuspendedRoute?: boolean
}

const PrivateRoute = ({ children, isSuspendedRoute }: SpecialRouteProps) => {
	const [ user ] = useContext(UserContext);
	if (user.isAuthenticated) {
		if (user.isBanned && !isSuspendedRoute) {
			return <Navigate to="/suspended" />;
		}
		else if (!user.isBanned && isSuspendedRoute) {
			return <Navigate to="/chat" />;
		}
		return children;
	}
	return <Navigate to="/login" />;
};

const PublicOnlyRoute = ({ children }: SpecialRouteProps) => {
	const [ user ] = useContext(UserContext);
	if(Utils.isElectron()) return <Navigate to="/electron-welcome" />;
	return !user.isAuthenticated ? children : <Navigate to="/chat" />;
};

const ElectronDenyRoute = ({ children }: SpecialRouteProps) => {
	return Utils.isElectron() ? <Navigate to="/electron-welcome" /> : children;
};
