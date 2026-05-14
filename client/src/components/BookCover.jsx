export default function BookCover({ book, onClick, className = '', style = {} }) {
  if (!book) return null;

  const combinedStyle = { ...style, cursor: onClick ? 'pointer' : 'default' };

  if (book.cover && book.cover.trim() !== '') {
    return (
      <img 
        src={book.cover} 
        alt={book.title} 
        style={combinedStyle} 
        onClick={onClick} 
        className={className} 
      />
    );
  }

  return (
    <div 
      className={`bookCoverPlaceholder ${className}`} 
      onClick={onClick}
      style={combinedStyle}
    >
      <h4>{book.title}</h4>
      <p>{book.author}</p>
    </div>
  );
}
