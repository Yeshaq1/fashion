import React, { useState, useEffect } from 'react';
import '../index.css'; // We'll create this file for styles

function App() {
  const [product, setProduct] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  const fetchAnalysis = async (productData, url) => {
    try {
      setAnalysisLoading(true);
      const response = await fetch('http://localhost:3000/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product: productData }),
      });
      const data = await response.json();
      setAnalysis(data);

      // Cache the product and analysis data
      chrome.storage.local.set({
        [url]: { product: productData, analysis: data }
      });
    } catch (error) {
      console.error('Error fetching analysis:', error);
      setAnalysis({ error: 'Failed to fetch analysis' });
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error('Error querying tabs:', chrome.runtime.lastError);
        setIsEnabled(false);
        setLoading(false);
        return;
      }

      const url = tabs[0].url;
      setCurrentUrl(url);

      chrome.storage.local.get([url], (result) => {
        if (result[url]) {
          // We have cached data for this URL
          const cachedData = result[url];
          setProduct(cachedData.product);
          setAnalysis(cachedData.analysis);
          setLoading(false);
        } else {
          // No cached data, fetch new data
          chrome.tabs.sendMessage(tabs[0].id, { action: 'getProductInfo' }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Runtime error:', chrome.runtime.lastError);
              setIsEnabled(false);
            } else if (response && response.product) {
              setProduct(response.product);
              fetchAnalysis(response.product, url);
            } else {
              setIsEnabled(false);
            }
            setLoading(false);
          });
        }
      });
    });
  }, []);

  return (
    <div className="App">
      <h1>Sensei</h1>
      {loading ? (
        <div className="analysis-loading">
          <div className="analysis-loader"></div>
          <p>Analyzing fashion...</p>
        </div>
      ) : !isEnabled ? (
        <div className="disabled">
          <p>Fashion Sensei is not available on this page.</p>
        </div>
      ) : product ? (
        <>
          <div className="product-card">
            <h2 className="product-title">{product.title}</h2>
            <div className="image-gallery">
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <img key={index} src={image} alt={`Product ${index + 1}`} />
                ))
              ) : (
                <p>No images available</p>
              )}
            </div>
            {/* <button className="toggle-details" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            {showDetails && (
              <div className="product-details">
                <p>{product.description}</p>
                <p>${product.price}</p>
                <div className="sizes">
                  {product.sizes.map(size => (
                    <span key={size.name} className={`size ${size.availability}`}>{size.name}</span>
                  ))}
                </div>
                <div className="composition">
                  {product.composition.map((comp, index) => (
                    <p key={index}>{comp.description}: {comp.components}</p>
                  ))}
                </div>
              </div>
            )} */}
          </div>
          
          {analysisLoading ? (
            <div className="analysis-loading">
              <div className="analysis-loader"></div>
              <p>Generating insights...</p>
            </div>
          ) : analysis ? (
            <div className="analysis-card">
              <h3>Sensei's Insights</h3>
              <div className="analysis-content">
                {analysis.data.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <p>No product detected.</p>
      )}
    </div>
  );
}

export default App;
