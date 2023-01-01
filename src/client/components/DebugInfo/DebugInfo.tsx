import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext';

export default function DebugInfo() {
	// These are imports from custom webpack plugin
	//@ts-ignore
	const commitHash: string = COMMIT_HASH;
	//@ts-ignore
	const mode: string = BUILD_MODE;

	const [ user ] = useContext(UserContext);

	return (
		<div className='small text-muted mt-5 text-center'>
            DokChat ver. <code>
				<a className='text-muted' href={`https://github.com/MrBartusek/DokChat/commit/${commitHash}`} target="_blank" rel="noreferrer">
					{commitHash.substring(0, 7)}
				</a>
			</code> ({mode} build) <br />
            User: <code className='text-muted'>{user.id}</code> ({user.discriminator})
		</div>
	);
}
