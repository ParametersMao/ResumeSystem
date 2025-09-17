import { AuthService } from './auth.service';
import { LoginDto } from '../../dto/admin-user.dto';
import { CreateCUserDto } from '../../dto/c-user.dto';
import { ApiResponse } from '../../common/interfaces/pagination.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<ApiResponse<any>>;
    getProfile(req: any): Promise<ApiResponse<any>>;
    register(createCUserDto: CreateCUserDto): Promise<ApiResponse<any>>;
    cuserLogin(loginDto: LoginDto): Promise<ApiResponse<any>>;
    getCuserProfile(req: any): Promise<ApiResponse<any>>;
}
