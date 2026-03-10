import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SignInDto } from './dto/sign.in.dto';
import { SignUpDto } from './dto/sign.up.dto';
import { FirebaseLoginDto } from './dto/firebase.login';
import { RefreshTokenDto } from './dto/refresh.token.dto';
import { SentOTPDto } from './dto/sent.otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change.password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  @Post("sign-up")
  @ApiOperation({ summary: "User registraction" })
  async signUp(@Body() data: SignUpDto) {
    const result = await this.authService.SignUp(data);

    return {
      success: true,
      message: `Congratulation, ${result.username}! You have successfully registration on this platfrom.`
    }
  }


  @Post("sign-in")
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
    const result = await this.authService.firebaseLogin(dto);

    return {
      success: true,
      message: "Not Implement",
      data: result
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
  @ApiOperation({ summary: "OTP sent to user email (Forgot password step - 01)" })
  async sentOtp(@Body() data: SentOTPDto) {
    await this.authService.sentOtpInEmail(data);

    return {
      success: true,
      message: "Otp sent to your email",
    }

  }

  @Post("verify-otp")
  @ApiOperation({ summary: "Verify otp (Forgot password step - 02)" })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(dto);
    return {
      success: true,
      message: "OTP verified successfully. You may now reset your password.",
      token: result.token
    }
  }

  @Post("reset-password")
  @ApiOperation({ summary: "reset password (Forgot password step - 03)" })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(dto);

    return {
      ...result
    }
  }

  @Post("change-password")
  @ApiOperation({ summary: "Change password" })
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.user.userId;

    const result = await this.authService.changePassword(userId, dto);

    return {
      success: true,
      ...result
    }
  }

}
