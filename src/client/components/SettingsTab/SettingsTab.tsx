import React from 'react';
import { Form } from 'react-bootstrap';

export default function SettingsTab() {
	return (
		<Form>
			<Form.Check
				type="switch"
				id="custom-switch"
				label="Sound notifications"
			/>
		</Form>
	);
}
