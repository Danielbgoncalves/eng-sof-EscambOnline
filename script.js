// Global state
let posts = [];
let favorites = [];
let currentUser = {
    name: 'Usuário',
    posts: [],
    joinDate: '2024'
};
let currentFilter = '';
let searchTerm = '';

// Sample data
const samplePosts = [
    {
        id: 1,
        title: 'Mouse Gamer RGB',
        description: 'Mouse gamer com iluminação RGB, 7 botões programáveis, sensor óptico de alta precisão. Usado por apenas 3 meses, em perfeito estado.',
        price: 85.00,
        type: 'venda',
        category: 'eletrônicos',
        location: 'centro',
        images: ['https://photos.enjoei.com.br/mouse-gamer-cooler-master-rgb-6-botoes-6000-dpi-cm110-original/1200xN/czM6Ly9waG90b3MuZW5qb2VpLmNvbS5ici9wcm9kdWN0cy85ODI2MDMyL2ZhYjkzZjI4MGE3MjM5MDMzZjQ3MjI0M2VjYTk5NzZlLmpwZw'],
        date: new Date('2024-09-10'),
        author: 'João Silva'
    },
    {
        id: 2,
        title: 'Sofá 3 lugares',
        description: 'Sofá em couro sintético, cor marrom, 3 lugares. Muito confortável e em bom estado de conservação. Aceito trocas por mesa de jantar.',
        price: 450.00,
        type: 'troca',
        category: 'móveis',
        location: 'zona-norte',
        images: ['https://th.bing.com/th/id/R.01442ad1fad8b3552a1e30278a065d93?rik=SOfAt%2bWd%2bQO0lg&riu=http%3a%2f%2fwww.sofasdeco.com%2fImagenes%2fclaves-para-escoger-el-mejor-sofa.jpg&ehk=L7jPvfgf0dRTp2tekdZQ37nF5uiCYhVm%2fTJxyppY2wo%3d&risl=&pid=ImgRaw&r=0'],
        date: new Date('2024-09-12'),
        author: 'Maria Santos'
    },
    {
        id: 3,
        title: 'PlayStation 5',
        description: 'Console PlayStation 5 seminovo, com 2 controles e 3 jogos inclusos. Funcionando perfeitamente, sem riscos ou defeitos.',
        price: 2800.00,
        type: 'venda',
        category: 'games',
        location: 'zona-sul',
        images: ['https://photos.enjoei.com.br/play-station-2-fat-impecavel/1200xN/czM6Ly9waG90b3MuZW5qb2VpLmNvbS5ici9wcm9kdWN0cy8yNzUxMzE4OS9lNWFhMmJjZTBhZGU3MGVkMjFiMjE0NWU4YmZkMDkyMC5qcGc'],
        date: new Date('2024-09-11'),
        author: 'Carlos Oliveira'
    },
    
];

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    posts = [...samplePosts];
    loadFromStorage();
    showHomePage();
    renderPosts();
    updateUserStats();
});

// Storage functions
function saveToStorage() {
    localStorage.setItem('trocaonline_posts', JSON.stringify(posts));
    localStorage.setItem('trocaonline_favorites', JSON.stringify(favorites));
    localStorage.setItem('trocaonline_user', JSON.stringify(currentUser));
}

function loadFromStorage() {
    const savedPosts = localStorage.getItem('trocaonline_posts');
    const savedFavorites = localStorage.getItem('trocaonline_favorites');
    const savedUser = localStorage.getItem('trocaonline_user');

    if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts);
        // Merge with sample posts, avoiding duplicates
        parsedPosts.forEach(post => {
            if (!posts.find(p => p.id === post.id)) {
                posts.push(post);
            }
        });
    }

    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
    }

    if (savedUser) {
        currentUser = { ...currentUser, ...JSON.parse(savedUser) };
    }
}

// Navigation functions
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
}

function showHomePage() {
    showPage('homePage');
    document.querySelector('.nav-btn').classList.add('active');
    renderPosts();
}

function showCreatePost() {
    showPage('createPostPage');
    document.getElementById('createPostForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
}

function showProfile() {
    showPage('profilePage');
    updateUserStats();
    renderUserPosts();
}

function toggleFavorites() {
    showPage('favoritesPage');
    renderFavorites();
}

function showPostDetail(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    showPage('postDetailPage');

    const content = document.getElementById('postDetailContent');
    content.innerHTML = `
        <div class="post-detail-content">
            <img src="${post.images[0]}" alt="${post.title}" class="post-detail-image">
            <div class="post-detail-info">
                <div class="post-detail-main">
                    <h1>${post.title}</h1>
                    <p>${post.description}</p>
                    <div class="post-actions">
                        <button class="btn-chat" onclick="startChat('${post.author}', ${post.id})">💬 Conversar</button>
                        <button class="btn-contact" onclick="showContact('${post.author}')">📞 Contato</button>
                    </div>
                </div>
                <div class="post-detail-sidebar">
                    <div class="post-price">R$ ${post.price.toFixed(2)}</div>
                    <div class="post-type-badge ${post.type}">${post.type.toUpperCase()}</div>
                    <p><strong>Categoria:</strong> ${post.category}</p>
                    <p><strong>Localização:</strong> ${post.location.replace('-', ' ')}</p>
                    <p><strong>Anunciante:</strong> ${post.author}</p>
                    <p><strong>Publicado em:</strong> ${formatDate(post.date)}</p>
                    <button class="btn-primary" onclick="toggleFavorite(${post.id})" style="margin-top: 1rem; width: 100%;">
                        ${favorites.includes(post.id) ? '❤️ Remover dos Favoritos' : '🤍 Adicionar aos Favoritos'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Chat implementation (persistente por anúncio)
let chatMessages = [];
let currentChatPostId = null;

function chatStorageKey(postId) {
    return `trocaonline_chat_${postId}`;
}

function loadChatFromStorage(postId) {
    try {
        const raw = localStorage.getItem(chatStorageKey(postId));
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Erro ao carregar chat do storage', err);
        return [];
    }
}

function saveChatToStorage(postId, messages) {
    try {
        localStorage.setItem(chatStorageKey(postId), JSON.stringify(messages));
    } catch (err) {
        console.error('Erro ao salvar chat no storage', err);
    }
}

function startChat(author, postId) {
    // Abre a página de chat para o post informado e carrega mensagens
    currentChatPostId = postId;

    // Atualiza título do header do chat
    const header = document.querySelector('#chatPage .chat-header h2');
    if (header) header.textContent = `Chat: ${author}`;

    // Carrega mensagens do localStorage e renderiza
    chatMessages = loadChatFromStorage(postId);
    showPage('chatPage');
    renderChatMessages();

    // Foca no input
    const input = document.getElementById('chatInput');
    if (input) input.focus();
}

function sendChatMessage(e) {
    e.preventDefault();
    if (!currentChatPostId) return;
    const input = document.getElementById('chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const message = {
        text,
        at: new Date().toISOString()
    };

    // Adiciona e salva
    chatMessages.push(message);
    saveChatToStorage(currentChatPostId, chatMessages);

    // Atualiza UI
    input.value = '';
    renderChatMessages();
    input.focus();
}

function renderChatMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (!chatMessages || chatMessages.length === 0) {
        container.innerHTML = '<div style="color:#888;text-align:center;">Nenhuma mensagem enviada.</div>';
        container.scrollTop = container.scrollHeight;
        return;
    }

    container.innerHTML = chatMessages.map(m => {
        // formata horário local simples
        const time = new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `<div class="chat-message"><div>${escapeHtml(m.text)}</div><div style="font-size:0.7rem;opacity:0.75;margin-top:4px;text-align:right">${time}</div></div>`;
    }).join('');

    // scroll para baixo
    container.scrollTop = container.scrollHeight;
}

// Pequena função de escape para evitar injeção simples
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Post rendering functions
function renderPosts(postsToRender = null) {
    const grid = document.getElementById('postsGrid');
    const postsToShow = postsToRender || getFilteredPosts();

    if (postsToShow.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum anúncio encontrado</h3>
                <p>Tente ajustar os filtros ou criar um novo anúncio</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = postsToShow.map(post => `
        <div class="post-card" onclick="showPostDetail(${post.id})">
            <div class="post-image">
                <img src="${post.images[0]}" alt="${post.title}">
                <div class="post-type-badge ${post.type}">${post.type.toUpperCase()}</div>
                <button class="favorite-btn ${favorites.includes(post.id) ? 'active' : ''}" 
                        onclick="event.stopPropagation(); toggleFavorite(${post.id})">
                    ${favorites.includes(post.id) ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-description">${post.description}</p>
                <div class="post-price">R$ ${post.price.toFixed(2)}</div>
                <div class="post-location">📍 ${post.location.replace('-', ' ')} </div>
                <div class="post-actions">
                    <button class="btn-chat" onclick="event.stopPropagation(); startChat('${post.author}', ${post.id})">💬 Chat</button>
                    <button class="btn-contact" onclick="event.stopPropagation(); showContact('${post.author}')">📱 Contato</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderUserPosts() {
    const grid = document.getElementById('userPostsGrid');
    const userPosts = posts.filter(post => currentUser.posts.includes(post.id));

    if (userPosts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>Você ainda não tem anúncios</h3>
                <p>Crie seu primeiro anúncio para começar</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = userPosts.map(post => `
        <div class="post-card" onclick="showPostDetail(${post.id})">
            <div class="post-image">
                <img src="${post.images[0]}" alt="${post.title}">
                <div class="post-type-badge ${post.type}">${post.type.toUpperCase()}</div>
            </div>
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-price">R$ ${post.price.toFixed(2)}</div>
                <div class="post-location">📍 ${post.location.replace('-', ' ')}</div>
            </div>
        </div>
    `).join('');
}

function renderFavorites() {
    const grid = document.getElementById('favoritesGrid');
    const favoritePosts = posts.filter(post => favorites.includes(post.id));

    if (favoritePosts.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum favorito ainda</h3>
                <p>Adicione anúncios aos seus favoritos para vê-los aqui</p>
            </div>
        `;
        return;
    }

    renderPosts(favoritePosts);
    // Update the grid content for favorites page
    grid.innerHTML = document.getElementById('postsGrid').innerHTML;
}

// Filtering and search functions
function getFilteredPosts() {
    let filtered = posts;

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(post =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Apply category filter
    if (currentFilter && currentFilter !== 'todos') {
        if (currentFilter === 'troca' || currentFilter === 'venda') {
            filtered = filtered.filter(post => post.type === currentFilter);
        } else {
            filtered = filtered.filter(post => post.category === currentFilter);
        }
    }

    // Apply price filter
    const priceFilter = document.getElementById('priceFilter').value;
    if (priceFilter) {
        filtered = filtered.filter(post => {
            const price = post.price;
            switch (priceFilter) {
                case '0-50': return price >= 0 && price <= 50;
                case '50-100': return price > 50 && price <= 100;
                case '100-500': return price > 100 && price <= 500;
                case '500+': return price > 500;
                default: return true;
            }
        });
    }

    // Apply location filter
    const locationFilter = document.getElementById('locationFilter').value;
    if (locationFilter) {
        filtered = filtered.filter(post => post.location === locationFilter);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function searchItems() {
    searchTerm = document.getElementById('searchInput').value;
    renderPosts();
}

function filterCategory(category) {
    currentFilter = category;

    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    renderPosts();
}

function showAllPosts() {
    currentFilter = '';
    searchTerm = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('locationFilter').value = '';

    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    renderPosts();
}

function applyFilters() {
    renderPosts();
}

// Post creation functions
document.getElementById('createPostForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const imageFiles = document.getElementById('postImages').files;

    // Helper: converte File -> DataURL com Promise
    const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(file);
    });

    let images = [];
    try {
        if (imageFiles && imageFiles.length > 0) {
            // Aguarda todas as leituras concluírem
            images = await Promise.all(Array.from(imageFiles).map(f => readFileAsDataURL(f)));
        }
    } catch (err) {
        console.error('Falha ao processar imagens:', err);
        alert('Não foi possível processar as imagens. Tente novamente.');
        return;
    }

    // Create new post
    const newPost = {
        id: Date.now(),
        title: document.getElementById('postTitle').value,
        description: document.getElementById('postDescription').value,
        price: parseFloat(document.getElementById('postPrice').value) || 0,
        type: document.getElementById('postType').value,
        category: document.getElementById('postCategory').value,
        location: document.getElementById('postLocation').value,
        images: images.length > 0 ? images : ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE2Ij5TZW0gaW1hZ2VtPC90ZXh0Pgo8L3N2Zz4='],
        date: new Date(),
        author: currentUser.name
    };

    posts.unshift(newPost);
    currentUser.posts.push(newPost.id);

    saveToStorage();

    alert('Anúncio criado com sucesso!');
    showHomePage();
});

function previewImages() {
    const files = document.getElementById('postImages').files;
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            preview.appendChild(img);
        };

        reader.readAsDataURL(file);
    }
}

// Favorites functions
function toggleFavorite(postId) {
    const index = favorites.indexOf(postId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(postId);
    }

    saveToStorage();
    updateUserStats();

    // Update UI
    const favoriteBtn = document.querySelector(`[onclick*="toggleFavorite(${postId})"]`);
    if (favoriteBtn) {
        favoriteBtn.classList.toggle('active');
        favoriteBtn.innerHTML = favorites.includes(postId) ? '❤️' : '🤍';
    }

    // If we're on the favorites page, re-render
    if (document.getElementById('favoritesPage').classList.contains('active')) {
        renderFavorites();
    }
}

// User stats and utility functions
function updateUserStats() {
    document.getElementById('userPostsCount').textContent = currentUser.posts.length;
    document.getElementById('userFavoritesCount').textContent = favorites.length;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
}

function showContact(author) {
    alert(`Contato de ${author}:\nTelefone: (11) 99999-9999\nEmail: contato@exemplo.com`);
}

// Search on Enter key
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchItems();
    }
});

