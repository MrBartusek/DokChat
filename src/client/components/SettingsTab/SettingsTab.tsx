import React, { useContext } from 'react';
import { Form } from 'react-bootstrap';
import useSound from 'use-sound';
import { SettingsContext } from '../../context/ThemeContext';
import { Theme } from '../../hooks/useSettings';
import DebugInfo from '../DebugInfo/DebugInfo';

export default function SettingsTab() {
	const [settings, setSettings] = useContext(SettingsContext);

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const name = event.target.name;
		const checked = event.target.checked;
		const settingsCopy = Object.assign({}, settings);

		if (name == 'sound-notifications') {
			settingsCopy.soundNotifications = checked;
		}
		else if (name == 'theme') {
			settingsCopy.themeRaw = event.target.id as Theme;
		}

		setSettings(settingsCopy);
	}

	return (
		<>
			<Form>
				<Form.Label className='d-block'>
					Sound
				</Form.Label>
				<Form.Check
					type="switch"
					className='mb-2'
					name="sound-notifications"
					label="New Message Sound"
					onChange={handleChange}
					checked={settings.soundNotifications}
				/>
				<Form.Label className='d-block'>
					Theme
				</Form.Label>
				<Form.Check
					type="radio"
					name="theme"
					className='mb-2'
					onChange={handleChange}
					inline
					id={Theme.AUTO}
					label="Auto"
					checked={settings.themeRaw == Theme.AUTO}
				/>
				<Form.Check
					type="radio"
					name="theme"
					className='mb-2'
					onChange={handleChange}
					inline
					id={Theme.LIGHT}
					label="Light"
					checked={settings.themeRaw == Theme.LIGHT}
				/>
				<Form.Check
					type="radio"
					name="theme"
					className='mb-2'
					onChange={handleChange}
					inline
					id={Theme.DARK}
					label="Dark"
					checked={settings.themeRaw == Theme.DARK}
				/>
			</Form>
			<DebugInfo />
		</>
	);
}
