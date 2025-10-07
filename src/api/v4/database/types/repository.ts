export interface Repository<T> {
    findById(id: number): T | null;
    findAll(): T[];
    findByQuery(options: QueryOptions): T[];
    create(item: T): T;
    update(id: number, item: Partial<T>): T | null;
    delete(id: number): boolean;
}


export type QueryOptions = {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    filters: {
        search?: string;
        status?: string;

        // Add more filters as needed
        [key: string]: any;
    }
}