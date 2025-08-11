// Enhanced Application State
const AppState = {
    user: null,
    isAdmin: false,
    uploadedImages: [],
    referenceImages: [],
    processingQueue: [],
    selectedMusic: 'none',
    customAudio: null,
    selectedAspectRatio: '16:9',
    videoHistory: [],
    galleryVideos: [],
    subscriptionPlan: 'free',
    freeCreditsUsed: 0,
    maxFreeCredits: 2,
    isReorderMode: false,
    compressionEnabled: true,
    networkRetries: 3,
    uploadProgress: {},
    currentlyPlaying: null,
    selectedMotion: 'gentle',
    motionIntensity: 50,
    autoEnhancePrompt: false,
    batchMode: 'parallel',
    isAuthenticated: false,
    isLoading: false
};

// Currency and location detection
async function detectIndianUser() {
    try {
        // Try to get user's location from timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone === 'Asia/Kolkata' || timezone === 'Asia/Calcutta') {
            return true;
        }
        
        // Fallback: Try to detect from IP (simplified)
        const response = await fetch('https://ipapi.co/json/', { timeout: 2000 });
        const data = await response.json();
        return data.country_code === 'IN';
    } catch (error) {
        console.log('Location detection failed, defaulting to Indian pricing');
        // Default to Indian pricing if detection fails
        return true;
    }
}

// Update pricing display based on user location
async function updatePricingDisplay() {
    console.log('🔄 Updating pricing display...');
    const isIndianUser = await detectIndianUser();
    console.log('🌍 User location detected - Indian user:', isIndianUser);
    
    const priceElements = document.querySelectorAll('[data-inr][data-usd]');
    console.log('💰 Found', priceElements.length, 'pricing elements');
    
    priceElements.forEach(element => {
        const inrPrice = element.getAttribute('data-inr');
        const usdPrice = element.getAttribute('data-usd');
        const newPrice = isIndianUser ? inrPrice : usdPrice;
        console.log('💸 Updating price:', element.textContent, '→', newPrice);
        element.textContent = newPrice;
    });
    
    console.log('✅ Pricing display updated successfully');
}

// Enhanced Page Transitions
function showSection(sectionName) {
    console.log('showSection called with:', sectionName);
    
    // Check admin access for admin section
    if (sectionName === 'admin' && !AppState.isAdmin) {
        showNotification('❌ Admin access required', 'error');
        return;
    }
    
    const currentSection = document.querySelector('.main-section.active');
    const targetSection = document.getElementById(sectionName);
    
    console.log('Current section:', currentSection);
    console.log('Target section:', targetSection);
    
    if (!targetSection) {
        console.error('Target section not found:', sectionName);
        return;
    }
    
    if (currentSection) {
        currentSection.classList.add('page-transition-out');
        setTimeout(() => {
            currentSection.classList.remove('active', 'page-transition-out');
            targetSection.classList.add('active', 'page-transition');
            
            // Load section-specific content
            if (sectionName === 'gallery') {
                loadGallery();
            } else if (sectionName === 'generator') {
                updateGenerateButton();
            } else if (sectionName === 'pricing') {
                updatePricingDisplay();
            } else if (sectionName === 'admin' && AppState.isAdmin) {
                console.log('Loading admin section...');
                // Make sure admin section is fully visible
                const adminSection = document.getElementById('admin');
                if (adminSection) {
                    adminSection.style.display = 'block';
                    adminSection.style.opacity = '1';
                    adminSection.style.visibility = 'visible';
                }
                setTimeout(() => {
                    console.log('Admin section timeout triggered');
                    loadAdminStats();
                    loadNotifications();
                }, 500);
            }
        }, 300);
    } else {
        targetSection.classList.add('active', 'page-transition');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Close user menu if open
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (dropdownMenu) {
        dropdownMenu.style.display = 'none';
    }
}

// AI Prompt Enhancement Functions
async function enhancePrompt() {
    const promptInput = document.getElementById('prompt-input');
    const enhanceBtn = document.getElementById('enhance-btn');
    const enhancedPromptDiv = document.getElementById('enhanced-prompt');
    
    const originalPrompt = promptInput.value.trim();
    
    if (!originalPrompt && !AppState.uploadedImages.length) {
        showNotification('Please add some text or upload images for prompt enhancement', 'error');
        return;
    }
    
    enhanceBtn.disabled = true;
    enhanceBtn.textContent = '🔄 Enhancing...';
    
    try {
        // Mock AI enhancement (replace with actual Gemini API call)
        const enhancedPrompt = await mockPromptEnhancement(originalPrompt);
        
        document.getElementById('enhanced-prompt-text').textContent = enhancedPrompt;
        enhancedPromptDiv.classList.add('show');
        
        showNotification('✨ Prompt enhanced successfully!', 'success');
        
    } catch (error) {
        showNotification('❌ Failed to enhance prompt. Please try again.', 'error');
    } finally {
        enhanceBtn.disabled = false;
        enhanceBtn.textContent = '✨ Enhance with AI';
    }
}

// AI prompt enhancement using Gemini API
async function mockPromptEnhancement(originalPrompt) {
    // For now, simulate API delay and enhanced response
    // In production, this would call the backend which uses Gemini API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const imageDescriptions = AppState.uploadedImages.map(img => 
        `image of ${img.name.replace(/\.[^/.]+$/, "")}`
    ).join(', ');
    
    const basePrompt = originalPrompt || "Create a dynamic video";
    const motionStyle = AppState.selectedMotion;
    const aspectRatio = AppState.selectedAspectRatio;
    
    // This will be replaced with actual Gemini API call through backend
    return `${basePrompt}. Professional ${motionStyle} motion with smooth transitions. Optimized for ${aspectRatio} aspect ratio. Cinematic lighting and color grading. High-quality visual effects with natural movement flow. Enhanced with AI-driven scene understanding and motion prediction. ${imageDescriptions ? `Based on: ${imageDescriptions}` : ''}`;
}

function useEnhancedPrompt() {
    const enhancedText = document.getElementById('enhanced-prompt-text').textContent;
    document.getElementById('prompt-input').value = enhancedText;
    document.getElementById('enhanced-prompt').classList.remove('show');
    showNotification('✅ Enhanced prompt applied!', 'success');
}

function rejectEnhancedPrompt() {
    document.getElementById('enhanced-prompt').classList.remove('show');
    showNotification('Original prompt kept', 'info');
}

function toggleAutoEnhance() {
    AppState.autoEnhancePrompt = !AppState.autoEnhancePrompt;
    const btn = document.getElementById('auto-enhance-btn');
    
    if (AppState.autoEnhancePrompt) {
        btn.textContent = '🤖 Auto-Enhance: ON';
        btn.style.background = 'rgba(76, 175, 80, 0.3)';
        showNotification('🤖 Auto-enhancement enabled', 'success');
    } else {
        btn.textContent = '🤖 Auto-Enhance: OFF';
        btn.style.background = 'rgba(255,255,255,0.1)';
        showNotification('Auto-enhancement disabled', 'info');
    }
}

// Advanced Motion Control Functions
function selectMotion(motionType) {
    AppState.selectedMotion = motionType;
    
    document.querySelectorAll('.motion-preset').forEach(preset => {
        preset.classList.remove('selected');
    });
    
    document.querySelector(`[data-motion="${motionType}"]`).classList.add('selected');
    
    // Update motion intensity slider based on selected type
    const intensitySlider = document.getElementById('motion-intensity-slider');
    const defaultIntensities = {
        gentle: 30,
        smooth: 50,
        dynamic: 70,
        cinematic: 60
    };
    
    intensitySlider.value = defaultIntensities[motionType];
    AppState.motionIntensity = defaultIntensities[motionType];
    document.getElementById('motion-intensity-value').textContent = defaultIntensities[motionType];
    
    showNotification(`Motion style: ${motionType}`, 'info');
}

// Reference Images Management
function setReferenceImages() {
    if (AppState.uploadedImages.length === 0) {
        showNotification('Please upload images first', 'error');
        return;
    }
    
    const selectedImages = AppState.uploadedImages.filter((_, index) => 
        document.querySelectorAll('.queue-item')[index]?.classList.contains('selected')
    );
    
    if (selectedImages.length === 0) {
        // If none selected, use the first image as reference
        AppState.referenceImages = [AppState.uploadedImages[0]];
        document.querySelector('.queue-item').classList.add('reference-image');
        showNotification('First image set as reference', 'success');
    } else {
        AppState.referenceImages = selectedImages;
        showNotification(`${selectedImages.length} reference images set`, 'success');
    }
    
    renderImageQueue();
}

// Enhanced Image Queue with Reference Support
function renderImageQueue() {
    const queueContainer = document.getElementById('image-queue');
    
    if (AppState.uploadedImages.length === 0) {
        queueContainer.innerHTML = '';
        return;
    }
    
    queueContainer.innerHTML = AppState.uploadedImages.map((image, index) => {
        const isReference = AppState.referenceImages.some(ref => ref.id === image.id);
        return `
            <div class="queue-item ${isReference ? 'reference-image' : ''}" 
                 draggable="${AppState.isReorderMode}" 
                 data-id="${image.id}" 
                 data-index="${index}"
                 onclick="toggleImageSelection(this)"
                 ondragstart="handleDragStart(event)" 
                 ondragover="handleDragOver(event)"
                 ondrop="handleDrop(event)">
                <img src="${image.preview}" alt="${image.name}" loading="lazy">
                <button class="remove-btn" onclick="removeFromQueue('${image.id}', event)">&times;</button>
                <div class="order-number">${index + 1}</div>
                ${isReference ? '<div class="reference-badge">REF</div>' : ''}
                ${image.compressed ? '<div style="position: absolute; bottom: 5px; right: 5px; background: rgba(76, 175, 80, 0.8); color: white; padding: 1px 3px; border-radius: 3px; font-size: 8px;">COMP</div>' : ''}
            </div>
        `;
    }).join('');
}

function toggleImageSelection(element) {
    if (AppState.isReorderMode) return; // Don't select during reorder mode
    element.classList.toggle('selected');
}

function removeFromQueue(imageId, event) {
    event.stopPropagation();
    AppState.uploadedImages = AppState.uploadedImages.filter(img => img.id != imageId);
    AppState.referenceImages = AppState.referenceImages.filter(img => img.id != imageId);
    renderImageQueue();
    updateQueueControls();
    updateGenerateButton();
    showNotification('Image removed from queue', 'info');
}

// Enhanced Music Management with Local Files
function selectTrack(trackId) {
    AppState.selectedMusic = trackId;
    
    // Update UI
    document.querySelectorAll('.music-track').forEach(track => {
        track.classList.remove('selected');
    });
    
    const selectedTrack = document.querySelector(`[data-track="${trackId}"]`);
    if (selectedTrack) {
        selectedTrack.classList.add('selected');
    }
    
    showNotification(`Music: ${trackId === 'none' ? 'No music' : trackId}`, 'info');
}

function playPreview(trackId) {
    // Stop currently playing track
    if (AppState.currentlyPlaying) {
        const currentAudio = document.getElementById(`audio-${AppState.currentlyPlaying}`);
        currentAudio.pause();
        currentAudio.currentTime = 0;
        
        // Reset UI
        const currentTrack = document.querySelector(`[data-track="${AppState.currentlyPlaying}"]`);
        currentTrack.classList.remove('playing');
        const currentBtn = currentTrack.querySelector('.play-btn');
        currentBtn.textContent = '▶️';
    }
    
    if (AppState.currentlyPlaying === trackId) {
        // If clicking the same track, just stop
        AppState.currentlyPlaying = null;
        return;
    }
    
    // Play new track
    const audio = document.getElementById(`audio-${trackId}`);
    const track = document.querySelector(`[data-track="${trackId}"]`);
    const playBtn = track.querySelector('.play-btn');
    const waveform = document.getElementById(`waveform-${trackId}`);
    
    if (!audio) {
        // Fallback for missing audio files
        showNotification(`🎵 Preview: ${trackId} (Demo mode - audio files not found)`, 'info');
        setTimeout(() => {
            showNotification('Preview ended', 'info');
        }, 3000);
        return;
    }
    
    track.classList.add('playing');
    playBtn.textContent = '⏸️';
    AppState.currentlyPlaying = trackId;
    
    // Update waveform progress
    audio.ontimeupdate = () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        waveform.style.width = `${progress}%`;
    };
    
    // Handle track end
    audio.onended = () => {
        track.classList.remove('playing');
        playBtn.textContent = '▶️';
        waveform.style.width = '0%';
        AppState.currentlyPlaying = null;
        showNotification('Preview ended', 'info');
    };
    
    // Handle errors
    audio.onerror = () => {
        showNotification(`Audio file not found: ${trackId}.mp3`, 'error');
        track.classList.remove('playing');
        playBtn.textContent = '▶️';
        AppState.currentlyPlaying = null;
    };
    
    audio.play().catch(() => {
        showNotification(`🎵 Preview: ${trackId} (Demo mode)`, 'info');
    });
}

function toggleCustomAudio() {
    const customSection = document.getElementById('custom-audio-section');
    const isVisible = customSection.classList.contains('show');
    
    if (isVisible) {
        customSection.classList.remove('show');
    } else {
        customSection.classList.add('show');
    }
}

// Custom Audio Upload
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('audio-input').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 50 * 1024 * 1024) {
            showNotification('Audio file too large (50MB max)', 'error');
            return;
        }
        
        if (!file.type.startsWith('audio/')) {
            showNotification('Please select a valid audio file', 'error');
            return;
        }
        
        AppState.customAudio = file;
        
        // Add custom track to the list
        const customTrack = document.createElement('div');
        customTrack.className = 'music-track';
        customTrack.setAttribute('data-track', 'custom');
        customTrack.onclick = () => selectTrack('custom');
        customTrack.innerHTML = `
            <button class="play-btn">▶️</button>
            <div class="track-info">
                ${file.name}
                <div class="audio-waveform">
                    <div class="waveform-progress"></div>
                </div>
            </div>
            <div class="track-duration">Custom</div>
        `;
        
        document.getElementById('music-tracks').appendChild(customTrack);
        selectTrack('custom');
        
        showNotification(`Custom audio "${file.name}" uploaded successfully!`, 'success');
    });
});

// Batch Processing Management
function setBatchMode(mode) {
    AppState.batchMode = mode;
    
    document.querySelectorAll('.batch-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${mode}-mode`).classList.add('active');
    
    const descriptions = {
        parallel: 'Process multiple videos simultaneously',
        sequential: 'Process videos one by one in order',
        priority: 'Smart priority-based processing'
    };
    
    showNotification(`Batch mode: ${descriptions[mode]}`, 'info');
}

// Enhanced File Processing with Multiple Reference Images
async function processFiles(files) {
    const validFiles = [];
    const errors = [];
    
    for (const file of files) {
        try {
            const validFile = await validateImageFile(file);
            validFiles.push(validFile);
        } catch (error) {
            errors.push(error);
        }
    }
    
    if (errors.length > 0) {
        showNotification(`${errors.length} files had issues`, 'error');
    }
    
    if (validFiles.length === 0) return;
    
    for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const fileId = Date.now() + i;
        
        try {
            updateUploadProgress(fileId, 0, 'Validating...');
            
            let processedFile = file;
            if (AppState.compressionEnabled) {
                updateUploadProgress(fileId, 25, 'Compressing...');
                processedFile = await compressImage(file);
            }
            
            updateUploadProgress(fileId, 50, 'Processing...');
            await addToImageQueue(processedFile, fileId);
            updateUploadProgress(fileId, 100, 'Complete');
            
        } catch (error) {
            updateUploadProgress(fileId, 0, 'Error', error.message);
            showNotification(`Failed to process ${file.name}: ${error.message}`, 'error');
        }
    }
    
    // Auto-set first image as reference if none set
    if (AppState.referenceImages.length === 0 && AppState.uploadedImages.length > 0) {
        AppState.referenceImages = [AppState.uploadedImages[0]];
    }
    
    renderImageQueue();
    showNotification(`${validFiles.length} images processed successfully!`, 'success');
    updateGenerateButton();
}

// Enhanced Image Compression
function compressImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
                const compressedFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now()
                });
                compressedFile.originalSize = file.size;
                compressedFile.compressed = true;
                resolve(compressedFile);
            }, file.type, quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// Enhanced File Validation
function validateImageFile(file) {
    return new Promise((resolve, reject) => {
        if (file.size > 10 * 1024 * 1024) {
            reject(`File ${file.name} exceeds 10MB limit`);
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            reject(`File ${file.name} is not a valid image`);
            return;
        }
        
        const img = new Image();
        img.onload = () => {
            if (img.width === 0 || img.height === 0) {
                reject(`File ${file.name} appears to be corrupted`);
            } else {
                resolve(file);
            }
        };
        img.onerror = () => {
            reject(`File ${file.name} is corrupted or invalid`);
        };
        img.src = URL.createObjectURL(file);
    });
}

// Enhanced Queue Management
async function addToImageQueue(file, fileId) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                id: fileId || Date.now() + Math.random(),
                file: file,
                preview: e.target.result,
                name: file.name,
                size: file.size,
                compressed: file.compressed || false
            };
            
            AppState.uploadedImages.push(imageData);
            updateQueueControls();
            resolve(imageData);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

function updateQueueControls() {
    const controls = document.getElementById('queue-controls');
    controls.style.display = AppState.uploadedImages.length > 0 ? 'flex' : 'none';
}

// Enhanced Generate Function with AI Enhancement
async function handleGenerate() {
    if (!AppState.user) {
        showNotification('Please log in to generate videos', 'error');
        showAuthModal('login');
        return;
    }
    
    if (AppState.uploadedImages.length === 0) {
        showNotification('Please upload images first', 'error');
        return;
    }
    
    // Check credits for free users
    if (AppState.user.plan === 'free') {
        const remainingCredits = AppState.maxFreeCredits - AppState.user.creditsUsed;
        const requiredCredits = AppState.uploadedImages.length;
        
        if (requiredCredits > remainingCredits) {
            showNotification(`Not enough credits. You have ${remainingCredits} remaining, but need ${requiredCredits}`, 'error');
            showSection('pricing');
            return;
        }
    }
    
    // Auto-enhance prompt if enabled
    if (AppState.autoEnhancePrompt) {
        const promptInput = document.getElementById('prompt-input');
        if (promptInput.value.trim()) {
            await enhancePrompt();
            // Use enhanced prompt automatically
            setTimeout(() => {
                const enhancedText = document.getElementById('enhanced-prompt-text').textContent;
                if (enhancedText) {
                    promptInput.value = enhancedText;
                    document.getElementById('enhanced-prompt').classList.remove('show');
                }
            }, 2500);
        }
    }
    
    // Create jobs with enhanced settings
    AppState.uploadedImages.forEach((image, index) => {
        const job = createProcessingJob(image, index);
        AppState.processingQueue.push(job);
    });
    
    // Clear uploaded images
    AppState.uploadedImages = [];
    AppState.referenceImages = [];
    renderImageQueue();
    updateQueueControls();
    updateGenerateButton();
    
    // Start processing
    processQueue();
    showNotification(`${AppState.processingQueue.length} videos queued for generation!`, 'success');
}

function createProcessingJob(image, index) {
    const promptText = document.getElementById('prompt-input').value.trim();
    
    return {
        id: Date.now() + index,
        image: image,
        status: 'queued',
        progress: 0,
        settings: {
            duration: document.getElementById('duration-slider').value,
            style: document.getElementById('animation-style').value,
            quality: document.getElementById('quality').value,
            aiStyle: document.getElementById('ai-style').value,
            aspectRatio: AppState.selectedAspectRatio,
            music: AppState.selectedMusic,
            customAudio: AppState.customAudio,
            motionType: AppState.selectedMotion,
            motionIntensity: AppState.motionIntensity,
            prompt: promptText,
            referenceImages: AppState.referenceImages.map(ref => ref.id),
            batchMode: AppState.batchMode
        },
        createdAt: new Date().toISOString(),
        startTime: null,
        estimatedTime: Math.floor(Math.random() * 60) + 30,
        retryCount: 0,
        error: null
    };
}

// Smart Queue Processing
function processQueue() {
    updateQueueUI();
    
    const maxConcurrent = getMaxConcurrentJobs();
    const processingJobs = AppState.processingQueue.filter(job => job.status === 'processing');
    const queuedJobs = AppState.processingQueue.filter(job => job.status === 'queued');
    
    // Sort queued jobs based on batch mode
    const sortedJobs = sortJobsByBatchMode(queuedJobs);
    
    const availableSlots = maxConcurrent - processingJobs.length;
    const jobsToStart = sortedJobs.slice(0, availableSlots);
    
    jobsToStart.forEach(job => {
        startProcessing(job);
    });
}

function getMaxConcurrentJobs() {
    if (!AppState.user) return 1;
    
    switch (AppState.user.plan) {
        case 'free': return 1;
        case 'premium': return 3;
        case 'premium_plus': return 5;
        default: return 1;
    }
}

function sortJobsByBatchMode(jobs) {
    switch (AppState.batchMode) {
        case 'sequential':
            return jobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case 'priority':
            return jobs.sort((a, b) => {
                // Prioritize reference images and higher quality
                const aPriority = (a.settings.referenceImages.length > 0 ? 2 : 0) + 
                                 (a.settings.quality === '4k' ? 3 : a.settings.quality === 'fhd' ? 2 : 1);
                const bPriority = (b.settings.referenceImages.length > 0 ? 2 : 0) + 
                                 (b.settings.quality === '4k' ? 3 : b.settings.quality === 'fhd' ? 2 : 1);
                return bPriority - aPriority;
            });
        case 'parallel':
        default:
            return jobs;
    }
}

async function startProcessing(job) {
    try {
        job.status = 'processing';
        job.startTime = Date.now();
        
        updateQueueUI();
        
        // Enhanced processing stages
        const stages = [
            { name: 'Analyzing image composition', duration: 15 },
            { name: 'Processing reference images', duration: job.settings.referenceImages.length > 0 ? 20 : 5 },
            { name: 'Applying AI prompt enhancement', duration: job.settings.prompt ? 15 : 5 },
            { name: 'Generating motion effects', duration: 25 },
            { name: 'Applying advanced motion control', duration: 15 },
            { name: 'Rendering with music integration', duration: 20 },
            { name: 'Final quality optimization', duration: 10 }
        ];
        
        let currentProgress = 0;
        
        for (const stage of stages) {
            job.currentStage = stage.name;
            
            const stageInterval = setInterval(() => {
                const stageProgress = Math.random() * 3;
                currentProgress = Math.min(currentProgress + stageProgress, currentProgress + stage.duration);
                job.progress = Math.min(currentProgress, 100);
                updateQueueUI();
                
                if (currentProgress >= currentProgress + stage.duration - 3) {
                    clearInterval(stageInterval);
                }
            }, 200);
            
            await new Promise(resolve => {
                setTimeout(resolve, stage.duration * 50 + Math.random() * 500);
            });
            
            clearInterval(stageInterval);
            currentProgress += stage.duration;
        }
        
        // Complete the job
        job.progress = 100;
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        
        // Add to video history
        addToVideoHistory(job);
        
        // Update user stats
        if (AppState.user.plan === 'free') {
            AppState.user.creditsUsed++;
        }
        AppState.user.totalVideos++;
        
        updateQueueUI();
        updateDashboard();
        
        setTimeout(() => {
            processQueue();
        }, 1000);
        
        showNotification(`✅ Enhanced video "${job.image.name}" generated successfully!`, 'success');
        
    } catch (error) {
        job.status = 'error';
        job.error = error.message;
        job.progress = 0;
        updateQueueUI();
        
        showNotification(`❌ Failed to generate "${job.image.name}": ${error.message}`, 'error');
    }
}

function updateQueueUI() {
    const queueList = document.getElementById('queue-list');
    const queueCounter = document.getElementById('queue-counter');
    
    queueCounter.textContent = `${AppState.processingQueue.length} jobs`;
    
    if (AppState.processingQueue.length === 0) {
        queueList.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.6); padding: 20px;">No jobs in queue</div>';
        return;
    }
    
    queueList.innerHTML = AppState.processingQueue.map(job => `
        <div class="queue-job">
            <img src="${job.image.preview}" alt="${job.image.name}" class="job-thumbnail">
            <div class="job-info">
                <div class="job-name">${job.image.name}</div>
                <div class="job-status ${job.status}">${job.currentStage || job.status.toUpperCase()}</div>
                ${job.settings.referenceImages.length > 0 ? '<div style="font-size: 0.7rem; color: #FFD700;">⭐ With Reference Images</div>' : ''}
                ${job.settings.prompt ? '<div style="font-size: 0.7rem; color: #9C27B0;">🧠 AI Enhanced</div>' : ''}
                ${job.error ? `<div class="error-message">${job.error}</div>` : ''}
            </div>
            <div class="job-progress">
                <div class="progress-bar ${job.status}" style="width: ${job.progress}%"></div>
            </div>
            ${job.status === 'error' ? `<button class="retry-btn" onclick="retryJob(${job.id})">Retry</button>` : ''}
        </div>
    `).join('');
}

// Update Generate Button
function updateGenerateButton() {
    const generateBtn = document.getElementById('generate-btn');
    const hasImages = AppState.uploadedImages.length > 0;
    const isLoggedIn = AppState.user !== null;
    const isUploading = Object.keys(AppState.uploadProgress).length > 0;
    
    if (isUploading) {
        generateBtn.disabled = true;
        generateBtn.classList.add('processing');
        generateBtn.innerHTML = '<span>📤 Processing Images...</span>';
    } else if (!isLoggedIn) {
        generateBtn.disabled = true;
        generateBtn.classList.remove('processing');
        generateBtn.innerHTML = '<span>🔑 Login to Generate</span>';
    } else if (!hasImages) {
        generateBtn.disabled = true;
        generateBtn.classList.remove('processing');
        generateBtn.innerHTML = '<span>📤 Upload Images First</span>';
    } else {
        generateBtn.disabled = false;
        generateBtn.classList.remove('processing');
        const refText = AppState.referenceImages.length > 0 ? ` (${AppState.referenceImages.length} ref)` : '';
        generateBtn.innerHTML = `<span>🚀 Generate ${AppState.uploadedImages.length} Enhanced Videos${refText}</span>`;
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // File input
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
    
    // Drag and drop
    const uploadArea = document.querySelector('.upload-area');
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDropUpload);
    
    // Sliders
    document.getElementById('duration-slider').addEventListener('input', (e) => {
        document.getElementById('duration-value').textContent = e.target.value;
    });
    
    document.getElementById('motion-intensity-slider').addEventListener('input', (e) => {
        AppState.motionIntensity = e.target.value;
        document.getElementById('motion-intensity-value').textContent = e.target.value;
    });
    
    // Generate button
    document.getElementById('generate-btn').addEventListener('click', handleGenerate);
}

// File handling functions
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDropUpload(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

// Additional utility functions
function clearQueue() {
    if (AppState.uploadedImages.length === 0) return;
    
    if (confirm('Clear all images from queue?')) {
        AppState.uploadedImages = [];
        AppState.referenceImages = [];
        renderImageQueue();
        updateQueueControls();
        updateGenerateButton();
        showNotification('Queue cleared', 'info');
    }
}

function toggleReorderMode() {
    AppState.isReorderMode = !AppState.isReorderMode;
    const queueContainer = document.getElementById('image-queue');
    
    if (AppState.isReorderMode) {
        queueContainer.classList.add('reorder-mode');
        showNotification('Drag images to reorder them', 'info');
    } else {
        queueContainer.classList.remove('reorder-mode');
        showNotification('Reorder mode disabled', 'info');
    }
    
    renderImageQueue();
}

function compressImages() {
    AppState.compressionEnabled = !AppState.compressionEnabled;
    const btn = event.target;
    
    if (AppState.compressionEnabled) {
        btn.textContent = '🗜️ Compression: ON';
        btn.style.background = 'rgba(76, 175, 80, 0.3)';
        showNotification('Image compression enabled', 'success');
    } else {
        btn.textContent = '🗜️ Compression: OFF';
        btn.style.background = 'rgba(255,255,255,0.1)';
        showNotification('Image compression disabled', 'info');
    }
}

function selectAspectRatio(ratio) {
    AppState.selectedAspectRatio = ratio;
    
    document.querySelectorAll('.aspect-ratio-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    document.querySelector(`[data-ratio="${ratio}"]`).classList.add('selected');
    showNotification(`Aspect ratio set to ${ratio}`, 'info');
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        backdrop-filter: blur(10px);
        max-width: min(300px, calc(100vw - 40px));
        word-wrap: break-word;
        ${type === 'error' ? 'background: rgba(244, 67, 54, 0.9);' : 
          type === 'success' ? 'background: rgba(76, 175, 80, 0.9);' : 
          'background: rgba(33, 150, 243, 0.9);'}
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Authentication functions
function showAuthModal(mode = 'login') {
    document.getElementById('auth-modal').classList.add('show');
    switchAuthMode(mode);
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('show');
    // Clear form errors
    clearFormErrors();
}

function switchAuthMode(mode) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (mode === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
    clearFormErrors();
}

async function handleLogin(event) {
    event.preventDefault();
    
    if (AppState.isLoading) return;
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showFormError('Please fill in all fields');
        return;
    }
    
    try {
        AppState.isLoading = true;
        updateFormSubmitState(true, 'Signing in...');
        
        const response = await window.api.login({ email, password });
        
        if (response.success) {
            AppState.user = response.data.user;
            AppState.isAuthenticated = true;
            updateUI();
            updateDashboard();
            updateGenerateButton();
            closeAuthModal();
            showNotification('Welcome back! Logged in successfully', 'success');
        }
    } catch (error) {
        console.error('Login error:', error);
        showFormError(error.message || 'Login failed. Please try again.');
    } finally {
        AppState.isLoading = false;
        updateFormSubmitState(false);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    if (AppState.isLoading) return;
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    
    if (!name || !email || !password) {
        showFormError('Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        showFormError('Password must be at least 6 characters long');
        return;
    }
    
    try {
        AppState.isLoading = true;
        updateFormSubmitState(true, 'Creating account...');
        
        const response = await window.api.register({ name, email, password });
        
        if (response.success) {
            AppState.user = response.data.user;
            AppState.isAuthenticated = true;
            updateUI();
            updateDashboard();
            updateGenerateButton();
            closeAuthModal();
            showNotification('Account created successfully! Welcome to PixVid Pro', 'success');
        }
    } catch (error) {
        console.error('Registration error:', error);
        
        // Parse validation errors if available
        if (error.message && error.message.includes('Validation failed')) {
            showFormError('Please check your password requirements: Must be at least 6 characters with 1 uppercase, 1 lowercase, and 1 number.');
        } else {
            showFormError(error.message || 'Registration failed. Please try again.');
        }
    } finally {
        AppState.isLoading = false;
        updateFormSubmitState(false);
    }
}

function handleGoogleAuth() {
    // Redirect to Google OAuth
    window.location.href = '/api/auth/google';
}

// Check for OAuth configuration errors on page load
function checkOAuthStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error === 'oauth_not_configured') {
        showNotification('⚠️ Google OAuth not configured yet. Please follow the setup guide in GOOGLE_OAUTH_SETUP.md', 'warning');
        // Clear the error from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error === 'auth_failed') {
        showNotification('❌ Google authentication failed. Please try again.', 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('login') === 'success') {
        showNotification('✅ Successfully logged in with Google!', 'success');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

async function logout() {
    try {
        await window.api.logout();
        AppState.user = null;
        AppState.isAuthenticated = false;
        AppState.uploadedImages = [];
        AppState.referenceImages = [];
        AppState.processingQueue = [];
        updateUI();
        showNotification('Logged out successfully', 'info');
        showSection('home');
    } catch (error) {
        console.error('Logout error:', error);
        // Force logout on client side even if server request fails
        AppState.user = null;
        AppState.isAuthenticated = false;
        updateUI();
        showNotification('Logged out', 'info');
        showSection('home');
    }
}

// Form utility functions
function showFormError(message) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.form-error');
    existingErrors.forEach(error => error.remove());
    
    // Create new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.cssText = `
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
        font-size: 0.9rem;
        border: 1px solid rgba(244, 67, 54, 0.3);
    `;
    errorDiv.textContent = message;
    
    // Insert error message at the top of the visible form
    const activeForm = document.querySelector('#login-form:not([style*="none"]), #register-form:not([style*="none"])');
    if (activeForm) {
        activeForm.insertBefore(errorDiv, activeForm.firstElementChild.nextElementSibling);
    }
}

function clearFormErrors() {
    const existingErrors = document.querySelectorAll('.form-error');
    existingErrors.forEach(error => error.remove());
}

function updateFormSubmitState(isLoading, message = '') {
    const loginBtn = document.querySelector('#login-form .form-btn[type="submit"]');
    const registerBtn = document.querySelector('#register-form .form-btn[type="submit"]');
    
    [loginBtn, registerBtn].forEach(btn => {
        if (btn) {
            btn.disabled = isLoading;
            if (isLoading) {
                btn.dataset.originalText = btn.textContent;
                btn.textContent = message || 'Please wait...';
            } else {
                btn.textContent = btn.dataset.originalText || btn.textContent;
            }
        }
    });
}

function updateUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userAvatar = document.getElementById('user-avatar');
    
    if (AppState.user) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'block';
        userAvatar.textContent = AppState.user.name.charAt(0).toUpperCase();
        
        // Update subscription status
        updateSubscriptionUI();
        
        // Check admin status and update UI
        checkAdminStatus();
        
        // Update notification buttons and request permissions
        setTimeout(() => {
            if (window.pushManager) {
                updateNotificationButtons();
                // Auto-request permissions for logged-in users
                if (typeof window.requestNotificationPermissionsForUser === 'function') {
                    window.requestNotificationPermissionsForUser();
                }
            }
        }, 2000);
    } else {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
        AppState.isAdmin = false;
        checkAdminStatus();
    }
}

function updateSubscriptionUI() {
    if (!AppState.user) return;
    
    const freeCredits = document.getElementById('free-credits');
    const planType = document.getElementById('plan-type');
    
    const remainingCredits = AppState.maxFreeCredits - AppState.user.creditsUsed;
    freeCredits.textContent = remainingCredits;
    
    if (AppState.user.plan === 'free') {
        planType.textContent = 'Free Plan';
    } else {
        planType.textContent = 'Premium Plan';
    }
}

function updateDashboard() {
    if (!AppState.user) return;
    
    document.getElementById('total-videos').textContent = AppState.user.totalVideos;
    document.getElementById('week-usage').textContent = `${AppState.user.creditsUsed}/${AppState.maxFreeCredits}`;
    document.getElementById('plan-name').textContent = AppState.user.plan === 'free' ? 'Free' : 'Premium';
    document.getElementById('active-jobs').textContent = AppState.processingQueue.filter(j => j.status === 'processing').length;
    document.getElementById('queue-status').textContent = `Queue: ${AppState.processingQueue.filter(j => j.status === 'queued').length} waiting`;
}

function toggleUserMenu() {
    const dropdownMenu = document.getElementById('dropdown-menu');
    const isVisible = dropdownMenu.style.display === 'block';
    dropdownMenu.style.display = isVisible ? 'none' : 'block';
}

// Progress tracking functions
function updateUploadProgress(fileId, progress, status, error = null) {
    AppState.uploadProgress[fileId] = { progress, status, error };
    updateUploadProgressBar();
    
    if (progress === 100 || error) {
        setTimeout(() => {
            delete AppState.uploadProgress[fileId];
            updateUploadProgressBar();
        }, 2000);
    }
}

function updateUploadProgressBar() {
    const progressBar = document.getElementById('upload-progress-bar');
    const progressCount = Object.keys(AppState.uploadProgress).length;
    
    if (progressCount === 0) {
        progressBar.style.width = '0%';
        return;
    }
    
    const avgProgress = Object.values(AppState.uploadProgress)
        .reduce((sum, p) => sum + p.progress, 0) / progressCount;
    progressBar.style.width = `${avgProgress}%`;
}

// Video history management
function addToVideoHistory(job) {
    const video = {
        id: job.id,
        title: job.image.name.replace(/\.[^/.]+$/, ""),
        thumbnail: job.image.preview,
        settings: job.settings,
        createdAt: job.completedAt,
        isPublic: false,
        likes: 0,
        views: 0,
        downloadUrl: `#video-${job.id}`
    };
    
    AppState.videoHistory.push(video);
    updateVideoHistory();
}

function updateVideoHistory() {
    const historyContainer = document.getElementById('video-history');
    
    if (AppState.videoHistory.length === 0) {
        historyContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.6); padding: 40px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">📹</div>
                <div style="font-size: 1.2rem;">No videos generated yet</div>
                <div style="margin-top: 10px;">
                    <a href="#" onclick="showSection('generator')" style="color: #4CAF50; text-decoration: none;">Create your first video →</a>
                </div>
            </div>
        `;
        return;
    }
    
    historyContainer.innerHTML = AppState.videoHistory.map(video => `
        <div class="video-card">
            <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail" loading="lazy">
            <div class="video-info">
                <div class="video-title">${video.title}</div>
                <div class="video-meta">
                    Created: ${new Date(video.createdAt).toLocaleDateString()}<br>
                    Quality: ${video.settings.quality.toUpperCase()} • ${video.settings.duration}s • ${video.settings.aspectRatio}
                    ${video.settings.prompt ? '<br>🧠 AI Enhanced' : ''}
                    ${video.settings.referenceImages.length > 0 ? `<br>⭐ ${video.settings.referenceImages.length} Reference Images` : ''}
                </div>
                <div class="video-actions">
                    <button class="action-btn download-action" onclick="downloadVideo('${video.id}')">📥 Download</button>
                    <button class="action-btn share-action" onclick="shareToGallery('${video.id}')">🌍 Share</button>
                    <button class="action-btn delete-action" onclick="deleteVideo('${video.id}')">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function downloadVideo(videoId) {
    showNotification('📥 Starting video download...', 'info');
    
    setTimeout(() => {
        showNotification('✅ Video downloaded successfully!', 'success');
    }, 2000);
}

function shareToGallery(videoId) {
    const video = AppState.videoHistory.find(v => v.id == videoId);
    if (!video) return;
    
    if (video.isPublic) {
        showNotification('Video is already shared in the gallery!', 'info');
        return;
    }
    
    const galleryVideo = {
        ...video,
        author: AppState.user.name,
        isPublic: true,
        isLiked: false,
        category: video.settings.aiStyle || 'artistic',
        comments: []
    };
    
    AppState.galleryVideos.unshift(galleryVideo);
    video.isPublic = true;
    
    loadGallery();
    showNotification('🌍 Video shared to World Gallery!', 'success');
}

function deleteVideo(videoId) {
    if (confirm('Are you sure you want to delete this video?')) {
        AppState.videoHistory = AppState.videoHistory.filter(v => v.id != videoId);
        updateVideoHistory();
        updateDashboard();
        showNotification('🗑️ Video deleted successfully', 'info');
    }
}

// Gallery management
function loadGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    
    if (AppState.galleryVideos.length === 0) {
        galleryGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.6); padding: 40px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🌍</div>
                <div style="font-size: 1.2rem;">No public videos yet</div>
                <div style="margin-top: 10px;">Be the first to share your creation!</div>
            </div>
        `;
        return;
    }
    
    galleryGrid.innerHTML = AppState.galleryVideos.map(video => `
        <div class="gallery-card">
            <img src="${video.thumbnail}" alt="${video.title}" class="gallery-video" loading="lazy">
            <div class="gallery-info">
                <div class="gallery-title">${video.title}</div>
                <div class="gallery-author">by ${video.author}</div>
                <div class="gallery-stats">
                    <div class="stat-item">
                        <button class="like-btn ${video.isLiked ? 'liked' : ''}" onclick="toggleLike(${video.id})">
                            ${video.isLiked ? '❤️' : '🤍'} ${video.likes}
                        </button>
                    </div>
                    <div class="stat-item">👁️ ${video.views}</div>
                    <div class="stat-item">📅 ${new Date(video.createdAt).toLocaleDateString()}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterGallery(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    let filteredVideos = [...AppState.galleryVideos];
    
    if (category !== 'all') {
        if (category === 'trending') {
            filteredVideos = filteredVideos.sort((a, b) => b.likes - a.likes);
        } else if (category === 'recent') {
            filteredVideos = filteredVideos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            filteredVideos = filteredVideos.filter(v => v.category === category);
        }
    }
    
    loadGallery();
}

function toggleLike(videoId) {
    if (!AppState.user) {
        showNotification('Please log in to like videos', 'error');
        showAuthModal('login');
        return;
    }
    
    const video = AppState.galleryVideos.find(v => v.id === videoId);
    if (!video) return;
    
    video.isLiked = !video.isLiked;
    video.likes += video.isLiked ? 1 : -1;
    
    loadGallery();
    showNotification(video.isLiked ? '❤️ Video liked!' : '💔 Video unliked', 'info');
}

// Real subscription function using Razorpay
async function subscribeToPlan(planId) {
    console.log('🔄 subscribeToPlan called with planId:', planId);
    console.log('👤 User state:', AppState.user);
    console.log('💳 PaymentManager available:', !!window.paymentManager);
    
    if (!AppState.user) {
        console.log('❌ User not logged in');
        showNotification('Please log in to subscribe', 'error');
        showAuthModal('login');
        return;
    }
    
    // Use the PaymentManager for real payments
    if (window.paymentManager) {
        console.log('✅ Using PaymentManager for subscription');
        try {
            await window.paymentManager.subscribeToPlan(planId);
        } catch (error) {
            console.error('❌ Payment error:', error);
            showNotification('❌ Payment failed: ' + error.message, 'error');
        }
    } else {
        console.log('❌ PaymentManager not available');
        showNotification('❌ Payment system not initialized. Please refresh and try again.', 'error');
        
        // Try to initialize PaymentManager again
        setTimeout(() => {
            if (window.api && !window.paymentManager) {
                console.log('🔄 Attempting to reinitialize PaymentManager...');
                try {
                    window.paymentManager = new PaymentManager(window.api);
                    console.log('✅ PaymentManager reinitialized successfully');
                    showNotification('✅ Payment system ready! Please try again.', 'success');
                } catch (error) {
                    console.error('❌ Failed to reinitialize PaymentManager:', error);
                }
            }
        }, 1000);
    }
}

// Make it globally accessible
window.subscribeToPlan = subscribeToPlan;

// Retry job function
function retryJob(jobId) {
    const job = AppState.processingQueue.find(j => j.id === jobId);
    if (!job) return;
    
    if (job.retryCount >= AppState.networkRetries) {
        showNotification('Maximum retry attempts reached', 'error');
        return;
    }
    
    job.retryCount++;
    job.status = 'queued';
    job.progress = 0;
    job.error = null;
    job.startTime = null;
    
    updateQueueUI();
    showNotification(`Retrying job (attempt ${job.retryCount + 1})`, 'info');
    
    setTimeout(() => {
        processQueue();
    }, 1000);
}

// Drag and drop handlers for reordering
let draggedElement = null;

function handleDragStart(e) {
    if (!AppState.isReorderMode) return;
    draggedElement = e.target.closest('.queue-item');
    draggedElement.classList.add('dragging');
}

function handleDragOver(e) {
    if (!AppState.isReorderMode) return;
    e.preventDefault();
}

function handleDrop(e) {
    if (!AppState.isReorderMode) return;
    e.preventDefault();
    
    const targetElement = e.target.closest('.queue-item');
    if (!targetElement || targetElement === draggedElement) return;
    
    const draggedIndex = parseInt(draggedElement.dataset.index);
    const targetIndex = parseInt(targetElement.dataset.index);
    
    const [removed] = AppState.uploadedImages.splice(draggedIndex, 1);
    AppState.uploadedImages.splice(targetIndex, 0, removed);
    
    renderImageQueue();
    draggedElement.classList.remove('dragging');
    showNotification('Images reordered successfully', 'success');
}

// Sample gallery data
const sampleGalleryVideos = [
    {
        id: 1,
        title: 'Sunset Timelapse',
        author: 'John Doe',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN1bnNldCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGNjk0NDsiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRkE1MDA7Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdW5zZXQpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNHB4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfjIY8L3RleHQ+PC9zdmc+',
        likes: 142,
        views: 1250,
        category: 'cinematic',
        isLiked: false,
        createdAt: '2024-08-01',
        comments: []
    },
    {
        id: 2,
        title: 'Urban Motion',
        author: 'Jane Smith',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InVyYmFuIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNDI4NUY0OyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzlDMjdCMDsiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3VyYmFuKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjRweCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn4+i77iPPC90ZXh0Pjwvc3ZnPg==',
        likes: 89,
        views: 763,
        category: 'artistic',
        isLiked: true,
        createdAt: '2024-08-05',
        comments: []
    }
];

// Initialize application
async function initApp() {
    console.log('🎬 Initializing PixVid Pro...');
    
    // Check server health (non-blocking)
    try {
        if (window.api && typeof window.api.healthCheck === 'function') {
            await window.api.healthCheck();
            console.log('✅ Server connection successful');
        }
    } catch (error) {
        console.warn('❌ Server connection failed:', error);
        // Don't show notification immediately, just log
    }
    
    // Check for existing authentication (non-blocking)
    try {
        if (window.api && window.api.isAuthenticated()) {
            const response = await window.api.getCurrentUser();
            if (response && response.success) {
                AppState.user = response.data.user;
                AppState.isAuthenticated = true;
                AppState.isAdmin = response.data.user.isAdmin || false;
                console.log('✅ User authenticated:', AppState.user.name);
                if (AppState.isAdmin) {
                    console.log('👑 Admin privileges granted');
                }
            }
        }
    } catch (error) {
        console.log('❌ Authentication check failed:', error);
        // Clear invalid token safely
        if (window.api && typeof window.api.setToken === 'function') {
            window.api.setToken(null);
        }
    }
    
    AppState.galleryVideos = [...sampleGalleryVideos];
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize UI
    updateUI();
    loadGallery();
    updateGenerateButton();
    
    // Update pricing display based on user location
    updatePricingDisplay();
    
    // Set default motion
    selectMotion('gentle');
    
    // Load user preferences if authenticated
    if (AppState.user && AppState.user.preferences) {
        loadUserPreferences();
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const userMenu = document.getElementById('user-menu');
        const dropdownMenu = document.getElementById('dropdown-menu');
        
        if (!userMenu.contains(e.target)) {
            dropdownMenu.style.display = 'none';
        }
    });
    
    // Drag end cleanup
    document.addEventListener('dragend', () => {
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
            draggedElement = null;
        }
    });
    
    console.log('🎬 Enhanced PixVid Pro loaded successfully!');
    console.log('New features: AI Prompt Enhancement, Advanced Motion Control, Multiple Reference Images, Enhanced Music Library, Smart Batch Processing');
    console.log('🔐 Authentication status:', AppState.isAuthenticated ? 'Logged in' : 'Guest');
    
    // Make updatePricingDisplay globally accessible for testing
    window.updatePricingDisplay = updatePricingDisplay;
    
    // Update pricing immediately on load for testing
    setTimeout(() => {
        updatePricingDisplay();
    }, 1000);
}

// ==================== PUSH NOTIFICATION FUNCTIONS ====================

// Enable push notifications
async function enableNotifications() {
    try {
        if (!window.pushManager) {
            showNotification('❌ Push notifications not supported in this browser', 'error');
            return;
        }

        const success = await window.pushManager.subscribe();
        if (success) {
            updateNotificationButtons();
            showNotification('🔔 Notifications enabled successfully!', 'success');
        }
    } catch (error) {
        console.error('Error enabling notifications:', error);
        showNotification('❌ Failed to enable notifications: ' + error.message, 'error');
    }
}

// Disable push notifications  
async function disableNotifications() {
    try {
        if (!window.pushManager) {
            showNotification('❌ Push notifications not supported', 'error');
            return;
        }

        await window.pushManager.unsubscribe();
        updateNotificationButtons();
        showNotification('🔕 Notifications disabled', 'info');
    } catch (error) {
        console.error('Error disabling notifications:', error);
        showNotification('❌ Failed to disable notifications: ' + error.message, 'error');
    }
}

// Send test notification
async function testNotification() {
    try {
        if (!window.pushManager || !window.pushManager.isSubscribed) {
            showNotification('❌ Please enable notifications first', 'error');
            return;
        }

        await window.pushManager.sendTestNotification();
        showNotification('🧪 Test notification sent! Check your browser notifications.', 'success');
    } catch (error) {
        console.error('Error sending test notification:', error);
        showNotification('❌ Failed to send test notification: ' + error.message, 'error');
    }
}

// Update notification buttons visibility
function updateNotificationButtons() {
    const enableBtn = document.getElementById('enable-notifications');
    const disableBtn = document.getElementById('disable-notifications');
    const testBtn = document.getElementById('test-notification');
    
    if (!window.pushManager) {
        document.getElementById('notification-status').innerHTML = 
            '<div class="notification-status error">Push notifications not supported in this browser</div>';
        return;
    }

    if (window.pushManager.isSubscribed) {
        enableBtn.style.display = 'none';
        disableBtn.style.display = 'inline-flex';
        testBtn.style.display = 'inline-flex';
        document.getElementById('notification-status').innerHTML = 
            '<div class="notification-status success">🔔 Notifications are enabled</div>';
    } else {
        enableBtn.style.display = 'inline-flex';
        disableBtn.style.display = 'none';
        testBtn.style.display = 'none';
        document.getElementById('notification-status').innerHTML = 
            '<div class="notification-status info">🔕 Notifications are disabled</div>';
    }
}

// ==================== ADMIN PANEL FUNCTIONS ====================

// Check if user is admin and show admin features
function checkAdminStatus() {
    if (AppState.user && AppState.isAdmin) {
        document.body.classList.add('admin-visible');
        console.log('👑 Admin access granted');
    } else {
        document.body.classList.remove('admin-visible');
    }
}

// Load admin statistics
async function loadAdminStats() {
    if (!AppState.isAdmin) return;

    try {
        console.log('Loading admin stats...');
        const response = await fetch('/api/push/admin/stats', {
            credentials: 'include'
        });
        
        const data = await response.json();
        console.log('Admin stats response:', data);
        
        if (data.success) {
            updateAdminStats(data.data);
        } else {
            console.error('Failed to load admin stats:', data.message);
        }
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

// Update admin statistics display
function updateAdminStats(stats) {
    console.log('Updating admin stats with:', stats);
    
    // Get admin section for reference but don't check visibility
    const adminSection = document.getElementById('admin');
    if (!adminSection) {
        console.error('Admin section element not found');
        return;
    }
    
    // Push notification stats
    const totalSubsElement = document.getElementById('total-subscribers');
    const notificationsSentElement = document.getElementById('notifications-sent');
    const clickRateElement = document.getElementById('click-rate');
    const totalUsersElement = document.getElementById('total-users');
    const activeUsersElement = document.getElementById('active-users');
    const premiumUsersElement = document.getElementById('premium-users');

    console.log('Found elements:', {
        totalSubs: !!totalSubsElement,
        notificationsSent: !!notificationsSentElement,
        clickRate: !!clickRateElement,
        totalUsers: !!totalUsersElement,
        activeUsers: !!activeUsersElement,
        premiumUsers: !!premiumUsersElement
    });

    if (totalSubsElement) {
        totalSubsElement.textContent = stats.subscriptions?.total || '0';
        totalSubsElement.style.fontSize = '1.8rem';
        totalSubsElement.style.fontWeight = '700';
        totalSubsElement.style.color = '#4FC3F7';
        totalSubsElement.style.display = 'block';
        console.log('Updated total subscribers:', stats.subscriptions?.total || '0');
    } else {
        console.error('total-subscribers element not found');
        // Try to find and update after a brief delay
        setTimeout(() => {
            const retryElement = document.getElementById('total-subscribers');
            if (retryElement) {
                retryElement.textContent = stats.subscriptions?.total || '0';
                console.log('Retry: Updated total subscribers:', stats.subscriptions?.total || '0');
            }
        }, 100);
    }
    
    if (notificationsSentElement) {
        notificationsSentElement.textContent = stats.notifications?.totalSent || '0';
        notificationsSentElement.style.fontSize = '1.8rem';
        notificationsSentElement.style.fontWeight = '700';
        notificationsSentElement.style.color = '#4FC3F7';
        notificationsSentElement.style.display = 'block';
        console.log('Updated notifications sent:', stats.notifications?.totalSent || '0');
    } else {
        console.error('notifications-sent element not found');
        setTimeout(() => {
            const retryElement = document.getElementById('notifications-sent');
            if (retryElement) {
                retryElement.textContent = stats.notifications?.totalSent || '0';
                console.log('Retry: Updated notifications sent:', stats.notifications?.totalSent || '0');
            }
        }, 100);
    }
    
    if (clickRateElement) {
        const clickRate = stats.notifications?.totalSent > 0 
            ? ((stats.notifications?.totalClicks || 0) / stats.notifications.totalSent * 100).toFixed(1) + '%'
            : '0%';
        clickRateElement.textContent = clickRate;
        clickRateElement.style.fontSize = '1.8rem';
        clickRateElement.style.fontWeight = '700';
        clickRateElement.style.color = '#4FC3F7';
        clickRateElement.style.display = 'block';
        console.log('Updated click rate:', clickRate);
    } else {
        console.error('click-rate element not found');
        setTimeout(() => {
            const retryElement = document.getElementById('click-rate');
            if (retryElement) {
                const clickRate = stats.notifications?.totalSent > 0 
                    ? ((stats.notifications?.totalClicks || 0) / stats.notifications.totalSent * 100).toFixed(1) + '%'
                    : '0%';
                retryElement.textContent = clickRate;
                console.log('Retry: Updated click rate:', clickRate);
            }
        }, 100);
    }

    // User stats
    if (totalUsersElement) {
        totalUsersElement.textContent = stats.subscriptions?.total || '0';
    }
    if (activeUsersElement) {
        activeUsersElement.textContent = '-';
    }
    if (premiumUsersElement) {
        premiumUsersElement.textContent = stats.subscriptions?.breakdown?.premium || '0';
    }
    
    // Force visibility of admin cards
    const adminCards = document.querySelectorAll('.admin-card');
    adminCards.forEach(card => {
        card.style.display = 'block';
        card.style.opacity = '1';
        card.style.visibility = 'visible';
    });

    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
        statsGrid.style.display = 'grid';
        statsGrid.style.opacity = '1';
        statsGrid.style.visibility = 'visible';
    }

    console.log('Admin stats update completed');
}

// Load recent notifications
async function loadNotifications() {
    if (!AppState.isAdmin) return;

    console.log('Loading notifications...');
    const container = document.getElementById('recent-notifications');
    if (!container) {
        console.error('Notifications container not found');
        return;
    }
    
    container.innerHTML = '<div class="loading">Loading notifications...</div>';

    try {
        const response = await fetch('/api/push/admin/notifications?limit=10', {
            credentials: 'include'
        });
        
        const data = await response.json();
        console.log('Notifications response:', data);
        
        if (data.success) {
            displayNotifications(data.data.notifications);
        } else {
            container.innerHTML = '<div class="loading">Failed to load notifications</div>';
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        container.innerHTML = '<div class="loading">Error loading notifications</div>';
    }
}

// Display notifications in admin panel
function displayNotifications(notifications) {
    const container = document.getElementById('recent-notifications');
    
    if (!notifications || notifications.length === 0) {
        container.innerHTML = '<div class="loading">No notifications found</div>';
        return;
    }

    container.innerHTML = notifications.map(notification => `
        <div class="notification-item">
            <h4>${notification.title}</h4>
            <p>${notification.body}</p>
            <div class="notification-meta">
                <span>📊 Sent: ${notification.stats?.successCount || 0}/${notification.stats?.totalSent || 0}</span>
                <span>📅 ${new Date(notification.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

// Handle broadcast form submission
async function handleBroadcastSubmit(event) {
    event.preventDefault();
    
    if (!AppState.isAdmin) {
        showNotification('❌ Admin access required', 'error');
        return;
    }

    const formData = {
        title: document.getElementById('notification-title').value,
        body: document.getElementById('notification-body').value,
        url: document.getElementById('notification-url').value || undefined,
        image: document.getElementById('notification-image').value || undefined,
        tag: document.getElementById('notification-tag').value || undefined,
        targetPlans: document.getElementById('target-plan').value ? [document.getElementById('target-plan').value] : undefined,
        requireInteraction: document.getElementById('require-interaction').checked,
        silent: document.getElementById('silent-notification').checked
    };

    try {
        const response = await fetch('/api/push/admin/broadcast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification(`📢 Notification sent to ${data.data.successCount} users!`, 'success');
            document.getElementById('broadcast-form').reset();
            loadNotifications(); // Refresh notifications list
            loadAdminStats(); // Refresh stats
        } else {
            showNotification('❌ Failed to send notification: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error sending broadcast:', error);
        showNotification('❌ Error sending notification: ' + error.message, 'error');
    }
}

// Preview notification (browser notification)
function previewNotification() {
    if (Notification.permission !== 'granted') {
        showNotification('❌ Please enable notifications first to preview', 'error');
        return;
    }

    const title = document.getElementById('notification-title').value || 'Preview Notification';
    const body = document.getElementById('notification-body').value || 'This is how your notification will look';
    const image = document.getElementById('notification-image').value;

    const options = {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'preview',
        requireInteraction: document.getElementById('require-interaction').checked,
        silent: document.getElementById('silent-notification').checked
    };

    if (image) {
        options.image = image;
    }

    new Notification(title, options);
}

// Make admin functions globally available
window.enableNotifications = enableNotifications;
window.disableNotifications = disableNotifications;
window.testNotification = testNotification;
window.loadNotifications = loadNotifications;
window.previewNotification = previewNotification;

// Load user preferences
function loadUserPreferences() {
    if (!AppState.user || !AppState.user.preferences) return;
    
    const prefs = AppState.user.preferences;
    
    // Apply motion preferences
    if (prefs.defaultMotion) {
        selectMotion(prefs.defaultMotion);
    }
    
    // Apply aspect ratio preferences
    if (prefs.defaultAspectRatio) {
        selectAspectRatio(prefs.defaultAspectRatio);
    }
    
    // Apply auto-enhance preference
    if (prefs.autoEnhancePrompt !== undefined) {
        AppState.autoEnhancePrompt = prefs.autoEnhancePrompt;
        const autoEnhanceBtn = document.getElementById('auto-enhance-btn');
        if (autoEnhanceBtn) {
            autoEnhanceBtn.textContent = prefs.autoEnhancePrompt ? '🤖 Auto-Enhance: ON' : '🤖 Auto-Enhance: OFF';
            autoEnhanceBtn.style.background = prefs.autoEnhancePrompt ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.1)';
        }
    }
    
    // Apply compression preference
    if (prefs.compressionEnabled !== undefined) {
        AppState.compressionEnabled = prefs.compressionEnabled;
    }
    
    console.log('✅ User preferences loaded');
}

// Initialize when page loads
// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    checkOAuthStatus();
    
    // Admin broadcast form submission
    const broadcastForm = document.getElementById('broadcast-form');
    if (broadcastForm) {
        broadcastForm.addEventListener('submit', handleBroadcastSubmit);
    }
});

// Make functions globally available
window.showSection = showSection;
window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthMode = switchAuthMode;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleGoogleAuth = handleGoogleAuth;
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;

// Test if script loads
console.log('Script loaded successfully!');
console.log('showSection function:', typeof window.showSection);

// Backup simple navigation function in case main one fails
if (typeof window.showSection !== 'function') {
    window.showSection = function(sectionName) {
        console.log('Using backup showSection for:', sectionName);
        document.querySelectorAll('.main-section').forEach(section => {
            section.classList.remove('active');
        });
        const target = document.getElementById(sectionName);
        if (target) {
            target.classList.add('active');
        }
    };
}
