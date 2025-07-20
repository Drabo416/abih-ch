import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { SchemaName } from 'src/enum/schema-name.enum';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(SchemaName.User) private userModel: Model<UserEntity>,
    private jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = await this.userModel.create(createUserDto);
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, user.salt);
    try {
      const { salt, password, ...userData } = (await user.save()).toJSON();
      return userData;
    } catch (error) {
      console.log(error);
      throw new ConflictException('Ce compte est déjà utilisé');
    }
  }

  findAll() {
    const user = [];
    return user;
  }

  async createToken(user: UserEntity) {
    return await this.jwtService.sign({
      email: user.email,
      phone: user.phone,
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({
      $or: [
        {
          email: loginDto.email,
          phone: loginDto.phone,
        } /*{ phone: loginDto.phone }*/,
      ],
    });
    if (!user)
      throw new UnauthorizedException(
        "Le mot de passe ou l'identifiant est incorrect",
      );
    const hashedPassWord = await bcrypt.hash(loginDto.password, user.salt);
    if (hashedPassWord == user.password) {
      const payload = {
        email: user.email,
        phone: user.phone,
      };
      delete user.password;
      delete user.salt;
      const jwt = await this.jwtService.sign(payload);
      return {
        token: jwt,
        data: user,
      };
    } else {
      throw new UnauthorizedException(
        'Le mail ou le mot de passe est incorect',
      );
    }
  }

  async findOne(id: string) {
    const user = await this.userModel.findOne({
      $or: mongoose.Types.ObjectId.isValid(id)
        ? [{ id }, { _id: id }]
        : [{ id }],
    });
    if (!user)
      throw new NotFoundException(`L'utilisateur de id ${id}  n'existe pas`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userModel.findOneAndUpdate(
        {
          $or: mongoose.Types.ObjectId.isValid(id)
            ? [{ id }, { _id: id }]
            : [{ id }],
        },
        {
          ...updateUserDto,
        },
        {
          new: true,
        },
      );
      return user;
    } catch (error) {
      throw new ConflictException('Le compte est introuvable');
    }
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.userModel.findOneAndDelete({ id: user._id });
  }
}
