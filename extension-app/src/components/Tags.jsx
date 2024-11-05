import "../styles/Tags.css";

export const Tags = ({ handle, tags, handleTagClick, selectedTag }) => {
  return (
    <div className={`galleryTags`}>
      {tags.map((tag) => (
        <button
          className={`galleryTag ${tag.id === selectedTag ? "selected" : ""}`}
          key={tag.id}
          onClick={() => handleTagClick(tag)}
        >
          {tag.handle === handle ? `すべて` : tag.name}
        </button>
      ))}
    </div>
  );
};
