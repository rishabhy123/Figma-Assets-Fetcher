import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FigmaViewer.css';

const FigmaViewer = () => {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState(null);
  const [error, setError] = useState(null);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await axios.get('/api/figma/usage');
      setUsage(response.data);
    } catch (err) {
      console.error('Failed to fetch usage stats', err);
    }
  };

  const extractFileId = (url) => {
    // Matches both /file/KEY/ and /proto/KEY/
    const match = url.match(/\/(file|proto)\/([a-zA-Z0-9]+)/);
    return match ? match[2] : url; // If no match, assume it's the ID
  };

  const handleFetch = async (e) => {
    e.preventDefault();
    const fileId = extractFileId(figmaUrl);
    if (!fileId) {
      setError('Please enter a valid Figma file URL or ID');
      return;
    }

    setLoading(true);
    setError(null);
    setAssets(null);

    try {
      const response = await axios.get(`/api/figma/file/${fileId}`);
      if (response.data.success) {
        setAssets(response.data.images);
        fetchUsage(); // Update usage stats
      } else {
        setError(response.data.error || 'Failed to fetch assets');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while fetching assets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="figma-viewer">
      <div className="usage-stats">
        {usage && (
          <p>
            API Usage: {usage.used} / {usage.maxRequests} requests used. 
            Remaining: {usage.remaining}
          </p>
        )}
      </div>

      <form onSubmit={handleFetch} className="fetch-form">
        <input
          type="text"
          placeholder="Enter Figma File URL (e.g., https://www.figma.com/file/KEY/...)"
          value={figmaUrl}
          onChange={(e) => setFigmaUrl(e.target.value)}
          className="url-input"
        />
        <button type="submit" disabled={loading} className="fetch-button">
          {loading ? 'Fetching...' : 'Fetch Assets'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Fetching assets from Figma API... This might take a moment.</p>
        </div>
      )}

      {assets && (
        <div className="assets-grid">
          {Object.entries(assets).length > 0 ? (
            Object.entries(assets).map(([nodeId, url]) => (
              <div key={nodeId} className="asset-card">
                <div className="asset-image-container">
                  <img src={url} alt={`Node ${nodeId}`} loading="lazy" />
                </div>
                <div className="asset-info">
                  <code>ID: {nodeId}</code>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="download-link">
                    Open Original
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p>No exportable assets found in this file.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FigmaViewer;
