import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from "nodemailer"
import { IEnv } from 'src/config/env.config';

@Injectable()
export class MailService {

    private transport;


    constructor(private readonly configService: ConfigService) {
        this.transport = nodemailer.createTransport({
            host: this.configService.get<IEnv>("env")?.OTP.SMTP_HOST,
            port: 587,
            secure: false,
            auth: {
                user: this.configService.get<IEnv>("env")?.OTP.SMTP_USER,
                pass: this.configService.get<IEnv>("env")?.OTP.SMTP_PASS
            }
        })
    };


    async sendMail(to: string, subject: string, code: string) {
        return await this.transport.sendMail({
            from: `"Alisona" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html: `
            <div style="font-family: Arial">
                <h2>Your Verification Code</h2>
                <h1 style="color: #4CAF50">${code}</h1>
            </div>
        `,
        });
    }



}
