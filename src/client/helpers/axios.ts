import { Axios, AxiosRequestHeaders } from 'axios';
import { LocalUser } from '../types/User';
import * as axios from 'axios';

function getAxios(user?: LocalUser): Axios {
	let headers: AxiosRequestHeaders = {};
	if(user) {
		headers = user.getAuthHeader();
	}
	return new Axios({
		...axios.default.defaults,
		baseURL: window.location.origin + '/api',
		headers: headers,
		validateStatus: function (status) {
			return status >= 200 && status < 300;
		},
		timeout: 15 * 1000
	});
}

export default getAxios;