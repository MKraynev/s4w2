import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService{
    
    constructor() {
        
    }

    async SendEmail(destEmail: string, content: string){
        
    }

    static _REGISTRATION_FORM(userId: string): string{
        return "some content";
    }
}