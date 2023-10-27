import { Controller, Delete, HttpCode, HttpStatus, NotFoundException } from "@nestjs/common";
import { TestService } from "./testing.service";

@Controller("testing")
export class TestController {

    constructor(private testService: TestService) { }

    @Delete("all-data")
    @HttpCode(HttpStatus.NO_CONTENT)
    async Delete() {
        let deleted = await this.testService.DeleteAll();
        if (deleted)
            return;

        throw new NotFoundException();
    }
}