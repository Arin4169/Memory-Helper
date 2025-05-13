document.addEventListener('DOMContentLoaded', function() {
    // Elements - Main
    const mainScreen = document.getElementById('main-screen');
    const galleryScreen = document.getElementById('gallery-screen');
    const chatScreen = document.getElementById('chat-screen');
    const mainPhoto = document.getElementById('main-photo');
    const photoInfo = document.querySelector('.photo-info');
    
    // Elements - Gallery
    const photoUpload = document.getElementById('photo-upload');
    const photosContainer = document.getElementById('photos-container');
    
    // Elements - Chat
    const chatPhoto = document.getElementById('chat-photo');
    const chatMessages = document.getElementById('chat-messages');
    const userMessageInput = document.getElementById('user-message');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // API Settings
    const showApiSettingsBtn = document.getElementById('show-api-settings');
    const apiSettingsPanel = document.getElementById('api-settings-panel');
    const openaiApiKeyInput = document.getElementById('openai-api-key');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const cancelApiKeyBtn = document.getElementById('cancel-api-key');
    
    // Buttons
    const startChatMainBtn = document.getElementById('start-chat-main');
    const showGalleryBtn = document.getElementById('show-gallery');
    const loadRandomBtn = document.getElementById('load-random');
    const backToMainBtn = document.getElementById('back-to-main');
    const sendMessageBtn = document.getElementById('send-message');
    const backFromChatBtn = document.getElementById('back-from-chat');
    
    // State
    let photos = [];
    let currentPhotoIndex = -1;
    let openaiApiKey = '';
    let currentChatContext = [];
    let isAnalyzingImage = false;
    
    // Sample images
    const samplePhotos = [
        {
            name: '샘플 사진 1',
            path: 'gallery/20250411_2352_Harmonious Human-Robot Interaction_simple_compose_01jrjna5yvfw58efmqckfg0ezp.png'
        },
        {
            name: '샘플 사진 2',
            path: 'gallery/p7.png'
        },
        {
            name: '샘플 사진 3',
            path: 'gallery/SDGs5.png'
        }
    ];

    // Check for local storage
    initializeFromStorage();
    loadApiKey();
    
    // Event Listeners - Navigation
    showGalleryBtn.addEventListener('click', showGallery);
    backToMainBtn.addEventListener('click', showMain);
    loadRandomBtn.addEventListener('click', loadRandomPhoto);
    startChatMainBtn.addEventListener('click', startChat);
    backFromChatBtn.addEventListener('click', showMain);
    
    // Event Listeners - Functionality
    photoUpload.addEventListener('change', handlePhotoUpload);
    showApiSettingsBtn.addEventListener('click', toggleApiSettings);
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    cancelApiKeyBtn.addEventListener('click', closeApiSettings);
    sendMessageBtn.addEventListener('click', sendUserMessage);
    userMessageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });
    
    // Initialize App
    function initializeFromStorage() {
        const storedPhotos = localStorage.getItem('memoryHelperPhotos');
        if (storedPhotos) {
            photos = JSON.parse(storedPhotos);
            renderPhotoGallery();
            
            // Load a random photo if we have photos
            if (photos.length > 0) {
                loadRandomPhoto();
            } else {
                // No stored photos, load sample photos
                loadSamplePhotos();
            }
        } else {
            // First time usage, load sample photos
            loadSamplePhotos();
        }
    }
    
    function loadSamplePhotos() {
        // Only load sample photos if we don't have any photos yet
        if (photos.length === 0) {
            samplePhotos.forEach(samplePhoto => {
                loadImageAsDataURL(samplePhoto.path, function(dataUrl) {
                    const photoData = {
                        id: Date.now() + Math.random().toString(36).substr(2, 9),
                        src: dataUrl,
                        date: new Date().toISOString(),
                        name: samplePhoto.name
                    };
                    
                    photos.push(photoData);
                    saveToStorage();
                    renderPhotoGallery();
                    
                    // Load the first photo when it's ready
                    if (photos.length === 1) {
                        loadPhoto(0);
                    }
                });
            });
        }
    }
    
    function loadImageAsDataURL(url, callback) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            callback(dataURL);
        };
        img.src = url;
    }
    
    function loadApiKey() {
        const storedApiKey = localStorage.getItem('openaiApiKey');
        if (storedApiKey) {
            openaiApiKey = storedApiKey;
            openaiApiKeyInput.value = '••••••••••••••••••••••••••••';
        }
    }
    
    function saveToStorage() {
        localStorage.setItem('memoryHelperPhotos', JSON.stringify(photos));
    }
    
    // Navigation Functions
    function showMain() {
        mainScreen.classList.remove('hidden');
        galleryScreen.classList.add('hidden');
        chatScreen.classList.add('hidden');
    }
    
    function showGallery() {
        mainScreen.classList.add('hidden');
        galleryScreen.classList.remove('hidden');
        chatScreen.classList.add('hidden');
    }
    
    function showChat() {
        mainScreen.classList.add('hidden');
        galleryScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');
    }
    
    // API Settings Functions
    function toggleApiSettings() {
        apiSettingsPanel.classList.toggle('hidden');
    }
    
    function closeApiSettings() {
        apiSettingsPanel.classList.add('hidden');
    }
    
    function saveApiKey() {
        const newApiKey = openaiApiKeyInput.value.trim();
        if (newApiKey && newApiKey !== '••••••••••••••••••••••••••••') {
            openaiApiKey = newApiKey;
            localStorage.setItem('openaiApiKey', openaiApiKey);
            openaiApiKeyInput.value = '••••••••••••••••••••••••••••';
            apiSettingsPanel.classList.add('hidden');
            alert('API 키가 저장되었습니다.');
        } else if (newApiKey === '') {
            alert('유효한 API 키를 입력해주세요.');
        } else {
            apiSettingsPanel.classList.add('hidden');
        }
    }
    
    // Photo Functions
    function handlePhotoUpload(event) {
        const files = event.target.files;
        
        if (!files || files.length === 0) return;
        
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const photoData = {
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    src: e.target.result,
                    date: new Date().toISOString(),
                    name: file.name.replace(/\.[^/.]+$/, "") // Remove extension
                };
                
                photos.push(photoData);
                saveToStorage();
                renderPhotoGallery();
                
                // If this is the first photo, load it
                if (photos.length === 1) {
                    loadPhoto(0);
                    showMain();
                }
            };
            
            reader.readAsDataURL(file);
        });
        
        // Reset input
        event.target.value = '';
    }
    
    function renderPhotoGallery() {
        // Clear current photos (except upload box)
        const uploadBox = photosContainer.querySelector('.upload-box');
        photosContainer.innerHTML = '';
        photosContainer.appendChild(uploadBox);
        
        // Add photos
        photos.forEach((photo, index) => {
            const photoElement = document.createElement('div');
            photoElement.className = 'photo-item';
            photoElement.innerHTML = `<img src="${photo.src}" alt="${photo.name || '가족 사진'}">`;
            photoElement.addEventListener('click', () => {
                loadPhoto(index);
                showMain();
            });
            
            photosContainer.appendChild(photoElement);
        });
    }
    
    function loadPhoto(index) {
        if (photos.length === 0) return;
        
        currentPhotoIndex = index;
        mainPhoto.src = photos[currentPhotoIndex].src;
        photoInfo.textContent = photos[currentPhotoIndex].name || '추억의 사진';
    }
    
    function loadRandomPhoto() {
        if (photos.length === 0) {
            alert('사진을 먼저 추가해주세요.');
            return;
        }
        
        let newIndex;
        // If we have more than one photo, make sure we don't show the same one twice
        if (photos.length > 1) {
            do {
                newIndex = Math.floor(Math.random() * photos.length);
            } while (newIndex === currentPhotoIndex);
        } else {
            newIndex = 0;
        }
        
        loadPhoto(newIndex);
    }
    
    // Chat Functions
    async function startChat() {
        if (photos.length === 0) {
            alert('사진을 먼저 추가해주세요.');
            return;
        }
        
        if (!openaiApiKey) {
            alert('OpenAI API 키를 먼저 설정해주세요.');
            toggleApiSettings();
            return;
        }
        
        showChat();
        
        // Set the small photo in chat
        chatPhoto.src = photos[currentPhotoIndex].src;
        
        // Clear previous chat
        chatMessages.innerHTML = '';
        currentChatContext = [];
        
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        isAnalyzingImage = true;
        
        // Add initial message
        addBotMessage('안녕하세요! 사진을 분석하고 있어요. 잠시만 기다려주세요...');
        
        try {
            const currentPhoto = photos[currentPhotoIndex];
            const imageDescription = await analyzeImage(currentPhoto.src);
            
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            isAnalyzingImage = false;
            
            // Start conversation with analyzed image
            const initialPrompt = `이 사진에는 ${imageDescription}이(가) 보입니다. 이 사진에 대해 함께 이야기해 볼까요?`;
            
            currentChatContext.push({ role: 'system', content: `이 대화는 치매 어르신을 위한 기억 회상 도우미입니다. 어르신이 사진 속 기억을 더 잘 회상하도록 도와주세요. 사진에는 '${imageDescription}'이(가) 보입니다. 어르신이 그 시절의 기억을 회상할 수 있도록 구체적인 질문을 해주세요. 친근하고 따뜻한 말투로 대화해주세요. 사진 속 내용에 대해 물어보거나, 당시의 기억, 감정, 관련된 이야기를 끌어내는 질문을 해주세요.` });
            currentChatContext.push({ role: 'assistant', content: initialPrompt });
            
            addBotMessage(initialPrompt);
        } catch (error) {
            console.error('Image analysis error:', error);
            loadingIndicator.classList.add('hidden');
            isAnalyzingImage = false;
            addBotMessage('사진 분석에 문제가 발생했습니다. 다시 시도해 주세요.');
        }
    }
    
    async function analyzeImage(imageUrl) {
        try {
            // Extract base64 data from the data URL
            const base64Image = imageUrl.split(',')[1];
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4-vision-preview",
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text", 
                                    text: "이 사진에 무엇이 보이는지 한국어로 자세히 설명해주세요. 사진 속에 있는 인물, 장소, 물건 등을 최대한 상세하게 묘사해주세요. 마지막에는 이 사진이 언제 찍힌 것처럼 보이는지 시대나 연도에 대한 추측도 포함해주세요."
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/jpeg;base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 500
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error analyzing image:', error);
            throw error;
        }
    }
    
    async function sendUserMessage() {
        if (isAnalyzingImage) return;
        
        const userMessage = userMessageInput.value.trim();
        if (!userMessage) return;
        
        // Add user message to UI
        addUserMessage(userMessage);
        userMessageInput.value = '';
        
        // Add to context
        currentChatContext.push({ role: 'user', content: userMessage });
        
        // Show loading
        loadingIndicator.classList.remove('hidden');
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4-turbo",
                    messages: currentChatContext,
                    max_tokens: 500
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            const botReply = data.choices[0].message.content;
            
            // Add to context
            currentChatContext.push({ role: 'assistant', content: botReply });
            
            // Add bot message to UI
            addBotMessage(botReply);
        } catch (error) {
            console.error('Chat API error:', error);
            addBotMessage('죄송합니다, 대화 중 오류가 발생했습니다.');
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    }
    
    function addUserMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function addBotMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}); 