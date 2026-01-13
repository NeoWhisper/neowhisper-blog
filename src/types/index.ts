export interface Post {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    category?: string;
    readTime?: string;
}
