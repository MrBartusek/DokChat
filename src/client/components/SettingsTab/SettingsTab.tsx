import React, { useContext } from 'react';
import { Button, Form } from 'react-bootstrap';
import useSound from 'use-sound';
import { SettingsContext } from '../../context/ThemeContext';
import Utils from '../../helpers/utils';
import { PresenceMode, Theme } from '../../hooks/useSettings';
import DebugInfo from '../DebugInfo/DebugInfo';

export default function SettingsTab() {
	const [ settings, setSettings ] = useContext(SettingsContext);
	const [ playPing ] = useSound(Utils.getBaseUrl() + '/sounds/new_message_ping.mp3', { volume: 0.5 });

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const name = event.target.name;
		const checked = event.target.checked;
		const settingsCopy = Object.assign({}, settings);

		if (name == 'themeRaw' || name == 'presenceMode') {
			(settingsCopy as any)[name] = event.target.id as Theme;
		}
		else {
			(settingsCopy as any)[name] = checked;
		}

		setSettings(settingsCopy);
	}

	return (
		<>
			<Form>
				<Form.Label className='d-block'>
					Notification Settings
				</Form.Label>
				<Form.Check
					type="switch"
					className='mb-2 d-inline-block'
					name="soundNotifications"
					label={<>
						<span>New message sound</span>
						<Button variant='link' onClick={() => playPing()} className='ms-1'>Test</Button>
					</>}
					onChange={handleChange}
					checked={settings.soundNotifications}
				/>

				{Utils.isElectron() ? (
					<Form.Check
						type="switch"
						className='mb-2'
						name="desktopNotifications"
						label={<>
							<span>Enable desktop notifications</span>
							<Button variant='link' className='ms-1' onClick={() => {
								new Notification('DokChat Desktop', {
									body: 'This is how new notifications will look', silent: true
								});
							}}>Test</Button>
						</>}
						onChange={handleChange}
						checked={settings.desktopNotifications}
					/>
				): null}

				<Form.Label className='d-block pt-3'>
					Theme
				</Form.Label>
				<Form.Check
					type="radio"
					name="themeRaw"
					className='mb-2'
					onChange={handleChange}
					inline
					id={Theme.AUTO}
					label="Auto"
					checked={settings.themeRaw == Theme.AUTO}
				/>
				<Form.Check
					type="radio"
					name="themeRaw"
					className='mb-2'
					onChange={handleChange}
					inline
					id={Theme.LIGHT}
					label="Light"
					checked={settings.themeRaw == Theme.LIGHT}
				/>
				<Form.Check
					type="radio"
					name="themeRaw"
					className='mb-2'
					onChange={handleChange}
					inline
					id={Theme.DARK}
					label="Dark"
					checked={settings.themeRaw == Theme.DARK}
				/>
			</Form>

			{Utils.isElectron() ? (
				<>
					<Form.Label className='d-block pt-3'>
						DokChat Desktop Settings
					</Form.Label>
					<Form.Check
						type="switch"
						className='mb-2'
						name="openOnStartup"
						label="Open DokChat on startup"
						onChange={handleChange}
						checked={settings.openOnStartup}
					/>
					<Form.Check
						type="switch"
						className='mb-2'
						name="startMinimized"
						label="Start minimized"
						onChange={handleChange}
						checked={settings.startMinimized}
					/>
					<Form.Check
						type="switch"
						className='mb-2'
						name="minimizeToTray"
						label="Minimized to system tray after clicking X"
						onChange={handleChange}
						checked={settings.minimizeToTray}
					/>

					<Form.Label className='d-block pt-3'>
						Discord Rich Presence
					</Form.Label>
					<Form.Check
						type="radio"
						name="presenceMode"
						className='mb-2'
						onChange={handleChange}
						inline
						id={PresenceMode.ALWAYS}
						label="Always"
						checked={settings.presenceMode == PresenceMode.ALWAYS}
					/>
					<Form.Check
						type="radio"
						name="presenceMode"
						className='mb-2'
						onChange={handleChange}
						inline
						id={PresenceMode.ONLY_MAXIMIZED}
						label="Only when maximized"
						checked={settings.presenceMode == PresenceMode.ONLY_MAXIMIZED}
					/>
					<Form.Check
						type="radio"
						name="presenceMode"
						className='mb-2'
						onChange={handleChange}
						inline
						id={PresenceMode.DISABLED}
						label="Disabled"
						checked={settings.presenceMode == PresenceMode.DISABLED}
					/>
				</>
			): null}
			<DebugInfo />
		</>
	);
}
