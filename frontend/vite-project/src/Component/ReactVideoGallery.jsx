import React, { useState } from 'react';

const ReactVideoGallery = () => {
    const [activeVideo, setActiveVideo] = useState(null);

    const VIDEOS = [
        { id: "B3Z4XGAxJB0", title: "Beautiful Nature 4K", thumbnail: "https://img.youtube.com/vi/B3Z4XGAxJB0/maxresdefault.jpg" },
        { id: "DuudSp4sHmg", title: "Relaxing Rain Sounds", thumbnail: "https://img.youtube.com/vi/DuudSp4sHmg/maxresdefault.jpg" },
        { id: "LXb3EKWsInQ", title: "Costa Rica 4K", thumbnail: "https://img.youtube.com/vi/LXb3EKWsInQ/maxresdefault.jpg" },
    ];

    // Create a style object to reuse the font
    const robotoStyle = { fontFamily: "'Roboto Condensed', sans-serif" };

    return (
        // Apply font to the main container
        <div style={{ ...robotoStyle, padding: '20px' }}>
            
            {/* 1. Applying via className (for Tailwind) AND inline style for safety */}
            <h1 
                className="roboto-condensed" 
                style={{ textAlign: 'center', fontWeight: 700, letterSpacing: '2px' }}
            >
                THIRD - EYE
            </h1>

            {/* Grid of Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {VIDEOS.map(video => (
                    <div 
                        key={video.id} 
                        onClick={() => setActiveVideo(video.id)}
                        style={{ cursor: 'pointer', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', backgroundColor: '#1a1a1a' }}
                    >
                        <img src={video.thumbnail} alt={video.title} style={{ width: '100%', display: 'block' }} />
                        
                        {/* Apply font to the video titles */}
                        <p style={{ ...robotoStyle, textAlign: 'center', padding: '15px', margin: 0, color: 'white', textTransform: 'uppercase', fontWeight: 500 }}>
                            {video.title}
                        </p>
                    </div>
                ))}
            </div>

            {/* The Modal */}
            {activeVideo && (
                <div 
                    onClick={() => setActiveVideo(null)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        zIndex: 1000
                    }}
                >
                    <div style={{ width: '80%', maxWidth: '800px', position: 'relative' }}>
                        <button 
                            style={{ ...robotoStyle, position: 'absolute', top: '-40px', right: '0', color: 'white', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', textTransform: 'uppercase' }}
                        >
                            Close ✕
                        </button>
                        
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                            <iframe
                                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px', border: '1px solid #333' }}
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReactVideoGallery;