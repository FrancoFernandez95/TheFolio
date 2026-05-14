import { useEffect, useState } from 'react';
import { getRandomQuote } from '../services/quotes';

export default function QuoteCard({ style = {} }) {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    let mounted = true;
    getRandomQuote().then(q => {
      if (mounted) setQuote(q);
    });
    return () => { mounted = false; };
  }, []);

  if (!quote) return null; // No loading state to prevent breaking layout, just hidden until ready.

  return (
    <div className="quoteCardComponent" style={style}>
      <blockquote>"{quote.text}"</blockquote>
      <cite>— {quote.author}</cite>
    </div>
  );
}
