import { registerAs } from '@nestjs/config';

export interface IEnv {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    appName: string;
    appUrl: string;

    databaseUrl: string;
    databasePoolMin: number;
    databasePoolMax: number;

    jwtSecret: string;
    jwtRefreshSecret: string;
    jwtVerifyOtpTokenSectate: string
    cloudinaryCloudName: string;
    cloudinaryApiKey: string;
    cloudinaryApiSecret: string;

    OTP: {
        SMTP_HOST: string,
        SMTP_PORT: string,
        SMTP_USER: string,
        SMTP_PASS: string
    }

}

const requiredEnv = [
    'NODE_ENV',
    'PORT',
    'API_PREFIX',
    'APP_NAME',
    'APP_URL',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_VERIFY_OTP_SECRATE',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
];

function envChecker() {
    requiredEnv.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`❌ Missing required env: ${key}`);
        }
    });
}

export default registerAs('env', (): IEnv => {
    envChecker();

    return {
        nodeEnv: process.env.NODE_ENV as string,
        port: parseInt(process.env.PORT as string, 10),
        apiPrefix: process.env.API_PREFIX as string,
        appName: process.env.APP_NAME as string,
        appUrl: process.env.APP_URL as string,

        databaseUrl: process.env.DATABASE_URL as string,
        databasePoolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
        databasePoolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),

        jwtSecret: process.env.JWT_SECRET as string,
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
        jwtVerifyOtpTokenSectate: process.env.JWT_VERIFY_OTP_SECRATE as string,

        cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY as string,
        cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET as string,

        OTP: {
            SMTP_HOST: process.env.SMTP_HOST as string,
            SMTP_PORT: process.env.SMTP_PORT as string,
            SMTP_USER: process.env.SMTP_USER as string,
            SMTP_PASS: process.env.SMTP_PASS as string
        }

    };
});