export class InputPaginator{
    public pageNumber: number;
    public pageSize: number;
    public skipElements: number;

    constructor(
        pageNumber_str: string | undefined,
        pageSize_str: string | undefined,
        public sortDirection: "asc" | "desc" = "desc"
    ) {
        this.pageNumber = parseInt(pageNumber_str) || 1;
        this.pageSize = parseInt(pageSize_str) || 10;
        this.skipElements = (this.pageNumber - 1) * this.pageSize;
    }
}

export class OutputPaginator{
    public pagesCount: number;
    public totalCount: number;
    public items: Array<any>;
    public page: number;
    public pageSize: number;

    constructor(totalCount: number, items: Array<any>, inputPaginator: InputPaginator) {
        this.pagesCount = Math.ceil(totalCount / inputPaginator.pageSize);

        this.page = Math.min(inputPaginator.pageNumber, this.pagesCount);

        this.pageSize = inputPaginator.pageSize;
        this.totalCount = totalCount;
        this.items = items;
    }
}