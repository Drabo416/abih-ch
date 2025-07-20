/* eslint-disable prettier/prettier */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PayloadInterface } from 'src/interface/payload.interface';
import { UserEntity } from '../entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SchemaName } from 'src/enum/schema-name.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(SchemaName.User) private userModel: Model<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_KEY,
    });
  }

  async validate(payload: PayloadInterface) {
    const user = await this.userModel.findOne({
      $or: [
        {
          email: payload.email,
        },
        // { phone: payload.phone },
      ],
    });
    // Si le user exste je le retourne et la automatiquement ce que je retourne dans validate
    // est mis dans le request
    if (user) {
      delete user.salt;
      delete user.password;
      return user;
    } else {
      // Si non je déclenche une erreur
      throw new UnauthorizedException();
    }
  }
}
