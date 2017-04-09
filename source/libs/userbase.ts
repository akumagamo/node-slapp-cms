const adminUser : IUser = { username : "admin", password : process.env.CMS_PASSWORD || "admin" };

export interface IUser {
    username : string;
    password : string;
}

export class UserBase {
    public static isValidUser(userundertest:IUser) : boolean{
        return userundertest.username.toLowerCase() === adminUser.username && userundertest.password === adminUser.password;
    }
}