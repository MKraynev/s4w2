import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { MAIL_LOGIN } from "../settings";

export type Mail = {
    to: string,
    from: string,
    subject: string,
    text: string,
    html: string
}

@Injectable()
export class EmailService {
    private login;
    
    constructor(private mailerService: MailerService) {
        this.login = MAIL_LOGIN;
    }

    async SendEmail(content: Mail) {
        this.mailerService.sendMail(content).catch(err => this.ErrorLog(err))
    }

    private ErrorLog(err: Error) {
        return err && console.log("SEND EMAIL ERROR", err)
    }

    _REGISTRATION_FORM(sendTo: string, userId: string, registrationPath): Mail {
        let result: Mail = {
            to: sendTo,
            from: `"SAMURAI 🥷"<${this.login}@gmail.com>`,
            subject: "Testing email registration",
            text: "",
            html: `
            <p>To finish registration please follow the link below:
            <a href='${registrationPath}?code=${userId}'>complete registration</a>
            </p>`
        }

        return result;
    }
}