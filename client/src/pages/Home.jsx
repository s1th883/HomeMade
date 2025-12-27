import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import SellerMap from '../components/SellerMap';
import ChatBox from '../components/ChatBox';

function Home({ currentUser }) {
    const [products, setProducts] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommendation, setRecommendation] = useState('');
    const [recommending, setRecommending] = useState(false);
    const [chatPartner, setChatPartner] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch Products
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') {
                    setProducts(data.data);
                }
            })
            .catch(err => console.error("Failed to fetch products", err));

        // Fetch Sellers for Map
        fetch('/api/sellers')
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') {
                    setSellers(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch sellers", err);
                setLoading(false);
            });
    }, []);

    const getRecommendation = () => {
        setRecommending(true);
        setRecommendation('');
        const userHistory = ["Organic Strawberry Jam"]; // Mock history

        fetch('/api/ai/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products, userHistory })
        })
            .then(res => res.json())
            .then(data => {
                setRecommendation(data.recommendation);
                setRecommending(false);
            })
            .catch(err => {
                console.error(err);
                setRecommending(false);
            });
    };

    const handleChat = (seller) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setChatPartner(seller);
    };

    return (
        <div className="container">
            <header style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h1 className="heading-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                    HomeMade
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Discover unique, handcrafted goods from your neighborhood.
                    Buy, sell, and connect with local creators.
                </p>
            </header>

            <main>
                {/* Map Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ color: 'var(--text-primary)', textAlign: 'center', marginBottom: '1rem' }}>Explore Your Neighborhood</h2>
                    <SellerMap sellers={sellers} onChat={handleChat} />
                </section>

                {chatPartner && currentUser && (
                    <ChatBox
                        currentUser={currentUser}
                        otherUser={chatPartner}
                        onClose={() => setChatPartner(null)}
                    />
                )}

                <section style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <button
                        className="btn"
                        onClick={getRecommendation}
                        disabled={recommending}
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-color), var(--primary-color))',
                            fontSize: '1.1rem',
                            padding: '12px 24px'
                        }}
                    >
                        {recommending ? 'Asking AI Agent...' : '✨ Ask AI for a Recommendation'}
                    </button>
                    {recommendation && (
                        <div className="glass-panel" style={{
                            marginTop: '1.5rem',
                            padding: '1.5rem',
                            maxWidth: '600px',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            border: '1px solid var(--accent-color)'
                        }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>AI Suggestion</h3>
                            <p style={{ fontSize: '1.1rem' }}>{recommendation}</p>
                        </div>
                    )}
                </section>

                {loading ? (
                    <p style={{ textAlign: 'center' }}>Loading gems nearby...</p>
                ) : (
                    <div className="product-grid">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function ProductCard({ product }) {
    return (
        <div className="glass-panel" style={{
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s'
        }}>
            <div style={{
                height: '200px',
                backgroundImage: `url(${product.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }} />
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {product.description}
                </p>
                <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                        ${product.price.toFixed(2)}
                    </span>
                    <button className="btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;
