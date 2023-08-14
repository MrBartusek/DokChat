import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import Utils from '../../helpers/utils';
import { version } from '../../../../package.json';

export default function DebugInfo() {
	const [ user ] = useContext(UserContext);

	return (
		<div className='small text-muted mt-5 text-center'>
			<div>
				User ID: <code className='text-muted'>{user.id}</code> ({user.discriminator})
			</div>
			{user.isDemo ? (
				<div> TEMPORARY DEMONSTRATION ACCOUNT </div>
			): null}
			<div>
				<code className='text-muted'>
					{Utils.isElectron() ? 'dokchat-desktop ' : 'dokchat-web'} v{version}
				</code> {' '}
				({Utils.isDev() ? 'development' : 'production'})
			</div>
		</div>
	);
}
