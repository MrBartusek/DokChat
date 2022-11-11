import React from 'react';
import { Outlet } from 'react-router-dom';
import FormPage from '../components/FormPage/FormPage';
import Layout from '../components/Layout/Layout';
import PasswordResetForm from '../components/PasswordResetForm/PasswordResetForm';

export function PasswordResetPage() {
	return (
		<Layout>
			<FormPage img='/img/undraw_forgot_password.svg'>
				<Outlet />
			</FormPage>
		</Layout>

	);
}
