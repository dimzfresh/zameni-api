import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '../../../entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    if (!user) {
      throw new ForbiddenException('Пользователь не авторизован');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Доступ только для администраторов');
    }

    return true;
  }
}
