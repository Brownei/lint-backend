/* eslint-disable prettier/prettier */
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { config } from 'dotenv';

import { Injectable, Logger } from '@nestjs/common';

config();

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor() {
        super({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL,
            scope: ['user_friends', 'manage_pages']
        });
    }
    async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
        // const { name, emails, photos, } = profile
        Logger.log(profile);
        // const user = {
        //     email: emails[0].value,
        //     firstName: name.givenName,
        //     lastName: name.familyName,
        //     picture: photos[0].value,
        //     accessToken
        // }
        return profile;
    }
}