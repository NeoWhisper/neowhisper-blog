import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    hr: (props) => <hr className="my-12" {...props} />,
    ol: (props) => <ol className="list-decimal pl-6 mt-12 mb-6" {...props} />,
    h2: (props) => <h2 className="text-3xl font-bold mt-20 mb-8" {...props} />,
  };
}
