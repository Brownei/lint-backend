/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */
import { Inject, Injectable, Logger } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { User } from "src/utils/typeorm";
import { AuthService } from "src/modules/auth/auth.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(
        @Inject(AuthService)
        private readonly authService: AuthService,
    ) {
        super();
    }

    serializeUser(user: User, done: Function) {
        Logger.log('Serializer User')
        done(null, user);
    }

    async deserializeUser(payload: any, done: Function) {
        console.log(payload)
        // const user = await this.authService.findUser(payload.email);
        Logger.log('Deserializer User')
        // console.log(user)
        return payload ? done(null, payload) : done(null, null)
    }
}