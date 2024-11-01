import "../styles/Tags.css";

export const Tags = ({ handle, tags, onClick }) => {
  return (
    <div className="galleryTags">
      {tags.map((tag) => (
        <button
          className="galleryTag"
          key={tag.id}
          onClick={() => onClick(tag)}
        >
          {tag.handle === handle ? `すべて` : tag.name}
        </button>
      ))}
    </div>
  );
};
