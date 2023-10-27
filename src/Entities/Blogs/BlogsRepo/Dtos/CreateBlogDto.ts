export class CreateBlogDto {
    constructor(
        public name: string,
        public description: string,
        public websiteUrl: string) { }
}