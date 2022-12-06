export type ChatColorsListType = {
    [id: number]: {
        name: string,
        hex: string
    }
}

export const CHAT_COLORS: ChatColorsListType = {
	0: { // DokChat Blue
		name: 'Blue',
		hex: '#0061f2'
	},
	1: { // bs-indigo-500
		name: 'Indigo',
		hex: '#6610f2'
	},
	2: { // bs-purple-500
		name: 'Purple',
		hex: '#6f42c1'
	},
	3: { // bs-pink-500
		name: 'Pink',
		hex: '#d63384'
	},
	4: { // bs-red-500
		name: 'Red',
		hex: '#dc3545'
	},
	5: { // bs-orange-500
		name: 'Orange',
		hex: '#fd7e14'
	},
	6: { // bs-yellow-500
		name: 'Yellow',
		hex: '#ffc107'
	},
	7: { // bs-green-500
		name: 'Green',
		hex: '#198754'
	},
	8: { // bs-teal-600
		name: 'Teal',
		hex: '#1aa179'
	},
	9: { // bs-cyan-600
		name: 'Cyan',
		hex: '#0aa2c0'
	}
};
