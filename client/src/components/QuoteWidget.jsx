import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * COMPONENTA: QuoteWidget
 * DESCRIERE: Aceasta componenta indeplineste cerinta tehnica legata de 
 * "utilizarea datelor expuse de un serviciu extern".
 * * Functionalitate:
 * - Face un request HTTP catre un API public (dummyjson.com).
 * - Afiseaza un citat aleatoriu in partea de sus a dashboard-ului.
 */
export default function QuoteWidget() {
    // State pentru stocarea datelor citatului (autor, text)
    const [quote, setQuote] = useState(null);
    
    // State pentru gestionarea starii de incarcare (loading spinner)
    const [loading, setLoading] = useState(true);

    /**
     * EFECT: useEffect
     * Se executa o singura data, la montarea componentei.
     * Declanseaza functia asincrona de preluare a datelor.
     */
    useEffect(() => {
        const fetchQuote = async () => {
            try {
                // Apelam API-ul extern
                const response = await axios.get('https://dummyjson.com/quotes/random');
                
                // Actualizam state-ul cu datele primite
                setQuote(response.data);
                setLoading(false);
            } catch (error) {
                // In caz de eroare (ex: lipsa internet), afisam in consola si oprim loading-ul
                console.error("Eroare la serviciul extern:", error);
                setLoading(false);
            }
        };

        fetchQuote();
    }, []);

    // Randare conditionata: Daca se incarca, afisam un text placeholder
    if (loading) return <div style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '20px' }}> se incarca citatul...</div>;
    
    // Daca API-ul a esuat si nu avem citat, nu afisam nimic
    if (!quote) return null;

    // Afisarea interfetei grafice a widget-ului
    return (
        <div style={{
            marginBottom: '30px',
            padding: '15px 20px',
            backgroundColor: '#ffffff',
            borderLeft: '5px solid #3498db',
            borderRadius: '6px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
        }}>
            <span style={{ fontSize: '0.8rem', color: '#95a5a6', textTransform: 'uppercase', fontWeight: 'bold' }}>
                💡 Citatul Zilei (Serviciu Extern)
            </span>
            <p style={{ margin: 0, fontSize: '1rem', color: '#2c3e50', fontStyle: 'italic' }}>
                "{quote.quote}"
            </p>
            <span style={{ alignSelf: 'flex-end', fontSize: '0.9rem', fontWeight: '600', color: '#34495e' }}>
                — {quote.author}
            </span>
        </div>
    );
}