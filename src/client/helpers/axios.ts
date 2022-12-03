import * as axios from 'axios';
import { Axios, AxiosRequestHeaders } from 'axios';
import { LocalUser } from '../types/User';

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
		timeout: 30 * 1000
	});
}

export default getAxios;
