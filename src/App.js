import { useState, useEffect } from 'react';

const DEFAULT_SYMBOLS = ['THYAO.IS', 'GARAN.IS', 'AKBNK.IS', 'EREGL.IS', 'BIMAS.IS'];

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [symbols, setSymbols] = useState(() => {
    const saved = localStorage.getItem('bistSymbols');
    return saved ? JSON.parse(saved) : DEFAULT_SYMBOLS;
  });
  const [input, setInput] = useState('');

  const fetchStocks = (syms) => {
    fetch(`https://bist-dashboard-backend.onrender.com/bist?symbols=${syms.join(',')}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStocks(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    localStorage.setItem('bistSymbols', JSON.stringify(symbols));
    setLoading(true);
    fetchStocks(symbols);
  }, [symbols]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStocks(symbols);
    }, 60000);
    return () => clearInterval(interval);
  }, [symbols]);

  const addStock = () => {
    const symbol = input.toUpperCase().trim();
    if (!symbol) return;
    const formatted = symbol.endsWith('.IS') ? symbol : symbol + '.IS';
    if (!symbols.includes(formatted)) {
      setSymbols([...symbols, formatted]);
    }
    setInput('');
  };

  const removeStock = (symbol) => {
    setSymbols(symbols.filter(s => s !== symbol));
  };

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px', backgroundColor: '#1a1a2e', minHeight: '100vh', color: 'white' }}>
      <h1 style={{ color: '#e94560' }}>📈 BIST Dashboard</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addStock()}
          placeholder="Enter stock symbol (e.g. TCELL)"
          style={{ padding: '10px', width: '250px', borderRadius: '5px', border: 'none', marginRight: '10px' }}
        />
        <button
          onClick={addStock}
          style={{ padding: '10px 20px', backgroundColor: '#e94560', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Add Stock
        </button>
        <span style={{ marginLeft: '20px', fontSize: '12px', color: '#888' }}>Auto-refreshes every 60 seconds</span>
      </div>

      {loading ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#16213e' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Symbol</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Price (TRY)</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Change %</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Mkt Cap (M$)</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Remove</th>
              
            </tr>
          </thead>
          <tbody>
            {stocks.map(stock => (
              <tr key={stock.symbol} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '12px' }}>{stock.symbol}</td>
                <td style={{ padding: '12px' }}>{stock.name}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{stock.price?.toFixed(2)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: stock.change >= 0 ? '#00ff88' : '#ff4444' }}>
                  {stock.change?.toFixed(2)}%
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {stock.marketCapUSD ? `$${stock.marketCapUSD.toLocaleString()}M` : '-'}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                <button
                    onClick={() => removeStock(stock.symbol)}
                    style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;