import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { MAIL_LOGIN, MAIL_PASSWORD } from "../settings";

@Module({
  imports: [MailerModule.forRoot({
    transport: {
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: MAIL_LOGIN,
        pass: MAIL_PASSWORD
      }
    }
  })],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule { }
