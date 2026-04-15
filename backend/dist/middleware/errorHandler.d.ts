import { Request, Response, NextFunction } from 'express';
declare class AppError extends Error {
    message: string;
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
export default AppError;
//# sourceMappingURL=errorHandler.d.ts.map