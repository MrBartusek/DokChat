import { getHeaderValue, normalizeDirectives } from './helemtDirectivesPraser';

export const directives: Record<string, Array<string>> = {
	'script-src': [
		'\'self\'',
		'https://www.google.com/recaptcha/', // reCAPTCHA
		'https://www.gstatic.com/recaptcha/', // reCAPTCHA
		'https://accounts.google.com/gsi/', // Google Sign-In
		'https://connect.facebook.net/', // Facebook SDK
		'https://*.googletagmanager.com' // Google Analytics
	],
	'frame-src': [
		'\'self\'',
		'https://www.google.com/recaptcha/', // reCAPTCHA
		'https://recaptcha.google.com/recaptcha/', // reCAPTCHA
		'https://accounts.google.com/gsi/' // Google Sign-In
	],
	'connect-src': [
		'\'self\'',
		'https://www.facebook.com/', // Facebook SDK
		'https://*.google-analytics.com', // Google Analytics
		'https://*.analytics.google.com', // Google Analytics
		'https://*.googletagmanager.com', // Google Analytics
		'https://tenor.googleapis.com/', // Tenor
		'https://media.tenor.com/' // Tenor
	],
	'media-src': [
		'\'self\'',
		'https://*.s3.eu-central-1.amazonaws.com',
		'https://media.tenor.com/' // Tenor
	],
	'img-src': [
		'\'self\'',
		'data:', // In-line base 64 SVGs
		'https://*.s3.eu-central-1.amazonaws.com', // S3 Bucket
		'https://*.google-analytics.com', // Google Analytics
		'https://*.googletagmanager.com', // Google Analytics
		'https://media.tenor.com',
		'https://twemoji.maxcdn.com',
		'https://cdn.jsdelivr.net/npm/emoji-datasource-twitter',
		'https://chart.googleapis.com'
	]
};

export function praseDirectivesForElectron(): string {

	/**
	 * Since electron uses file:// protocol 'self' directives won't
	 * work for main webserver and all call will be blocked, that's
	 * why server url needs to be added here
	**/
	const directivesCopy = {...directives};
	console.log(Object.keys(directivesCopy));
	for(const rule of Object.keys(directivesCopy)) {
		if(rule == 'connect-src') {
			directivesCopy[rule].push('wss://dokchat.dokurno.dev/socket.io/');
		}
		directivesCopy[rule].push('https://dokchat.dokurno.dev/');
	}

	const normalizedDirectives = normalizeDirectives(directives);
	const result = getHeaderValue(normalizedDirectives);
	return result;
}

