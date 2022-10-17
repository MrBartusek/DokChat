import { Axios, AxiosRequestHeaders } from 'axios';
import { LocalUser } from '../types/User';

function getAxios(user?: LocalUser): Axios {
	let headers: AxiosRequestHeaders = {};
	if(user) {
		headers = user.getAuthHeader();
	}
	const axios = new Axios({
		baseURL: window.location.origin + '/api',
		headers: headers,
		transformResponse: (data) => JSON.parse(data)
	});

	return axios;
}

export default getAxios;
