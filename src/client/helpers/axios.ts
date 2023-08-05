import * as axios from 'axios';
import { Axios } from 'axios';
import { LocalUser } from '../types/User';
import Utils from './utils';

function getAxios(user?: LocalUser, config?: axios.AxiosRequestConfig<any>): Axios {
	let headers: axios.RawAxiosRequestHeaders = {};
	if (user) {
		headers = user.getAuthHeader();
	}

	return new Axios({
		...axios.default.defaults,
		baseURL: Utils.getBaseUrl() + '/api/',
		headers: headers,
		validateStatus: function (status) {
			return status >= 200 && status < 300;
		},
		timeout: 30 * 1000,
		...config
	});
}

export default getAxios;
