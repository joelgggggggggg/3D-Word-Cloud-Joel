import { useState } from 'react';
import WordCloud3D from './WordCloud3D.tsx';

type Keyword = { word: string; weight: number };

export default function App() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<Keyword[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Three real sample URLs
  const sampleUrls: string[] = [
    'https://peps.python.org/pep-0008/',
    'https://www.gutenberg.org/cache/epub/11/pg11.txt',
    'http://neverssl.com/',
  ];

  const analyze = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.detail || `Server error: ${res.status}`);
      }

      const json: Keyword[] = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleUrl: string) => {
    setUrl(sampleUrl);
    // optional auto-run:
    // void analyze();
  };

  const handleOfflineTest = () => {
    // local demo words, no backend call
    setError('');
    setLoading(false);
    setUrl(''); // we don’t need a URL for offline mode

    const offline: Keyword[] = [
      { word: 'fastapi',     weight: 0.95 },
      { word: 'react',       weight: 0.9 },
      { word: 'threejs',     weight: 0.86 },
      { word: 'fiber',       weight: 0.82 },
      { word: 'drei',        weight: 0.78 },
      { word: 'wordcloud',   weight: 0.74 },
      { word: 'typescript',  weight: 0.7 },
      { word: 'uvicorn',     weight: 0.66 },
      { word: 'nlp',         weight: 0.62 },
      { word: 'tokens',      weight: 0.6 },
    ];

    setData(offline);
  };

  return (
    <div
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#111',
        color: '#eee',
        minHeight: '100vh',
        padding: '2rem',
      }}
    >
      <h1>3D Word Cloud</h1>
      <p>Enter a URL below or click one of the sample buttons.</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          type="url"
          placeholder="Enter article URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #333',
            background: '#1a1a1a',
            color: '#eee',
          }}
        />
        <button
          type="button"
          onClick={analyze}
          disabled={loading}
          style={{
            background: '#4f46e5',
            color: 'white',
            border: 0,
            borderRadius: '8px',
            padding: '10px 16px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>

      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {sampleUrls.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSampleClick(s)}
            style={{
              background: '#1f1f1f',
              border: '1px solid #333',
              color: '#ddd',
              borderRadius: '6px',
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            Sample
          </button>
        ))}

        <button
          type="button"
          onClick={handleOfflineTest}
          style={{
            background: '#1f1f1f',
            border: '1px solid #333',
            color: '#ddd',
            borderRadius: '6px',
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          Offline TEST
        </button>
      </div>

      {error && (
        <p style={{ color: '#ff6b6b' }}>
          Error: {error}
        </p>
      )}

      {data && !error && !loading && (
        <div style={{ marginTop: '1rem' }}>
          <WordCloud3D words={data} />
        </div>
      )}
    </div>
  );
}
