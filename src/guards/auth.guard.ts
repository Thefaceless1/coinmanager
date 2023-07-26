import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Request} from "express";
import {JwtService} from "@nestjs/jwt";
import {privateKey} from "../utils/private.key";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<any> {
        const request: Request = await context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if(!token) throw new UnauthorizedException();
        try {
            request['user'] = await this.jwtService.verifyAsync(token,{secret: privateKey});
        }
        catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}