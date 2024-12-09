import { getToken, getUserId, getUserName } from "helper/token";

export const checkAuth = (): boolean => {

    const userName = getUserName();
    const userId = getUserId();
    const accessToken = getToken();

    return !(userName === null || userId === null || accessToken === null);
}