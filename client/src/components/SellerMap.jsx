import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../index.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function SellerMap({ sellers, onChat }) {
    // Default position: Central Park, NY
    const position = [40.7829, -73.9654];

    return (
        <div className="glass-panel" style={{ height: '500px', width: '100%', overflow: 'hidden', marginTop: '2rem' }}>
            {typeof window !== 'undefined' && (
                <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {sellers.map((seller) => (
                        <Marker key={seller.id} position={[seller.latitude, seller.longitude]}>
                            <Popup>
                                <div style={{ color: 'black', width: '200px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        {seller.avatar_url && <img src={seller.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />}
                                        <div>
                                            <strong style={{ fontSize: '1rem' }}>{seller.full_name || seller.username}</strong>
                                            <br />
                                            <span style={{ fontSize: '0.8rem', color: '#555' }}>@{seller.username}</span>
                                        </div>
                                    </div>

                                    <p style={{ margin: '5px 0', fontSize: '0.9rem', fontStyle: 'italic' }}>"{seller.bio}"</p>
                                    <div style={{ borderTop: '1px solid #eee', marginTop: '5px', paddingTop: '5px' }}>
                                        <strong style={{ fontSize: '0.9rem' }}>Selling:</strong>
                                        <div style={{ fontSize: '0.85rem' }}>{seller.products || 'Various Goods'}</div>
                                    </div>

                                    <button
                                        onClick={() => onChat(seller)}
                                        style={{
                                            marginTop: '10px',
                                            width: '100%',
                                            padding: '6px',
                                            background: '#6d28d9',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}>
                                        Message Seller
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}
        </div>
    );
}

export default SellerMap;
