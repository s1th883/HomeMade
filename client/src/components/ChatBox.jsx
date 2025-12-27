import { useState, useEffect, useRef } from 'react';
import '../index.css';

function ChatBox({ currentUser, otherUser, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [currentUser, otherUser]);

    const fetchMessages = () => {
        fetch(`/api/messages/${currentUser.id}/${otherUser.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') {
                    setMessages(data.data);
                    scrollToBottom();
                }
            });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender_id: currentUser.id,
                receiver_id: otherUser.id,
                content: newMessage
            })
        });
        setNewMessage('');
        fetchMessages();
    };

    return (
        <div className="glass-panel" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '350px',
            height: '500px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            background: '#1e293b',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {otherUser.avatar_url && <img src={otherUser.avatar_url} alt="" style={{ width: 30, height: 30, borderRadius: '50%' }} />}
                    <span style={{ fontWeight: 'bold' }}>{otherUser.username}</span>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser.id;
                    return (
                        <div key={msg.id} style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            background: isMe ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            maxWidth: '80%',
                            fontSize: '0.95rem'
                        }}>
                            {msg.content}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: 'none',
                        outline: 'none',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white'
                    }}
                />
                <button type="submit" className="btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Send</button>
            </form>
        </div>
    );
}

export default ChatBox;
