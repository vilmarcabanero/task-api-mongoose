import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Message } from 'src/message/message.decorator';
import { MessageService } from 'src/message/message.service';
import { Response } from 'express';
import { IErrorHttpException } from './error.interface';

@Catch(HttpException)
export class ErrorHttpFilter implements ExceptionFilter {
    constructor(@Message() private readonly messageService: MessageService) {}

    catch(exception: HttpException, host: ArgumentsHost): void {
        const ctx: HttpArgumentsHost = host.switchToHttp();
        const statusHttp: number = exception.getStatus();
        const responseHttp: any = ctx.getResponse<Response>();

        // Restructure
        const response = exception.getResponse() as IErrorHttpException;

        if (typeof response === 'string') {
            const rMessage: string = this.messageService.get(response);
            responseHttp.status(statusHttp).json({
                statusCode: statusHttp,
                message: rMessage
            });
        } else if (typeof response === 'object') {
            const { statusCode, message, errors, data } = response;
            const rMessage: string = this.messageService.get(message);

            responseHttp.status(statusHttp).json({
                statusCode,
                message: rMessage,
                errors,
                data
            });
        } else {
            const rMessage: string = this.messageService.get(
                'response.error.structure'
            );
            responseHttp.status(statusHttp).json({
                statusCode: 500,
                message: rMessage
            });
        }
    }
}
