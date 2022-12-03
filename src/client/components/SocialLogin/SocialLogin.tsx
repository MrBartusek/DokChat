import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { EndpointResponse, UserLoginResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import HorizontalSeparator from '../HorizontalSeparator/HorizontalSeparator';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { FACEBOOK_CLIENT_ID } from '../../config';
import { BsFacebook } from 'react-icons/bs';

const axios = getAxios();

export interface SocialLoginProps {
	setError: React.Dispatch<React.SetStateAction<string>>;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	loading: boolean
}

type FacebookAuthResponse = {
    accessToken: string;
    expiresIn: string;
    reauthorize_required_in: string;
    signedRequest: string;
    userID: string;
}

function SocialLogin({ setError, setLoading, loading }: SocialLoginProps) {
	const [ user, updateToken, setUser ] = useContext(UserContext);
	const navigate = useNavigate();

	async function sendLoginRequest(service: 'google' | 'facebook', token: string) {
		if(loading) return;
		setLoading(true);
		setError(null);
		await axios.post(`/auth/social-login/${service}`, { token })
			.then((r: any) => {
				const resp: EndpointResponse<UserLoginResponse> = r.data;
				setUser(resp.data.token);
				navigate('/chat');
			})
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || 'Failed to log you in you at this time. Please try again later.');
				setLoading(false);
			});
	}

	async function onGoogleLogin(credentialResponse: CredentialResponse) {
		await sendLoginRequest('facebook', credentialResponse.credential);
	}

	async function onFacebookLogin(response: FacebookAuthResponse) {
		await sendLoginRequest('facebook', response.accessToken);
	}

	return (
		<>
			<HorizontalSeparator text='or' />
			<div className='d-flex align-items-center flex-column gap-2'>
				<GoogleLogin
					onSuccess={onGoogleLogin}
					onError={() => {
						setError('Failed to get authorization response from Google');
					}}
					useOneTap
					width='280'
					logo_alignment='center'
					locale='en_US'
				/>
				<FacebookLogin
					appId={FACEBOOK_CLIENT_ID}
					onSuccess={onFacebookLogin}
					onFail={() => {
						setError('Failed to get authorization response from Facebook');
					}}
					style={{
						backgroundColor: '#1877f2',
						color: '#fff',
						fontSize: '15px',
						border: 'none',
						borderRadius: '4px',
						padding: 0,
						width: '280px',
						height: '38px',
						fontWeight: 500
					}}
					className='d-flex justify-content-center align-items-center mt-1'
				>
					<BsFacebook className='me-2' size={20}/> <span>Sign in with Facebook</span>
				</FacebookLogin>
			</div>
		</>
	);
}

export default SocialLogin;
