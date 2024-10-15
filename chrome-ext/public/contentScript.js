let allowedSites = [];

fetch(chrome.runtime.getURL('allowedSites.js'))
  .then(response => response.json())
  .then(sites => {
    allowedSites = sites;
    console.log('Allowed sites loaded:', allowedSites);
  })
  .catch(error => console.error('Error loading allowed sites:', error));

function isAllowedDomain() {
  const currentUrl = window.location.href;
  console.log('Current URL:', currentUrl);
  const isAllowed = allowedSites.some(site => {
    const pattern = site.replace(/\*/g, '.*').replace(/\//g, '\\/');
    const regex = new RegExp(`^${pattern}$`);
    const matches = regex.test(currentUrl);
    console.log(`Checking against pattern: ${pattern}, Matches: ${matches}`);
    return matches;
  });
  console.log('Is Allowed:', isAllowed);
  return isAllowed;
}

async function detectZaraProduct() {
  const url = new URL(window.location.href);
  let productId = null;

  // Try to extract the product ID from the URL parameters
  const params = new URLSearchParams(url.search);
  if (params.has('v1')) {
    productId = params.get('v1');
  } else {
    // If not in URL parameters, try to extract from the pathname
    const match = url.pathname.match(/p(\d+)\.html/);
    if (match) {
      productId = match[1];
    }
  }

  console.log('Product ID:', productId);
  
  if (!productId) return null;

  try {
    const response = await fetch(`https://www.zara.com/ca/en/products-details?productIds=${productId}&ajax=true`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      const product = data[0];
      return {
        title: product.name,
        description: product.detail.colors[0].rawDescription,
        images: product.detail.colors[0].xmedia.map(media => media.url.replace('{width}', '500')),
        price: (product.detail.colors[0].price / 100).toFixed(2),
        sizes: product.detail.colors[0].sizes.map(size => ({
          name: size.name,
          availability: size.availability
        })),
        composition: product.detail.detailedComposition.parts.map(part => ({
          description: part.description,
          components: part.components.map(comp => `${comp.percentage} ${comp.material}`).join(', ')
        }))
      };
    }
  } catch (error) {
    console.error('Error fetching Zara product details:', error);
  }

  return null;
}

function detectGenericProduct() {
  const product = {
    title: document.querySelector('h1')?.textContent || '',
    description: document.querySelector('meta[name="description"]')?.content || '',
    images: Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src)
  };

  return product;
}

async function detectProduct() {
  if (!isAllowedDomain()) return null;

  if (window.location.hostname.includes('zara.com')) {
    return await detectZaraProduct();
  } else {
    return detectGenericProduct();
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  if (request.action === 'getProductInfo') {
    detectProduct().then(product => {
      console.log('Detected product:', product);
      sendResponse({ product: product });
    });
    return true; // Indicates that the response will be sent asynchronously
  }
});

console.log('Content script loaded');
