document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const tokensList = document.getElementById('tokens-list');
    const tokenTemplate = document.getElementById('token-template');
    const refreshBtn = document.getElementById('refresh-btn');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const tokenDetailsPage = document.getElementById('token-details-page');
    const tokenDetailsContent = document.getElementById('token-details-content');
    const backBtn = document.getElementById('back-btn');
    const mainPage = document.querySelectorAll('.tokens-container, .header, .refresh-container, .search-container');
    
    // CoinMarketCap API Key
    const apiKey = '3686368c-06bb-4804-9a8b-17b999f8ee07';
    
    // Store all tokens data
    let allTokensData = [];
    
    // Function to format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: price < 1 ? 4 : 2
        }).format(price);
    };
    
    // Function to format change percentage
    const formatChange = (change) => {
        return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
    };
    
    // Function to format market cap
    const formatMarketCap = (marketCap) => {
        if (marketCap >= 1e12) {
            return `$${(marketCap / 1e12).toFixed(2)}T`;
        } else if (marketCap >= 1e9) {
            return `$${(marketCap / 1e9).toFixed(2)}B`;
        } else if (marketCap >= 1e6) {
            return `$${(marketCap / 1e6).toFixed(2)}M`;
        } else {
            return `$${marketCap.toFixed(2)}`;
        }
    };
    
    // Function to fetch data from CoinMarketCap API
    const fetchTopTokens = async (limit = 100) => {
        try {
            // Since we're running this client-side, we need to use a proxy server or backend
            // to avoid CORS issues. For demonstration purposes, we'll use a proxy.
            // In a real production app, you should have a backend service to make these requests.
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const apiUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=${limit}`;
            
            const response = await fetch(`${proxyUrl}${apiUrl}`, {
                method: 'GET',
                headers: {
                    'X-CMC_PRO_API_KEY': apiKey,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            // Store all tokens for search functionality
            allTokensData = data.data.map(token => ({
                id: token.id,
                name: token.name,
                symbol: token.symbol,
                price: token.quote.USD.price,
                change: token.quote.USD.percent_change_24h,
                market_cap: token.quote.USD.market_cap,
                volume_24h: token.quote.USD.volume_24h,
                circulating_supply: token.circulating_supply,
                max_supply: token.max_supply,
                image: `https://s2.coinmarketcap.com/static/img/coins/64x64/${token.id}.png`
            }));
            
            return allTokensData.slice(0, 5); // Return only top 5 for main display
        } catch (error) {
            console.error('Error fetching data:', error);
            // Fallback to mock data in case of error
            allTokensData = [
                {
                    id: 1,
                    name: 'Bitcoin',
                    symbol: 'BTC',
                    price: 58932.45,
                    change: 2.34,
                    market_cap: 1095876543210,
                    volume_24h: 32654789123,
                    circulating_supply: 18700000,
                    max_supply: 21000000,
                    image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
                },
                {
                    id: 2,
                    name: 'Ethereum',
                    symbol: 'ETH',
                    price: 2845.67,
                    change: -1.23,
                    market_cap: 342765432109,
                    volume_24h: 17654321098,
                    circulating_supply: 120500000,
                    max_supply: null,
                    image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
                },
                {
                    id: 3,
                    name: 'Binance Coin',
                    symbol: 'BNB',
                    price: 432.19,
                    change: 5.67,
                    market_cap: 65432109876,
                    volume_24h: 9876543210,
                    circulating_supply: 153400000,
                    max_supply: 170000000,
                    image: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
                },
                {
                    id: 4,
                    name: 'Solana',
                    symbol: 'SOL',
                    price: 142.87,
                    change: 8.41,
                    market_cap: 43210987654,
                    volume_24h: 5432109876,
                    circulating_supply: 310700000,
                    max_supply: null,
                    image: 'https://cryptologos.cc/logos/solana-sol-logo.png'
                },
                {
                    id: 5,
                    name: 'Cardano',
                    symbol: 'ADA',
                    price: 1.32,
                    change: -0.76,
                    market_cap: 32109876543,
                    volume_24h: 3210987654,
                    circulating_supply: 32000000000,
                    max_supply: 45000000000,
                    image: 'https://cryptologos.cc/logos/cardano-ada-logo.png'
                }
            ];
            return allTokensData.slice(0, 5);
        }
    };
    
    // Function to render tokens
    const renderTokens = (tokens) => {
        tokensList.innerHTML = '';
        
        tokens.forEach((token, index) => {
            const tokenCard = document.importNode(tokenTemplate.content, true);
            
            tokenCard.querySelector('.token-rank').textContent = index + 1;
            tokenCard.querySelector('.token-name').textContent = token.name;
            tokenCard.querySelector('.token-symbol').textContent = token.symbol;
            tokenCard.querySelector('.token-price').textContent = formatPrice(token.price);
            
            const changeElement = tokenCard.querySelector('.token-change');
            changeElement.textContent = formatChange(token.change);
            changeElement.classList.add(token.change >= 0 ? 'positive' : 'negative');
            
            const iconImg = tokenCard.querySelector('.token-icon img');
            iconImg.src = token.image;
            iconImg.alt = token.name;
            
            // Add click event to show token details
            const card = tokenCard.querySelector('.token-card');
            card.addEventListener('click', () => {
                showTokenDetails(token);
            });
            
            // Add a small delay for each card to create a staggered animation effect
            setTimeout(() => {
                tokensList.appendChild(tokenCard);
            }, index * 100);
        });
    };
    
    // Function to show token details
    const showTokenDetails = (token) => {
        // Create token details content
        tokenDetailsContent.innerHTML = `
            <div class="token-detail-header">
                <div class="token-detail-icon">
                    <img src="${token.image}" alt="${token.name}">
                </div>
                <div class="token-detail-name">
                    <h1>${token.name}</h1>
                    <div class="token-detail-symbol">${token.symbol}</div>
                </div>
            </div>
            
            <div class="token-price-large">${formatPrice(token.price)}</div>
            <div class="token-change ${token.change >= 0 ? 'positive' : 'negative'}">${formatChange(token.change)}</div>
            
            <div class="token-detail-info">
                <div class="detail-item">
                    <div class="detail-label">Market Cap</div>
                    <div class="detail-value">${formatMarketCap(token.market_cap)}</div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">24h Volume</div>
                    <div class="detail-value">${formatMarketCap(token.volume_24h)}</div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">Circulating Supply</div>
                    <div class="detail-value">${new Intl.NumberFormat('en-US').format(token.circulating_supply)} ${token.symbol}</div>
                </div>
                
                ${token.max_supply ? `
                <div class="detail-item">
                    <div class="detail-label">Max Supply</div>
                    <div class="detail-value">${new Intl.NumberFormat('en-US').format(token.max_supply)} ${token.symbol}</div>
                </div>
                ` : ''}
            </div>
        `;
        
        // Hide main page and show token details
        mainPage.forEach(el => el.style.display = 'none');
        tokenDetailsPage.style.display = 'block';
    };
    
    // Back button to return to main page
    backBtn.addEventListener('click', () => {
        tokenDetailsPage.style.display = 'none';
        mainPage.forEach(el => el.style.display = '');
    });
    
    // Search functionality
    const handleSearch = () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (!searchTerm) {
            return;
        }
        
        // Find token by name or symbol
        const foundToken = allTokensData.find(token => 
            token.name.toLowerCase().includes(searchTerm) || 
            token.symbol.toLowerCase().includes(searchTerm)
        );
        
        if (foundToken) {
            showTokenDetails(foundToken);
            searchInput.value = ''; // Clear search input
        } else {
            // Show error if token not found
            tokensList.innerHTML = `
                <div class="no-results">
                    <p>No token found matching "${searchTerm}"</p>
                    <p>Please try a different search term</p>
                </div>
            `;
            
            // Clear error after 3 seconds
            setTimeout(() => {
                loadData(); // Reload original data
            }, 3000);
        }
    };
    
    // Search button click event
    searchBtn.addEventListener('click', handleSearch);
    
    // Search on Enter key
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Load data function
    const loadData = async () => {
        tokensList.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading top tokens...</p>
            </div>
        `;
        
        try {
            const tokens = await fetchTopTokens();
            renderTokens(tokens);
        } catch (error) {
            tokensList.innerHTML = `
                <div class="error">
                    <p>Error loading data. Please try again later.</p>
                    <button id="retry-btn">Retry</button>
                </div>
            `;
            
            document.getElementById('retry-btn').addEventListener('click', loadData);
        }
    };
    
    // Initial load
    loadData();
    
    // Refresh button functionality
    refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('loading');
        loadData().finally(() => {
            setTimeout(() => {
                refreshBtn.classList.remove('loading');
            }, 1000);
        });
    });
    
    // Auto refresh every 60 seconds
    setInterval(() => {
        refreshBtn.classList.add('loading');
        loadData().finally(() => {
            setTimeout(() => {
                refreshBtn.classList.remove('loading');
            }, 1000);
        });
    }, 60000);
});
