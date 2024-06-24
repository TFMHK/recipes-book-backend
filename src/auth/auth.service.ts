import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string) {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new UnauthorizedException("User doesn't exist");
    } if (!(await this.comparePasswords(pass, user.hashedPassword))){
      throw new UnauthorizedException("Wrong Password");
    }
    const payload = { sub: user.id, username: user.username };
    return {
      username: username,
      email: user.email,
      password: pass,
      access_token: await this.jwtService.signAsync(payload),
      timeToExpire: "3600"
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const { username, email, password } = signUpDto;

    if (await this.usersService.findOne(username)) {
      throw new ConflictException('Username already exist');
    } if (await this.usersService.findByEmail(email)){
      throw new ConflictException('Email already in use');
    }
    
    const hashedPassword = await this.hashPassword(password);
    await this.usersService.create({ username, email, hashedPassword });
    return this.signIn(username,password);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
