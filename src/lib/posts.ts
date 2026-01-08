import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Define the path to your content directory
const postsDirectory = path.join(process.cwd(), "src/content/posts");

export interface Post {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    content: string;
}

// Function to retrieve all posts, sorted by date
export function getPosts(): Post[] {
    // Create directory if it doesn't exist to prevent errors
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);

    const allPostsData = fileNames.map((fileName) => {
        // Remove ".mdx" from file name to get id
        const slug = fileName.replace(/\.mdx$/, "");

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");

        // Use gray-matter to parse the post metadata section
        const { data, content } = matter(fileContents);

        return {
            slug,
            title: data.title || "Untitled Post",
            // Convert date to string to avoid serialization issues
            date: data.date
                ? new Date(data.date).toISOString()
                : new Date().toISOString(),
            excerpt: data.excerpt || "",
            content,
        } as Post;
    });

    // Sort posts by date (newest first)
    return allPostsData.sort((a, b) => {
        return a.date < b.date ? 1 : -1;
    });
}

// Function to retrieve a single post by slug (for the next step)
export function getPostBySlug(slug: string): Post | null {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
        slug,
        title: data.title,
        date: data.date
            ? new Date(data.date).toISOString()
            : new Date().toISOString(),
        excerpt: data.excerpt || "",
        content,
    } as Post;
}
