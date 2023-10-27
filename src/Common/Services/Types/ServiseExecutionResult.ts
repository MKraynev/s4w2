export class ServiceExecutionResult<ExecutionStatus, ExecutionResultObject> {
    constructor(
        public executionStatus: ExecutionStatus,
        public executionResultObject: ExecutionResultObject | null = null,
        public message: string | null = null) { }
}