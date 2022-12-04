import React, { useContext } from 'react';
import { Form } from 'react-bootstrap';
import useSound from 'use-sound';
import { SettingsContext } from '../../context/ThemeContext';
import { Theme } from '../../hooks/useSettings';
import DebugInfo from '../DebugInfo/DebugInfo';

export default function SettingsTab() {
	const [ settings, setSettings ] = useContext(SettingsContext);
	const [ playPing ] = useSound('/sounds/new_message_ping.mp3', { volume: 0.5 });

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const id = event.target.id;
		const checked = event.target.checked;
		const settingsCopy = Object.assign({}, settings);

		if(id == 'sound-notifications') {
			settingsCopy.soundNotifications = checked;
			if(checked) playPing();
		}
		else if(id == 'dark-theme') {
			settingsCopy.theme = checked ? Theme.DARK : Theme.LIGHT;
		}

		setSettings(settingsCopy);
	}

	return (
		<>
			<Form>
				<Form.Check
					type="switch"
					className='mb-2'
					id="sound-notifications"
					label="Sound notifications"
					onChange={handleChange}
					checked={settings.soundNotifications}
				/>
				<Form.Check
					type="switch"
					className='mb-2'
					id="dark-theme"
					label="Dark theme"
					onChange={handleChange}
					checked={settings.theme == Theme.DARK}
				/>
			</Form>
			<DebugInfo />
		</>
	);
}
