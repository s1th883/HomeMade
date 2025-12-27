import { useState, useEffect } from 'react';
import '../index.css';

// 10 "Odd/Cool" Avatars
const AVATARS = [
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/9.x/bottts/svg?seed=Cyborg",
    "https://api.dicebear.com/9.x/bottts/svg?seed=Robot",
    "https://api.dicebear.com/9.x/lorelei/svg?seed=Witch",
    "https://api.dicebear.com/9.x/adventurer/svg?seed=Gizmo",
    "https://api.dicebear.com/9.x/micah/svg?seed=Artist",
    "https://api.dicebear.com/9.x/notionists/svg?seed=CoolGuy",
    "https://api.dicebear.com/9.x/open-peeps/svg?seed=Chill",
    "https://api.dicebear.com/9.x/pixel-art/svg?seed=Pixel"
];

function Profile({ currentUser, setUser }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        bio: '',
        address: '',
        avatar_url: '',
        // Lat/Long are kept in state but not shown in UI
        latitude: '',
        longitude: ''
    });
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (currentUser) {
            setFormData({
                full_name: currentUser.full_name || '',
                bio: currentUser.bio || '',
                address: currentUser.address || '',
                avatar_url: currentUser.avatar_url || AVATARS[0],
                latitude: currentUser.latitude || '',
                longitude: currentUser.longitude || ''
            });
        }
    }, [currentUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarSelect = (url) => {
        setFormData({ ...formData, avatar_url: url });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setStatus('Updating...');
        try {
            const res = await fetch(`/api/users/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('Profile updated successfully!');
                setIsEditing(false);
                // Update local user state
                setUser({ ...currentUser, ...formData });
            } else {
                setStatus('Failed to update profile.');
            }
        } catch (err) {
            console.error(err);
            setStatus('Error updating profile.');
        }
    };

    if (!currentUser) return <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>Please log in to view your profile.</div>;

    return (
        <div className="container" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '600px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="Profile" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary-color)', background: 'white' }} />
                    ) : (
                        <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--glass-bg)', border: '4px solid var(--primary-color)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                            👤
                        </div>
                    )}
                    <h2 className="heading-gradient" style={{ marginTop: '1rem' }}>{currentUser.username}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>{currentUser.role}</p>
                </div>

                {status && <div style={{ textAlign: 'center', marginBottom: '1rem', color: status.includes('success') ? 'var(--accent-color)' : 'var(--secondary-color)' }}>{status}</div>}

                {!isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <ProfileField label="Full Name" value={currentUser.full_name} />
                        <ProfileField label="Bio" value={currentUser.bio} />
                        <ProfileField label="Address" value={currentUser.address} />

                        <button onClick={() => setIsEditing(true)} className="btn" style={{ marginTop: '1rem' }}>Edit Profile</button>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <InputField label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} />
                        <InputField label="Bio" name="bio" value={formData.bio} onChange={handleChange} textArea />
                        <InputField label="Address" name="address" value={formData.address} onChange={handleChange} />

                        <div style={{ margin: '1rem 0' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Choose an Avatar</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                                {AVATARS.map((url, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleAvatarSelect(url)}
                                        style={{
                                            cursor: 'pointer',
                                            border: formData.avatar_url === url ? '3px solid var(--accent-color)' : '2px solid transparent',
                                            borderRadius: '50%',
                                            padding: '2px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <img src={url} alt={`Avatar ${index + 1}`} style={{ width: '100%', borderRadius: '50%', background: 'white' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn" style={{ flex: 1 }}>Save Changes</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="btn" style={{ flex: 1, background: 'linear-gradient(135deg, #64748b, #475569)' }}>Cancel</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

function ProfileField({ label, value }) {
    return (
        <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{label}</span>
            <div style={{ fontSize: '1.1rem' }}>{value || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Not set</span>}</div>
        </div>
    );
}

function InputField({ label, name, value, onChange, type = "text", textArea = false, step }) {
    return (
        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{label}</label>
            {textArea ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    rows="3"
                    style={{
                        width: '100%', padding: '10px', borderRadius: '8px',
                        border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', fontFamily: 'inherit'
                    }}
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    step={step}
                    style={{
                        width: '100%', padding: '10px', borderRadius: '8px',
                        border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white'
                    }}
                />
            )}
        </div>
    );
}

export default Profile;
