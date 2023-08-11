/**
 * This file is just mostly modified
 * https://github.com/helmetjs/helmet/blob/main/middlewares/content-security-policy/index.ts#L8
 *
 * Used to prase helmet CSP directives to header string
 */

const DEFAULT_DIRECTIVES: Record<
  string,
  Iterable<string>
> = {
	'default-src': [ '\'self\'' ],
	'base-uri': [ '\'self\'' ],
	'font-src': [ '\'self\'', 'https:', 'data:' ],
	'form-action': [ '\'self\'' ],
	'frame-ancestors': [ '\'self\'' ],
	'img-src': [ '\'self\'', 'data:' ],
	'object-src': [ '\'none\'' ],
	'script-src': [ '\'self\'' ],
	'script-src-attr': [ '\'none\'' ],
	'style-src': [ '\'self\'', 'https:', '\'unsafe-inline\'' ],
	'upgrade-insecure-requests': []
};

type NormalizedDirectives = Map<string, Iterable<string>>;

const getDefaultDirectives = () => ({ ...DEFAULT_DIRECTIVES });

const dashify = (str: string): string =>
	str.replace(/[A-Z]/g, (capitalLetter) => '-' + capitalLetter.toLowerCase());

const has = (obj: Readonly<object>, key: string): boolean =>
	Object.prototype.hasOwnProperty.call(obj, key);

export function normalizeDirectives(directives: Record<string, Iterable<string>>): NormalizedDirectives {
	const defaultDirectives = getDefaultDirectives();

	const useDefaults = true;
	const rawDirectives = directives;

	const result: NormalizedDirectives = new Map();
	const directiveNamesSeen = new Set<string>();
	const directivesExplicitlyDisabled = new Set<string>();

	for (const rawDirectiveName in rawDirectives) {
		if (!has(rawDirectives, rawDirectiveName)) {
			continue;
		}

		if (
			rawDirectiveName.length === 0 ||
      /[^a-zA-Z0-9-]/.test(rawDirectiveName)
		) {
			throw new Error(
        `Content-Security-Policy received an invalid directive name ${JSON.stringify(
          rawDirectiveName
        )}`
			);
		}

		const directiveName = dashify(rawDirectiveName);

		if (directiveNamesSeen.has(directiveName)) {
			throw new Error(
        `Content-Security-Policy received a duplicate directive ${JSON.stringify(
          directiveName
        )}`
			);
		}
		directiveNamesSeen.add(directiveName);

		const rawDirectiveValue = rawDirectives[rawDirectiveName];
		let directiveValue: Iterable<string>;
		if (rawDirectiveValue === null) {
			if (directiveName === 'default-src') {
				throw new Error(
					'Content-Security-Policy needs a default-src but it was set to `null`. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`.'
				);
			}
			directivesExplicitlyDisabled.add(directiveName);
			continue;
		}
		else if (typeof rawDirectiveValue === 'string') {
			directiveValue = [ rawDirectiveValue ];
		}
		else if (!rawDirectiveValue) {
			throw new Error(
        `Content-Security-Policy received an invalid directive value for ${JSON.stringify(
          directiveName
        )}`
			);
		}
		else {
			directiveValue = rawDirectiveValue;
		}

		result.set(directiveName, directiveValue);
	}

	if (useDefaults) {
		Object.entries(defaultDirectives).forEach(
			([ defaultDirectiveName, defaultDirectiveValue ]) => {
				if (
					!result.has(defaultDirectiveName) &&
          !directivesExplicitlyDisabled.has(defaultDirectiveName)
				) {
					result.set(defaultDirectiveName, defaultDirectiveValue);
				}
			}
		);
	}

	if (!result.size) {
		throw new Error(
			'Content-Security-Policy has no directives. Either set some or disable the header'
		);
	}
	if (
		!result.has('default-src') &&
    !directivesExplicitlyDisabled.has('default-src')
	) {
		throw new Error(
			'Content-Security-Policy needs a default-src but none was provided. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`.'
		);
	}

	return result;
}

export function getHeaderValue(
	normalizedDirectives: Readonly<NormalizedDirectives>
): string {
	const result: string[] = [];

	normalizedDirectives.forEach((rawDirectiveValue, directiveName) => {
		let directiveValue = '';
		//@ts-ignore
		for (const element of rawDirectiveValue) {
			directiveValue += ' ' + element;
		}

		if (!directiveValue) {
			result.push(directiveName);
		}
		else {
			result.push(`${directiveName}${directiveValue}`);
		}
	});

	return result.join(';');
}
