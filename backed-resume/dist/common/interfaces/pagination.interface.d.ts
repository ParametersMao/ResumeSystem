export interface PaginationQuery {
    page?: number;
    limit?: number;
}
export interface PaginationResponse<T> {
    list: T[];
    total: number;
    page: number;
    limit: number;
}
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}
export interface PaginatedApiResponse<T> extends ApiResponse<PaginationResponse<T>> {
}
