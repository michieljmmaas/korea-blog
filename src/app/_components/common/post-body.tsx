import markdownStyles from "./../markdown-styles.module.css";
import BlogContentProcessor from "./blog-content-processor";

type Props = {
  content: string;
};

export function PostBody({ content }: Props) {
  return (
    <div className="max-w"> {/* Larger, aligned to left with margin */}
      <BlogContentProcessor
        htmlContent={content}
        className={markdownStyles["markdown"] + " markdown"}
      />
    </div>
  );
}