export interface Repository<T> {
    findById(id: number): Promise<T | null>;
    findAll(): Promise<T[]>;
    findByQuery(options: QueryOptions): Promise<T[]>;
    countByQuery(options: QueryOptions): Promise<number>;
    countAll(): Promise<number>;
    create(item: T): Promise<T>;
    update(id: number, item: Partial<T>): Promise<T | null>;
    delete(id: number): Promise<boolean>;
}


export type QueryOptions = {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    search?: string;
    filters: {
        [key: string]: any;
    }
}