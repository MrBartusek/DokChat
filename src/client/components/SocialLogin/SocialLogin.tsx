import FacebookLogin from '@greatsumini/react-facebook-login';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import React, { useContext, useEffect, useState } from 'react';
import { BsFacebook } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { EndpointResponse, UserLoginResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import useBreakpoint from '../../hooks/useBreakpoint';
import HorizontalSeparator from '../HorizontalSeparator/HorizontalSeparator';
import { useClientConfig } from '../../hooks/useClientConfig';

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
	const breakpoint = useBreakpoint();
	const [ buttonWidth, setButtonWidth ] = useState('200');
	const clientConfig = useClientConfig();

	useEffect(() => {
		switch (breakpoint) {
			case 'xs':
				setButtonWidth('230');
				break;
			case 'sm':
			case 'md':
				setButtonWidth('400');
				break;
			default:
				setButtonWidth('350');
				break;
		}
	}, [ breakpoint ]);

	async function sendLoginRequest(service: 'google' | 'facebook', token: string) {
		if(loading) return;
		setLoading(true);
		setError(null);
		await axios.post(`/auth/social-login/${service}`, { token })
			.then((r: any) => {
				const resp: EndpointResponse<UserLoginResponse> = r.data;
				setTimeout(() => {
					setUser(resp.data.token);
					navigate('/chat');
				}, 1000);
			})
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || 'Failed to log you in you at this time. Please try again later.');
				setLoading(false);
			});
	}

	async function onGoogleLogin(credentialResponse: CredentialResponse) {
		await sendLoginRequest('google', credentialResponse.credential);
	}

	async function onFacebookLogin(response: FacebookAuthResponse) {
		await sendLoginRequest('facebook', response.accessToken);
	}

	return (
		<>
			<HorizontalSeparator text='or' />
			<div className='d-flex align-items-center flex-column gap-2'>
				{clientConfig.googleClientId ? (
					<GoogleLogin
						onSuccess={onGoogleLogin}
						onError={() => {
							setError('Failed to get authorization response from Google');
						}}
						width={buttonWidth}
						logo_alignment='center'
						locale='en_US'
					/>
				): <></>}
				{clientConfig.facebookClientId ? (
					<FacebookLogin
						appId={clientConfig.facebookClientId}
						onSuccess={onFacebookLogin}
						onFail={(res) => {
							if(res.status != 'loginCancelled') {
								setError('Failed to get authorization response from Facebook');
							}
						}}
						scope='public_profile, email'
						style={{
							backgroundColor: '#1877f2',
							color: '#fff',
							fontSize: '15px',
							border: 'none',
							borderRadius: '4px',
							padding: 0,
							width: buttonWidth + 'px',
							height: '38px',
							fontWeight: 500
						}}
						className='d-flex justify-content-center align-items-center mt-1'
					>
						<BsFacebook className='me-2' size={20}/> <span>Sign in with Facebook</span>
					</FacebookLogin>
				): <></>}
			</div>
		</>
	);
}

export default SocialLogin;
