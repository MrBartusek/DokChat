export interface EndpointResponse<T> {
    error: boolean,
    status: number,
    message: string,
    data: T;
}

export interface UserLoginResponse {
    email: string,
    token: string
}
