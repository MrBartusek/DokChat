export type ChatColorsListType = {
	id: number,
	name: string,
	hex: string
}[]

export const CHAT_COLORS: ChatColorsListType = [
	{ // DokChat Blue
		id: 0,
		name: 'Blue',
		hex: '#0061f2'
	},
	{ // bs-indigo-500
		id: 1,
		name: 'Indigo',
		hex: '#6610f2'
	},
	{ // bs-purple-500
		id: 2,
		name: 'Purple',
		hex: '#6f42c1'
	},
	{ // bs-pink-500
		id: 3,
		name: 'Pink',
		hex: '#d63384'
	},
	{ // bs-red-500
		id: 4,
		name: 'Red',
		hex: '#dc3545'
	},
	{ // bs-orange-500
		id: 5,
		name: 'Orange',
		hex: '#fd7e14'
	},
	{ // bs-yellow-500
		id: 6,
		name: 'Yellow',
		hex: '#ffc107'
	},
	{ // bs-green-500
		id: 7,
		name: 'Green',
		hex: '#198754'
	},
	{ // bs-teal-600
		id: 8,
		name: 'Teal',
		hex: '#1aa179'
	},
	{ // bs-cyan-600
		id: 9,
		name: 'Cyan',
		hex: '#0aa2c0'
	}
];
