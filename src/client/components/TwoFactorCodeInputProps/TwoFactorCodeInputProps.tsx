import React, { useContext, useEffect, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import InteractiveButton from '../InteractiveButton/InteractiveButton';

export interface InteractiveTwoFactorCodeInputProps {
    setCode: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    buttonText: string;
    handleSubmit?: React.FormEventHandler<HTMLFormElement>
}

function TwoFactorCodeInput({setCode, isLoading, buttonText, handleSubmit}: InteractiveTwoFactorCodeInputProps) {
	const [ values, handleChange ] = useForm({ code: '' });

	useEffect(() => {
		setCode(values.code);
	}, [ values.code ]);

	return (
		<Form onSubmit={handleSubmit}>
			<InputGroup className='mt-3'>
				<Form.Control
					className='d-flex flex-fill'
					type="numeric"
					maxLength={6}
					name="code"
					value={values.code}
					onChange={handleChange}
				/>
				<InteractiveButton
					variant='primary'
					className='d-flex'
					loading={isLoading}
					type="submit"
				>
					{buttonText}
				</InteractiveButton>
			</InputGroup>
		</Form>
	);
}

export default TwoFactorCodeInput;
