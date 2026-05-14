import { useEffect, useState } from 'react';
import { Search, Plus, BookOpen, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Nav from '../components/Nav';
import BookCover from '../components/BookCover';
import { api } from '../services/api';
import { searchBooks } from '../services/openLibrary';

// Eliminamos la constante local placeholderCover ya que BookCover lo maneja.

export default function Biblioteca() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [apiResults, setApiResults] = useState([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({ title: '', author: '', cover: '' });
  
  const [selectedBookPopup, setSelectedBookPopup] = useState(null);
  const [bookSummaries, setBookSummaries] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLeavingDelete, setIsLeavingDelete] = useState(false);

  useEffect(() => { loadBooks(); }, []);

  async function loadBooks() {
    const data = await api('/books');
    setBooks(data.books);
  }

  async function searchApi(e) {
    e.preventDefault();
    if (!apiSearchQuery.trim()) return;
    setIsSearchingApi(true);
    setApiError(null);
    try {
      const results = await searchBooks(apiSearchQuery);
      setApiResults(results);
      if (results.length === 0) setApiError('No encontramos resultados para esa búsqueda.');
    } catch (err) {
      setApiError('No pudimos buscar libros ahora.');
    }
    setIsSearchingApi(false);
  }

  async function addBookFromApi(bookData) {
    try {
      await api('/books', { method: 'POST', body: JSON.stringify(bookData) });
      setShowForm(false);
      setApiResults([]);
      setApiSearchQuery('');
      loadBooks();
    } catch (err) {
      alert(err.message);
    }
  }

  async function saveManualBook() {
    if (!manualForm.title.trim() || !manualForm.author.trim()) {
      alert("Título y Autor son obligatorios");
      return;
    }
    try {
      await api('/books', { method: 'POST', body: JSON.stringify(manualForm) });
      setShowManualForm(false);
      setManualForm({ title: '', author: '', cover: '' });
      loadBooks();
    } catch (err) {
      alert(err.message);
    }
  }

  async function openBookPopup(book) {
    setSelectedBookPopup(book);
    setEditForm({ title: book.title, author: book.author, cover: book.cover });
    setIsEditingBook(false);
    setBookSummaries([]);
    try {
      const data = await api(`/books/${book._id}/summaries`);
      setBookSummaries(data.summaries || []);
    } catch {
      // ignored
    }
  }

  async function saveBookEdit() {
    setSavingEdit(true);
    try {
      await api(`/books/${selectedBookPopup._id}`, { method: 'PATCH', body: JSON.stringify(editForm) });
      setSelectedBookPopup({ ...selectedBookPopup, ...editForm });
      loadBooks();
    } catch (err) {
      alert(err.message);
    }
    setSavingEdit(false);
  }

  function triggerDeleteConfirm() {
    setShowDeleteConfirm(true);
    setIsLeavingDelete(false);
  }

  function handleDeleteChoice(confirmed) {
    setIsLeavingDelete(true);
    setTimeout(async () => {
      setShowDeleteConfirm(false);
      setIsLeavingDelete(false);
      if (confirmed && selectedBookPopup) {
        try {
          await api(`/books/${selectedBookPopup._id}`, { method: 'DELETE' });
          setSelectedBookPopup(null);
          loadBooks();
        } catch (err) {
          alert(err.message);
        }
      }
    }, 300);
  }

  const filtered = books.filter(b => `${b.title} ${b.author}`.toLowerCase().includes(query.toLowerCase()));
  const current = books[0];

  return (
    <main className="screen withNav">
      <Header />
      <div className="pageContent">
        <section className="sectionIntro">
          <p>Biblioteca</p>
          <h2>Tus lecturas y resúmenes</h2>
        </section>

      <label className="searchBox">
        <input placeholder="Buscar en mi colección..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Search size={24} />
      </label>

      {current && <section className="currentBlock">
        <h3>LECTURA ACTUAL</h3>
        <article className="currentCard">
          <BookCover book={current} onClick={() => openBookPopup(current)} />
          <div className="infoContainer">
            <h2 style={{ cursor: 'pointer' }} onClick={() => openBookPopup(current)}>{current.title}</h2>
            <p>{current.author}</p>
            <Link className="blackBtn" to={`/reading/${current._id}`}>Empezar lectura</Link>
          </div>
        </article>
      </section>}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <button className="blackBtn shineBtnDark" onClick={() => { setShowForm(!showForm); setShowManualForm(false); }} style={{ width: 'auto', padding: '0 32px' }}>
            {showForm ? 'Cancelar' : <><Plus size={18} /> Agregar nuevo libro</>}
          </button>
          <button 
            onClick={() => { setShowManualForm(true); setShowForm(false); }} 
            style={{ background: 'transparent', border: 'none', color: 'black', textDecoration: 'underline', marginTop: '12px', cursor: 'pointer', fontSize: '14px', padding: '8px' }}
          >
            No encuentro el libro deseado
          </button>
        </div>

      {books.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
          <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px', margin: '0 0 10px', color: 'var(--ink)' }}>No tienes ningún libro</h3>
          <p style={{ margin: 0 }}>¡Agrega el primero para empezar a leer y sumar puntos!</p>
        </div>
      )}

      {showForm && (
        <div className="panel" style={{ marginBottom: '40px' }}>
          <form className="searchBox" onSubmit={searchApi} style={{ marginBottom: '24px' }}>
             <input placeholder="Busca libros por título o autor en Open Library..." value={apiSearchQuery} onChange={(e) => setApiSearchQuery(e.target.value)} />
             <button type="submit" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><Search size={24} /></button>
          </form>
          
          {isSearchingApi && <p style={{ textAlign: 'center', padding: '20px' }}>Buscando libros...</p>}
          {apiError && <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>{apiError}</p>}
          
          {apiResults.length > 0 && (
             <div className="gridBooks" style={{ marginTop: '0' }}>
               {apiResults.map((resBook, idx) => (
                 <article className="bookCard" key={idx}>
                   <BookCover book={resBook} />
                   <h3>{resBook.title}</h3>
                   <p>{resBook.author}</p>
                   {resBook.year && <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 10px' }}>Año: {resBook.year}</p>}
                   <button className="blackBtn small" style={{ width: '100%', padding: '8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => addBookFromApi(resBook)}>Agregar</button>
                 </article>
               ))}
             </div>
          )}
        </div>
      )}

      {showManualForm && (
        <div className="panel" style={{ marginBottom: '40px' }}>
           <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', margin: '0 0 16px' }}>Agregar libro manual</h3>
           <div className="editForm">
             <input value={manualForm.title} onChange={e => setManualForm({...manualForm, title: e.target.value})} placeholder="Título *" />
             <input value={manualForm.author} onChange={e => setManualForm({...manualForm, author: e.target.value})} placeholder="Autor *" />
             <input value={manualForm.cover} onChange={e => setManualForm({...manualForm, cover: e.target.value})} placeholder="URL de portada (opcional)" />
             <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="outlineBtn small" onClick={() => setShowManualForm(false)} style={{ margin: 0, flex: 1 }}>Cancelar</button>
                <button className="blackBtn small" onClick={saveManualBook} style={{ margin: 0, flex: 1 }}>Confirmar</button>
             </div>
           </div>
        </div>
      )}

        <section className="gridBooks">
          {filtered.map(book => (
            <article className="bookCard" key={book._id}>
              <BookCover book={book} onClick={() => openBookPopup(book)} />
              <h3 style={{ cursor: 'pointer' }} onClick={() => openBookPopup(book)}>{book.title}</h3>
              <p>{book.author}</p>
              <button className="outlineBtn small" onClick={() => openBookPopup(book)}>Ver resúmenes</button>
              <Link className="blackBtn small" to={`/reading/${book._id}`}>Empezar lectura</Link>
            </article>
          ))}
        </section>
      </div>
      <Nav />

      {selectedBookPopup && (
        <div className="modalOverlay" onClick={() => setSelectedBookPopup(null)}>
          <div className="modalContent bookPopup" onClick={e => e.stopPropagation()}>
            <button className="closeBtn" onClick={() => setSelectedBookPopup(null)}>✕</button>
            <div className="popupGrid">
              <div className="popupLeft">
                <div style={{ position: 'relative' }}>
                  <BookCover book={{ ...selectedBookPopup, cover: editForm.cover || selectedBookPopup.cover }} />
                  {isEditingBook && (
                    <div className="editCoverOverlay" onClick={() => {
                      const newUrl = prompt('Nueva URL de portada:', editForm.cover);
                      if (newUrl !== null) setEditForm({...editForm, cover: newUrl});
                    }}>
                      <Pencil size={24} color="white" />
                    </div>
                  )}
                </div>
                {!isEditingBook ? (
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '28px', margin: '0 0 8px' }}>{selectedBookPopup.title}</h2>
                    <p style={{ color: 'var(--muted)', margin: '0 0 24px' }}>{selectedBookPopup.author}</p>
                    <button className="outlineBtn small" onClick={() => setIsEditingBook(true)} style={{ width: 'auto', margin: '0 auto 8px', padding: '0 24px' }}>Editar info.</button>
                    <button onClick={triggerDeleteConfirm} style={{ background: 'transparent', border: 'none', color: '#d9534f', fontSize: '13px', display: 'block', margin: '0 auto', cursor: 'pointer', padding: '8px' }}>Eliminar libro</button>
                  </div>
                ) : (
                  <div className="editForm">
                    <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Título" />
                    <input value={editForm.author} onChange={e => setEditForm({...editForm, author: e.target.value})} placeholder="Autor" />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                       <button className="outlineBtn small" onClick={() => { setIsEditingBook(false); setEditForm({title: selectedBookPopup.title, author: selectedBookPopup.author, cover: selectedBookPopup.cover}); }} style={{ margin: 0, flex: 1 }}>Cancelar</button>
                       <button className="blackBtn small" onClick={() => { saveBookEdit(); setIsEditingBook(false); }} disabled={savingEdit} style={{ margin: 0, flex: 1 }}>
                         {savingEdit ? 'Guardando...' : 'Guardar'}
                       </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="popupRight">
                <h3>Resúmenes de lectura</h3>
                {bookSummaries.length === 0 ? (
                  <p className="emptyState">Aún no hay resúmenes para este libro.</p>
                ) : (
                  <div className="summariesList">
                    {bookSummaries.map(s => (
                      <div key={s._id} className="summaryItem">
                        <small className="date">{new Date(s.createdAt).toLocaleDateString()}</small>
                        <p>"{s.reflection}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="confirmModalOverlay" style={{ zIndex: 3000 }}>
          <div className={`confirmModal ${isLeavingDelete ? 'leaving' : ''}`}>
            <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '20px', margin: '0 0 12px' }}>¿Eliminar libro?</h3>
            <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.4' }}>
              ¿Estás seguro de que quieres eliminar <strong>{selectedBookPopup?.title}</strong> de tu biblioteca? Perderás todos tus resúmenes.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleDeleteChoice(false)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink)', padding: '12px', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer' }}>No</button>
              <button onClick={() => handleDeleteChoice(true)} style={{ flex: 1, background: '#d9534f', border: 'none', color: 'white', padding: '12px', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer' }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
