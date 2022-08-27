import { Response } from 'express';
import * as jose from 'jose';
import { UserJWTData } from '../../types/jwt';
import { ApiResponse } from '../apiResponse';
import * as DateFns from 'date-fns';
import { UserLoginResponse } from '../../types/endpoints';

export default class AvatarManager {
	public static defaultAvatar(tag: string) {
		return `/img/avatars/${Number(tag) % 5}.png`;
	}

	public static defaultGroupAvatar() {
		return '/img/avatars/0.png';
	}
}
