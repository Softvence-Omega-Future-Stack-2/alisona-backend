import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { SignInDto } from './dto/sign.in.dto';
import { SignUpDto } from './dto/sign.up.dto';
import { FirebaseLoginDto } from './dto/firebase.login';
import { RefreshTokenDto } from './dto/refresh.token.dto';
import { SentOTPDto } from './dto/sent.otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  @Post("sing-up")
  @ApiOperation({ summary: "User registraction" })
  async signUp(@Body() data: SignUpDto) {
    const result = await this.authService.SignUp(data);

    return {
      success: true,
      message: `Congratulation, ${result.username}! You have successfully registration on this platfrom.`
    }
  }


  @Post("sing-in")
  @ApiOperation({ summary: "User SignIn" })
  async SignIn(@Body() data: SignInDto) {
    const result = await this.authService.SignIn(data);

    return {
      success: true,
      message: "User sign in successfully",
      data: result
    }

  }

  @Post("firebase-login")
  @ApiOperation({ summary: "Google and Apple login only" })
  async firebaseLogin(@Body() dto: FirebaseLoginDto) {
    // const result = await this.firebaseLogin(dto);

    return {
      success: true,
      message: "Not Implement",
      // data: result
    }

  }

  @Post("refresh-token")
  @ApiOperation({ summary: "Generate new access token" })
  async generateNewAccessTokenUseRefreshToken(@Body() dto: RefreshTokenDto) {
    const result = await this.authService.generateAccessTokenUseRefreshToken(dto);

    return {
      success: true,
      message: "Token refreshed success",
      data: result
    }

  }

  @Post("sent-otp")
  @ApiOperation({ summary: "OTP sent to user email" })
  async sentOtp(@Body() data: SentOTPDto) {
    await this.authService.sentOtpInEmail(data);

    return {
      success: true,
      message: "Otp sent to your email",
    }

  }


}
