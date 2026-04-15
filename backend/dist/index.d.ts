import { Express } from 'express';
import 'express-async-errors';
import { PrismaClient } from '@prisma/client';
declare const app: Express;
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export default app;
//# sourceMappingURL=index.d.ts.map