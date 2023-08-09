import store from './store';

class SessionManager {
	public static login(token: string, refreshToken: string): void {
		store.set('token', token);
		store.set('refreshToken', refreshToken);

		// Auto login user on next auth expire or fail
		store.set('autoLogin', true);
	}

	public static logout() {
		store.set('autoLogin', false);
		store.delete('token');
		store.delete('refreshToken');
	}

	public static updateToken(token: string) {
		store.set('token', token);
	}
}

export default SessionManager;
