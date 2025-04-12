// API Configuration
const BIBLE_API_URL = 'https://bible-api.com';
const DEFAULT_VERSION = 'kjv';

// Spiritual Helper functionality
const API_KEY = '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';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Global profile data
let profileData = null;

// Debug helper to log mouse click events
function setupClickDebugger() {
    document.addEventListener('click', function(event) {
        console.log('🖱️ Click detected on:', event.target);
        console.log('Element tag:', event.target.tagName);
        console.log('Element classes:', event.target.className);
        console.log('Element ID:', event.target.id);
        
        // Check for any pointer-events CSS that might be blocking
        const computedStyle = window.getComputedStyle(event.target);
        console.log('Pointer-events:', computedStyle.pointerEvents);
        console.log('Position:', computedStyle.position);
        console.log('Z-index:', computedStyle.zIndex);
    });
    
    // Also log the current state of localStorage for debugging
    debugLocalStorage();
}

// Debug function to output localStorage content
function debugLocalStorage() {
    console.log('🔍 Debugging localStorage content:');
    try {
        // Use our existing safe methods to read localStorage
        console.log('📚 Reading Progress:', JSON.parse(localStorage.getItem('readingProgress') || '{}'));
        console.log('🔖 Bookmarks:', JSON.parse(localStorage.getItem('bookmarks') || '[]'));
        console.log('🏆 Achievements:', JSON.parse(localStorage.getItem('achievements') || '{}'));
        console.log('🔍 Recent Readings:', JSON.parse(localStorage.getItem('recentReadings') || '[]'));
        console.log('✨ Highlighted Verses:', JSON.parse(localStorage.getItem('highlightedVerses') || '{}'));
        console.log('🎨 Theme:', localStorage.getItem('theme') || 'dark');
        console.log('📏 Font Size:', localStorage.getItem('fontSize') || '16');
        console.log('📖 Bible Version:', localStorage.getItem('bibleVersion') || 'KJV');
    } catch (e) {
        console.error('❌ Error reading localStorage:', e);
    }
}

// Clear corrupted localStorage if needed
function clearCorruptedLocalStorage() {
    const keysToCheck = [
        'highlightedVerses', 
        'bookmarks', 
        'readingProgress', 
        'recentReadings', 
        'achievements', 
        'highlightCount'
    ];
    
    keysToCheck.forEach(key => {
        try {
            const value = localStorage.getItem(key);
            if (value) JSON.parse(value);
        } catch (e) {
            console.warn(`Clearing corrupted localStorage data for key "${key}"`);
            localStorage.removeItem(key);
        }
    });
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');

    // Clear any corrupted localStorage data first
    clearCorruptedLocalStorage();

    try {
        // DOM Elements - Use safe accessors that return null for missing elements
        const getElement = (id) => document.getElementById(id);
        
        const homeBtn = getElement('homeBtn');
        const readBtn = getElement('readBtn');
        const bookmarksBtn = getElement('bookmarksBtn');
        const profileBtn = getElement('profileBtn');
        const settingsBtn = getElement('settingsBtn');
        const bookSelect = getElement('bookSelect');
        const chapterSelect = getElement('chapterSelect');
        const verseContent = getElement('verseContent');
        const versionSelect = getElement('versionSelect');
        const defaultVersionSelect = getElement('defaultVersionSelect');
        const recentVerses = getElement('recentVerses');
        const bookmarksList = getElement('bookmarksList');
        const contextMenu = getElement('contextMenu');
        const bookmarkVerse = getElement('bookmarkVerse');
        const copyVerse = getElement('copyVerse');
        const shareVerse = getElement('shareVerse');
        const achievementNotification = getElement('achievementNotification');
        const achievementTitle = getElement('achievementTitle');
        const achievementDesc = getElement('achievementDesc');
        const decreaseFontBtn = getElement('decreaseFontBtn');
        const increaseFontBtn = getElement('increaseFontBtn');
        const currentFontSize = getElement('currentFontSize');
    const themeOptions = document.querySelectorAll('.theme-option');
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
        const progressElement = getElement('readingProgress');
        const bookmarkCount = getElement('bookmark-count');
        const recentVersesElement = getElement('recentVerses');
        const achievementsElement = getElement('achievements');
        const notificationElement = getElement('notification');
        const notificationMessage = getElement('notificationMessage');
        const profileSection = getElement('profile');

        // Log missing elements for debugging
        const criticalElements = [
            { name: 'homeBtn', el: homeBtn },
            { name: 'readBtn', el: readBtn },
            { name: 'bookmarksBtn', el: bookmarksBtn },
            { name: 'bookSelect', el: bookSelect },
            { name: 'chapterSelect', el: chapterSelect },
            { name: 'verseContent', el: verseContent },
            { name: 'versionSelect', el: versionSelect },
            { name: 'contextMenu', el: contextMenu },
            { name: 'readingProgress', el: progressElement },
            { name: 'achievements', el: achievementsElement },
            { name: 'profileSection', el: profileSection }
        ];
        
        const missingElements = criticalElements.filter(item => !item.el);
        if (missingElements.length > 0) {
            console.warn('Missing critical elements:', missingElements.map(e => e.name).join(', '));
        }

    // State Management
    let currentBook = '';
    let currentChapter = '';
        
        // Safe localStorage parsing function
        function safeGetJSON(key, defaultValue) {
            try {
                const value = localStorage.getItem(key);
                if (!value) return defaultValue;
                return JSON.parse(value);
            } catch (e) {
                console.warn(`Error parsing JSON from localStorage key "${key}":`, e);
                // If there was invalid JSON, clear it
                localStorage.setItem(key, JSON.stringify(defaultValue));
                return defaultValue;
            }
        }
        
        // Safe localStorage setter function
        function safeSetJSON(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error(`Error storing data in localStorage key "${key}":`, e);
                return false;
            }
        }
        
        // Initialize state with safer parsing
        let highlightedVerses = safeGetJSON('highlightedVerses', {});
        let bookmarks = safeGetJSON('bookmarks', []);
        let readingData = safeGetJSON('readingProgress', {});
        let recentReadings = safeGetJSON('recentReadings', []);
        let chaptersRead = safeGetJSON('chaptersRead', []); 
        let achievements = safeGetJSON('achievements', {
        first_read: false,
        ten_chapters: false,
        old_testament: false,
        new_testament: false,
        bookmarker: false,
        highlighter: false
    });
        let highlightCount = safeGetJSON('highlightCount', 0);
    let fontSize = parseInt(localStorage.getItem('fontSize') || '16');
    let version = localStorage.getItem('bibleVersion') || 'KJV';

    // Bible Books Data
    const bibleBooks = [
        { id: 'GEN', name: 'Genesis', chapters: 50 },
        { id: 'EXO', name: 'Exodus', chapters: 40 },
        { id: 'LEV', name: 'Leviticus', chapters: 27 },
        { id: 'NUM', name: 'Numbers', chapters: 36 },
        { id: 'DEU', name: 'Deuteronomy', chapters: 34 },
        { id: 'JOS', name: 'Joshua', chapters: 24 },
        { id: 'JDG', name: 'Judges', chapters: 21 },
        { id: 'RUT', name: 'Ruth', chapters: 4 },
        { id: '1SA', name: '1 Samuel', chapters: 31 },
        { id: '2SA', name: '2 Samuel', chapters: 24 },
        { id: '1KI', name: '1 Kings', chapters: 22 },
        { id: '2KI', name: '2 Kings', chapters: 25 },
        { id: '1CH', name: '1 Chronicles', chapters: 29 },
        { id: '2CH', name: '2 Chronicles', chapters: 36 },
        { id: 'EZR', name: 'Ezra', chapters: 10 },
        { id: 'NEH', name: 'Nehemiah', chapters: 13 },
        { id: 'EST', name: 'Esther', chapters: 10 },
        { id: 'JOB', name: 'Job', chapters: 42 },
        { id: 'PSA', name: 'Psalms', chapters: 150 },
        { id: 'PRO', name: 'Proverbs', chapters: 31 },
        { id: 'ECC', name: 'Ecclesiastes', chapters: 12 },
        { id: 'SNG', name: 'Song of Solomon', chapters: 8 },
        { id: 'ISA', name: 'Isaiah', chapters: 66 },
        { id: 'JER', name: 'Jeremiah', chapters: 52 },
        { id: 'LAM', name: 'Lamentations', chapters: 5 },
        { id: 'EZK', name: 'Ezekiel', chapters: 48 },
        { id: 'DAN', name: 'Daniel', chapters: 12 },
        { id: 'HOS', name: 'Hosea', chapters: 14 },
        { id: 'JOL', name: 'Joel', chapters: 3 },
        { id: 'AMO', name: 'Amos', chapters: 9 },
        { id: 'OBA', name: 'Obadiah', chapters: 1 },
        { id: 'JON', name: 'Jonah', chapters: 4 },
        { id: 'MIC', name: 'Micah', chapters: 7 },
        { id: 'NAM', name: 'Nahum', chapters: 3 },
        { id: 'HAB', name: 'Habakkuk', chapters: 3 },
        { id: 'ZEP', name: 'Zephaniah', chapters: 3 },
        { id: 'HAG', name: 'Haggai', chapters: 2 },
        { id: 'ZEC', name: 'Zechariah', chapters: 14 },
        { id: 'MAL', name: 'Malachi', chapters: 4 },
        { id: 'MAT', name: 'Matthew', chapters: 28 },
        { id: 'MRK', name: 'Mark', chapters: 16 },
        { id: 'LUK', name: 'Luke', chapters: 24 },
        { id: 'JHN', name: 'John', chapters: 21 },
        { id: 'ACT', name: 'Acts', chapters: 28 },
        { id: 'ROM', name: 'Romans', chapters: 16 },
        { id: '1CO', name: '1 Corinthians', chapters: 16 },
        { id: '2CO', name: '2 Corinthians', chapters: 13 },
        { id: 'GAL', name: 'Galatians', chapters: 6 },
        { id: 'EPH', name: 'Ephesians', chapters: 6 },
        { id: 'PHP', name: 'Philippians', chapters: 4 },
        { id: 'COL', name: 'Colossians', chapters: 4 },
        { id: '1TH', name: '1 Thessalonians', chapters: 5 },
        { id: '2TH', name: '2 Thessalonians', chapters: 3 },
        { id: '1TI', name: '1 Timothy', chapters: 6 },
        { id: '2TI', name: '2 Timothy', chapters: 4 },
        { id: 'TIT', name: 'Titus', chapters: 3 },
        { id: 'PHM', name: 'Philemon', chapters: 1 },
        { id: 'HEB', name: 'Hebrews', chapters: 13 },
        { id: 'JAS', name: 'James', chapters: 5 },
        { id: '1PE', name: '1 Peter', chapters: 5 },
        { id: '2PE', name: '2 Peter', chapters: 3 },
        { id: '1JN', name: '1 John', chapters: 5 },
        { id: '2JN', name: '2 John', chapters: 1 },
        { id: '3JN', name: '3 John', chapters: 1 },
        { id: 'JUD', name: 'Jude', chapters: 1 },
        { id: 'REV', name: 'Revelation', chapters: 22 }
    ];

    // Old Testament and New Testament books for achievement tracking
    const oldTestamentBooks = [
        'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
        '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
        'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
        'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'
    ];
    
    const newTestamentBooks = [
        'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
        'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
        '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
    ];

    // Daily Bible Verses
    const dailyVerses = [
        { reference: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
        { reference: "Philippians 4:13", text: "I can do all things through him who strengthens me." },
        { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope." },
        { reference: "Psalm 23:1", text: "The LORD is my shepherd; I shall not want." },
        { reference: "John 3:16", text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life." },
        { reference: "Proverbs 3:5-6", text: "Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths." },
        { reference: "Isaiah 40:31", text: "But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint." },
        { reference: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come." },
        { reference: "Matthew 11:28", text: "Come to me, all who labor and are heavy laden, and I will give you rest." },
        { reference: "Psalm 46:1", text: "God is our refuge and strength, a very present help in trouble." }
    ];

    // Global font size control
    function changeFontSize(delta) {
            try {
                // Update the font size value (clamp between 12 and 24)
        fontSize = Math.max(12, Math.min(24, fontSize + delta));
                
                // Store in localStorage
                try {
        localStorage.setItem('fontSize', fontSize.toString());
                } catch (e) {
                    console.error('Error saving font size to localStorage:', e);
                }
                
                console.log(`Changing font size to ${fontSize}px`);
                
                // Update the display if element exists
                if (currentFontSize) {
        currentFontSize.textContent = `${fontSize}px`;
                }
                
                // Apply font size to CSS variable
        document.documentElement.style.setProperty('--verse-font-size', `${fontSize}px`);
                
                // Apply to any existing verse text elements
                const verseTextElements = document.querySelectorAll('.verse-text');
                console.log(`Updating ${verseTextElements.length} verse text elements`);
                verseTextElements.forEach(el => {
            el.style.fontSize = `${fontSize}px`;
        });
                
                // Show notification of the change
                if (delta !== 0) { // Only show notification if font size actually changed
        showNotification(`Font size set to ${fontSize}px`);
                }
            } catch (error) {
                console.error('❌ Error changing font size:', error);
            }
    }

    // Navigation
    function initializeNavigation() {
            try {
                console.log('⏳ Initializing navigation...');
                
                if (!navBtns || navBtns.length === 0) {
                    console.warn('Navigation buttons not found');
                    return;
                }
                
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                        try {
                const targetSection = btn.id.replace('Btn', '');
                            const targetElement = document.getElementById(targetSection);
                            
                            if (!targetElement) {
                                console.warn(`Target section ${targetSection} not found`);
                                return;
                            }
                            
                navBtns.forEach(b => b.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                btn.classList.add('active');
                            targetElement.classList.add('active');
                            
                            // Special handling for specific sections
                            if (targetSection === 'profile') {
                                console.log('Profile section activated - refreshing data');
                                populateAchievements();
                                updateReadingProgressDisplay();
                            }
                        } catch (error) {
                            console.error('Error in navigation click handler:', error);
                        }
            });
        });
            } catch (error) {
                console.error('Error initializing navigation:', error);
            }
    }

    // Bible API Functions
    async function fetchBiblePassage(reference) {
        try {
            const version = versionSelect.value || DEFAULT_VERSION;
            verseContent.innerHTML = `<div class="loading">Loading ${reference} from ${version.toUpperCase()} translation</div>`;
            
            const response = await fetch(`${BIBLE_API_URL}/${encodeURIComponent(reference)}?translation=${version.toLowerCase()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching Bible data:', error);
            verseContent.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-circle"></i>
                    Error loading passage. Please try again.
                </div>
            `;
            return null;
        }
    }

    function loadBooks() {
            if (!bookSelect) {
                console.warn('Book select element not found');
                return;
            }
        
            try {
        bookSelect.innerHTML = '<option value="">Select Book</option>';
        bibleBooks.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = book.name;
            bookSelect.appendChild(option);
        });
            } catch (error) {
                console.error('Error loading books:', error);
            }
    }

    function loadChapters(bookId) {
            if (!chapterSelect) {
                console.warn('Chapter select element not found');
                return;
            }
        
            try {
        const book = bibleBooks.find(b => b.id === bookId);
        if (book) {
            chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
            for (let i = 1; i <= book.chapters; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Chapter ${i}`;
                chapterSelect.appendChild(option);
            }
            chapterSelect.disabled = false;
                }
            } catch (error) {
                console.error('Error loading chapters:', error);
        }
    }

    async function loadVerses(bookId, chapter) {
        try {
            const book = bibleBooks.find(b => b.id === bookId);
            if (!book) return;
            
            verseContent.innerHTML = '<div class="loading">Loading...</div>';
            const reference = `${book.name} ${chapter}`;
            const data = await fetchBiblePassage(reference);
            
            if (data?.verses) {
                verseContent.innerHTML = '';
                
                const passageHeader = document.createElement('div');
                passageHeader.className = 'passage-header';
                passageHeader.innerHTML = `
                    <h3>${book.name} - Chapter ${chapter}</h3>
                    <p class="passage-version">${versionSelect.options[versionSelect.selectedIndex].text}</p>
                `;
                verseContent.appendChild(passageHeader);
                
                    // Create a continuous passage container instead of individual verse elements
                    const passageContainer = document.createElement('div');
                    passageContainer.className = 'passage-container';
                
                data.verses.forEach(verse => {
                        // Create individual verse spans that will flow together
                        const verseSpan = document.createElement('span');
                        verseSpan.className = 'verse';
                        verseSpan.id = `verse-${book.id}-${chapter}-${verse.verse}`;
                    const verseReference = `${book.name} ${chapter}:${verse.verse}`;
                        verseSpan.dataset.reference = verseReference;
                        
                        // Create a small verse number superscript
                        const verseNumber = document.createElement('sup');
                        verseNumber.className = 'verse-number';
                        verseNumber.textContent = verse.verse;
                        
                        // Create the verse text as a span
                        const verseText = document.createElement('span');
                        verseText.className = 'verse-text';
                        verseText.textContent = ` ${verse.text} `;
                        
                        // Apply existing highlights and bookmarks
                        if (highlightedVerses[verseSpan.id]) {
                            verseSpan.classList.add(`highlight-${highlightedVerses[verseSpan.id]}`);
                    }
                    if (isBookmarked(verseReference)) {
                            verseSpan.classList.add('bookmark-highlight');
                    }
                    
                        // Assemble the verse span
                        verseSpan.appendChild(verseNumber);
                        verseSpan.appendChild(verseText);
                        passageContainer.appendChild(verseSpan);
                });
                
                    verseContent.appendChild(passageContainer);
                
                // Add navigation buttons after passage
                const chapterNavigation = document.querySelector('.chapter-navigation');
                if (chapterNavigation) {
                    // Move it after the verseContent if needed
                    verseContent.parentNode.insertBefore(chapterNavigation, verseContent.nextSibling);
                    // Make sure it's visible
                    chapterNavigation.style.display = 'flex';
                }
                
                updateReadingProgress(`${book.id}-${chapter}`);
                verseContent.scrollTop = 0;
                updateChapterNavigationButtons();
                    
                    // Ensure right-click handlers are added to all verse elements
                    setTimeout(() => {
                        // Check if the function exists before calling it
                        if (typeof addRightClickHandlersToVerses === 'function') {
                            addRightClickHandlersToVerses();
                        } else {
                            console.warn('⚠️ addRightClickHandlersToVerses function not available');
                        }
                    }, 100);
            }
        } catch (error) {
            console.error('Error loading verses:', error);
            verseContent.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-circle"></i>
                    Error loading verses. Please try again.
                </div>
            `;
        }
    }

    // Context Menu
    let currentVerse = null;

    function initializeContextMenu() {
            try {
                console.log('⏳ Setting up context menu...');
                
                // Make sure the context menu exists
                if (!contextMenu) {
                    console.error('❌ Context menu element not found');
                    return;
                }
                
                // INTERCEPT and PREVENT ALL contextmenu events on the document
        document.addEventListener('contextmenu', function(e) {
            const verseElement = e.target.closest('.verse');
            if (verseElement) {
                        console.log('🛑 Preventing default context menu on verse:', verseElement.id);
                e.preventDefault();
                        e.stopPropagation();
                        
                        // Show our custom context menu at mouse position
                showContextMenu(e, verseElement);
                        return false;
                    }
                }, true);
                
                // Backup: Directly handle mousedown too to ensure context menu is caught
                document.addEventListener('mousedown', function(e) {
                    // Check if right mouse button (which is 2)
                    if (e.button === 2) {
                        console.log('👆 Right mouse button detected on:', e.target);
                        
                        // Find the closest verse element (now using span.verse)
                        const verseElement = e.target.closest('.verse');
                        if (verseElement) {
                            console.log('✅ Right click on verse element:', verseElement.id);
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Show our custom context menu
                            showContextMenu(e, verseElement);
                            return false;
                        }
                    }
                }, true);
                
                // Add special handling for mobile touch devices using long press
                let longPressTimer;
                const longPressDuration = 500; // ms
                
                // Touch start handler to detect long press
                document.addEventListener('touchstart', function(e) {
                    const verseElement = e.target.closest('.verse');
                    if (verseElement) {
                        longPressTimer = setTimeout(() => {
                            console.log('👆 Long press detected on verse:', verseElement.id);
                            // Create a simulated mouse event at touch position
                            const touch = e.touches[0];
                            const mouseEvent = new MouseEvent('mousedown', {
                                clientX: touch.clientX,
                                clientY: touch.clientY,
                                button: 2
                            });
                            
                            // Show context menu
                            showContextMenu(mouseEvent, verseElement);
                            e.preventDefault();
                        }, longPressDuration);
                    }
                }, false);
                
                // Clear long press timer if touch ends before timeout
                document.addEventListener('touchend', function() {
                    clearTimeout(longPressTimer);
                }, false);
                
                // Clear long press timer if touch is moved significantly
                document.addEventListener('touchmove', function() {
                    clearTimeout(longPressTimer);
                }, false);
                
                // Close context menu on click elsewhere, scroll, or window resize
        document.addEventListener('click', hideContextMenu);
        document.addEventListener('scroll', hideContextMenu);
        window.addEventListener('resize', hideContextMenu);
        
                // Setup highlight color buttons in context menu
                const colorButtons = contextMenu.querySelectorAll('[data-color]');
                if (colorButtons.length > 0) {
                    console.log(`✅ Found ${colorButtons.length} highlight color buttons`);
                    colorButtons.forEach(button => {
            button.addEventListener('click', function() {
                            console.log(`Highlight color selected: ${this.dataset.color}`);
                highlightVerse(this.dataset.color);
            });
        });
                } else {
                    console.error('❌ No highlight color buttons found in context menu');
                }
                
                // Setup bookmark button
                if (bookmarkVerse) {
                    console.log('✅ Setting up bookmark verse button');
                    bookmarkVerse.addEventListener('click', handleBookmarkVerse);
                } else {
                    console.error('❌ Bookmark verse button not found');
                }
                
                // Setup copy button
                if (copyVerse) {
                    console.log('✅ Setting up copy verse button');
                    copyVerse.addEventListener('click', handleCopyVerse);
                } else {
                    console.error('❌ Copy verse button not found');
                }
                
                // Setup share button
                if (shareVerse) {
                    console.log('✅ Setting up share verse button');
                    shareVerse.addEventListener('click', handleShareVerse);
                } else {
                    console.error('❌ Share verse button not found');
                }
                
                console.log('✅ Context menu setup complete');
            } catch (error) {
                console.error('❌ Error initializing context menu:', error);
            }
    }

    function showContextMenu(e, verseElement) {
            // This function MUST be as simple as possible to ensure exact positioning
            
            // 1. Store the verse
        currentVerse = verseElement;
        
            // 2. Update bookmark status if needed
        if (bookmarkVerse) {
                const reference = currentVerse.dataset.reference;
                const isAlreadyBookmarked = isBookmarked(reference);
                bookmarkVerse.innerHTML = isAlreadyBookmarked 
                ? '<i class="fas fa-bookmark"></i> Remove Bookmark' 
                : '<i class="fas fa-bookmark"></i> Bookmark';
        }
        
            // 3. Position EXACTLY at mouse coordinates with a small adjustment to center it
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.left = `${e.clientX}px`;
            
            // 4. Show the menu with maximum z-index
        contextMenu.style.display = 'block';
            contextMenu.style.zIndex = '2147483647';
            
            // 5. Add the active class for smooth animation
            setTimeout(() => {
                contextMenu.classList.add('active');
            }, 10);
            
            console.log(`Context menu shown at cursor position: ${e.clientX}, ${e.clientY}`);
            
            // 6. Prevent it from going off-screen
            const menuRect = contextMenu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            if (menuRect.right > viewportWidth) {
                contextMenu.style.left = `${e.clientX - menuRect.width}px`;
            }
            
            if (menuRect.bottom > viewportHeight) {
                contextMenu.style.top = `${e.clientY - menuRect.height}px`;
            }
    }

    function hideContextMenu() {
            if (contextMenu) {
                contextMenu.classList.remove('active');
                setTimeout(() => {
        contextMenu.style.display = 'none';
                }, 150);
            }
    }

    function highlightVerse(color) {
            try {
                console.log(`⏳ Attempting to highlight verse with color: ${color}`);
                
                if (!currentVerse) {
                    console.error('❌ No verse selected for highlighting');
                    return;
                }
                
                // Remove existing highlights
        currentVerse.classList.remove('highlight-yellow', 'highlight-green', 'highlight-blue');
                
                // Add the new highlight
        currentVerse.classList.add(`highlight-${color}`);
                console.log(`✅ Applied highlight-${color} to verse: ${currentVerse.id}`);
        
                // Save highlight in localStorage
        highlightedVerses[currentVerse.id] = color;
                safeSetJSON('highlightedVerses', highlightedVerses);
        
                // Update highlight count
        highlightCount++;
                safeSetJSON('highlightCount', highlightCount);
        updateStats();
        
                // Check for highlighter achievement
        if (highlightCount >= 10 && !achievements.highlighter) {
            achievements.highlighter = true;
                    safeSetJSON('achievements', achievements);
            showAchievement('Highlighter', 'You\'ve highlighted 10 verses.');
                    console.log('🏆 Unlocked Highlighter achievement!');
        }
        
                // Hide the context menu
        hideContextMenu();
                
                // Show feedback notification
                showNotification(`Verse highlighted in ${color}`);
            } catch (error) {
                console.error('❌ Error highlighting verse:', error);
            }
    }

    function isBookmarked(reference) {
        return bookmarks?.some(bookmark => bookmark.reference === reference) || false;
    }

    function handleBookmarkVerse() {
            try {
                console.log('⏳ Handling bookmark verse action');
                
                if (!currentVerse) {
                    console.error('❌ No verse selected for bookmarking');
                    return;
                }
        
        const reference = currentVerse.dataset.reference;
        const verseText = currentVerse.querySelector('.verse-text');
                
                if (!reference || !verseText) {
                    console.error('❌ Missing reference or text in verse element');
                    return;
                }
                
                console.log('📚 Bookmark action for verse:', reference);
        
        if (isBookmarked(reference)) {
                    console.log('Removing existing bookmark');
                    // Remove existing bookmark
            bookmarks = bookmarks.filter(bookmark => bookmark.reference !== reference);
            currentVerse.classList.remove('bookmark-highlight');
                    showNotification(`Bookmark removed: ${reference}`);
        } else {
                    console.log('Adding new bookmark');
                    // Add new bookmark
            bookmarks.push({
                reference: reference,
                text: verseText.textContent,
                date: new Date().toISOString()
            });
            
                    currentVerse.classList.add('bookmark-highlight');
                    showNotification(`Bookmark added: ${reference}`);
                    
                    // Check for bookmarker achievement
            if (bookmarks.length >= 5 && !achievements.bookmarker) {
                achievements.bookmarker = true;
                        safeSetJSON('achievements', achievements);
                showAchievementNotification('Bookmarker', 'You\'ve saved 5 bookmarks.');
                        console.log('🏆 Unlocked Bookmarker achievement!');
            }
        }
        
                // Save updated bookmarks to localStorage
                safeSetJSON('bookmarks', bookmarks);
        updateBookmarks();
        updateStats();
        hideContextMenu();
            } catch (error) {
                console.error('❌ Error handling bookmark verse:', error);
            }
    }
    
    function handleCopyVerse() {
            try {
                console.log('⏳ Handling copy verse action');
                
                if (!currentVerse) {
                    console.error('❌ No verse selected for copying');
                    return;
                }
        
        const reference = currentVerse.dataset.reference;
        const verseText = currentVerse.querySelector('.verse-text');
                
                if (!reference || !verseText) {
                    console.error('❌ Missing reference or text in verse element');
                    return;
                }
        
        const textToCopy = `${reference}: ${verseText.textContent}`;
                console.log('📋 Copying text:', textToCopy);
        
                // Try the modern clipboard API first
        navigator.clipboard.writeText(textToCopy)
                    .then(() => {
                        console.log('✅ Text copied to clipboard using Clipboard API');
                        showNotification('Verse copied to clipboard');
                    })
            .catch(err => {
                        console.error('Error using Clipboard API:', err);
                        
                        // Fallback to older execCommand method
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                document.body.appendChild(textarea);
                textarea.select();
                        
                        try {
                            const successful = document.execCommand('copy');
                            if (successful) {
                                console.log('✅ Text copied to clipboard using execCommand');
                showNotification('Verse copied to clipboard');
                            } else {
                                console.error('❌ execCommand copy failed');
                                showNotification('Failed to copy verse to clipboard');
                            }
                        } catch (e) {
                            console.error('❌ Error using execCommand:', e);
                            showNotification('Failed to copy verse to clipboard');
                        }
                        
                        document.body.removeChild(textarea);
            });
        
        hideContextMenu();
            } catch (error) {
                console.error('❌ Error handling copy verse:', error);
                showNotification('Error copying verse to clipboard');
            }
    }
    
    function handleShareVerse() {
            try {
                console.log('⏳ Handling share verse action');
                
                if (!currentVerse) {
                    console.error('❌ No verse selected for sharing');
                    return;
                }
        
        const reference = currentVerse.dataset.reference;
        const verseText = currentVerse.querySelector('.verse-text');
                
                if (!reference || !verseText) {
                    console.error('❌ Missing reference or text in verse element');
                    return;
                }
        
        const textToShare = `${reference}: ${verseText.textContent}`;
                console.log('🔗 Sharing text:', textToShare);
        
        if (navigator.share) {
                    // Use Web Share API if available (mobile devices)
            navigator.share({
                title: 'Bible Verse',
                text: textToShare,
                url: window.location.href
                    })
                    .then(() => {
                        console.log('✅ Content shared successfully');
                    })
                    .catch((error) => {
                        console.error('❌ Error sharing content:', error);
                        // Fallback to copy
                        handleCopyVerse();
                    });
        } else {
                    console.log('⚠️ Web Share API not available, falling back to copy');
                    // Fallback to copy on desktop
            handleCopyVerse();
            showNotification('Verse copied to clipboard (share not available)');
        }
        
        hideContextMenu();
            } catch (error) {
                console.error('❌ Error handling share verse:', error);
            }
    }
    
    function showNotification(message) {
            try {
                // Use existing notification element instead of creating new ones
                const notificationElement = document.getElementById('notification');
                const notificationMessage = document.getElementById('notificationMessage');
                
                if (notificationElement && notificationMessage) {
                    // Use the permanent notification element in HTML
                    notificationMessage.textContent = message;
                    notificationElement.classList.add('show');
                    
                    setTimeout(() => {
                        notificationElement.classList.remove('show');
                    }, 2000);
                } else {
                    // Fallback to creating a temporary notification if elements not found
                    let notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
                        setTimeout(() => {
                            if (notification.parentNode) {
                                document.body.removeChild(notification);
                            }
                        }, 300);
        }, 2000);
                }
            } catch (error) {
                console.error('Error showing notification:', error);
            }
    }

    function initializeEventListeners() {
            try {
                console.log('⏳ Setting up event listeners...');
                
                // Book and chapter selection
        if (bookSelect) {
                    console.log('✅ Setting up bookSelect event listener');
            bookSelect.addEventListener('change', (e) => {
                currentBook = e.target.value;
                if (currentBook) {
                    loadChapters(currentBook);
                            if (chapterSelect) {
                    chapterSelect.disabled = false;
                    chapterSelect.value = '';
                            }
                            if (verseContent) {
                    verseContent.innerHTML = `
                        <div class="initial-message">
                            <i class="fas fa-book-open"></i>
                            <p>Select a chapter to start reading</p>
                        </div>
                    `;
                            }
                }
            });
                } else {
                    console.error('❌ bookSelect element not found');
        }
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Navigation shortcuts
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'h': // Home
                        e.preventDefault();
                        if (homeBtn) homeBtn.click();
                        break;
                    case 'r': // Reader
                        e.preventDefault();
                        if (readBtn) readBtn.click();
                        break;
                    case 'b': // Bookmarks
                        e.preventDefault();
                        if (bookmarksBtn) bookmarksBtn.click();
                        break;
                    case 'p': // Profile
                        e.preventDefault();
                        if (profileBtn) profileBtn.click();
                        break;
                    case 's': // Settings
                        e.preventDefault();
                        if (settingsBtn) settingsBtn.click();
                        break;
                }
            } else {
                // Reading shortcuts (only when in reading section)
                if (document.getElementById('read').classList.contains('active')) {
                    switch (e.key) {
                        case 'ArrowRight': // Next chapter
                            e.preventDefault();
                            if (nextChapter) nextChapter.click();
                            break;
                        case 'ArrowLeft': // Previous chapter
                            e.preventDefault();
                            if (prevChapter) prevChapter.click();
                            break;
                        case 'b': // Bookmark current verse
                            // If a verse is in focus (either mouse over or selected)
                            const activeVerse = document.querySelector('.verse.active') || document.querySelector('.verse:hover');
                            if (activeVerse) {
                                e.preventDefault();
                                const reference = activeVerse.dataset.reference;
                                if (reference && !isBookmarked(reference)) {
                                    handleBookmarkVerse(reference);
                                }
                            }
                            break;
                        case '+': // Increase font size
                        case '=': // Support both + and = (unshifted +)
                            e.preventDefault();
                            changeFontSize(1);
                            break;
                        case '-': // Decrease font size
                            e.preventDefault();
                            changeFontSize(-1);
                            break;
                        case 'd': // Toggle dark/light mode
                            e.preventDefault();
                            const currentTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
                            changeTheme(currentTheme);
                            break;
                    }
                }
            }
        });
        console.log('✅ Keyboard shortcuts initialized');

        if (chapterSelect) {
                    console.log('✅ Setting up chapterSelect event listener');
            chapterSelect.addEventListener('change', (e) => {
                currentChapter = e.target.value;
                if (currentChapter && currentBook) {
                    loadVerses(currentBook, currentChapter);
                    updateChapterNavigationButtons();
                }
            });
                } else {
                    console.error('❌ chapterSelect element not found');
        }
        
        // Chapter navigation buttons
        const prevChapter = document.getElementById('prevChapter');
        const nextChapter = document.getElementById('nextChapter');
        
        if (prevChapter) {
            console.log('✅ Setting up prevChapter event listener');
            prevChapter.addEventListener('click', () => {
                if (!currentBook || !currentChapter) return;
                
                const book = bibleBooks.find(b => b.id === currentBook);
                if (!book) return;
                
                let newChapter = parseInt(currentChapter) - 1;
                
                // If we're at the first chapter of a book
                if (newChapter < 1) {
                    // Find the previous book
                    const currentBookIndex = bibleBooks.findIndex(b => b.id === currentBook);
                    if (currentBookIndex > 0) {
                        const previousBook = bibleBooks[currentBookIndex - 1];
                        currentBook = previousBook.id;
                        newChapter = previousBook.chapters;
                        
                        // Update book select and load chapters
                        if (bookSelect) {
                            bookSelect.value = currentBook;
                            loadChapters(currentBook);
                        }
                    } else {
                        // We're at Genesis 1, nowhere to go
                        return;
                    }
                }
                
                // Update chapter select and trigger change
                if (chapterSelect) {
                    chapterSelect.value = newChapter;
                    currentChapter = newChapter;
                    loadVerses(currentBook, currentChapter);
                    updateChapterNavigationButtons();
                }
            });
        }
        
        if (nextChapter) {
            console.log('✅ Setting up nextChapter event listener');
            nextChapter.addEventListener('click', () => {
                if (!currentBook || !currentChapter) return;
                
                const book = bibleBooks.find(b => b.id === currentBook);
                if (!book) return;
                
                let newChapter = parseInt(currentChapter) + 1;
                
                // If we're at the last chapter of a book
                if (newChapter > book.chapters) {
                    // Find the next book
                    const currentBookIndex = bibleBooks.findIndex(b => b.id === currentBook);
                    if (currentBookIndex < bibleBooks.length - 1) {
                        const nextBook = bibleBooks[currentBookIndex + 1];
                        currentBook = nextBook.id;
                        newChapter = 1;
                        
                        // Update book select and load chapters
                        if (bookSelect) {
                            bookSelect.value = currentBook;
                            loadChapters(currentBook);
                        }
                    } else {
                        // We're at Revelation 22, nowhere to go
                        return;
                    }
                }
                
                // Update chapter select and trigger change
                if (chapterSelect) {
                    chapterSelect.value = newChapter;
                    currentChapter = newChapter;
                    loadVerses(currentBook, currentChapter);
                    updateChapterNavigationButtons();
                }
            });
        }
        
        if (versionSelect) {
                    console.log('✅ Setting up versionSelect event listener');
            versionSelect.addEventListener('change', () => {
                        console.log('Bible version changed to:', versionSelect.value);
                        
                        // Update the localStorage
                        try {
                            localStorage.setItem('bibleVersion', versionSelect.value);
                        } catch (e) {
                            console.error('Error saving Bible version to localStorage:', e);
                        }
                        
                        // If we're already viewing a chapter, reload it with the new version
                if (currentBook && currentChapter) {
                            console.log(`Reloading ${currentBook} ${currentChapter} with new version`);
                    loadVerses(currentBook, currentChapter);
                }
                        
                        // Show notification of version change
                        showNotification(`Bible version changed to ${versionSelect.options[versionSelect.selectedIndex].text}`);
                    });
                } else {
                    console.error('❌ versionSelect element not found');
                }
                
                // Font size controls
                if (decreaseFontBtn) {
                    console.log('✅ Setting up decreaseFontBtn event listener');
                    decreaseFontBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        changeFontSize(-1);
                    });
                } else {
                    console.error('❌ decreaseFontBtn element not found');
                }
                
                if (increaseFontBtn) {
                    console.log('✅ Setting up increaseFontBtn event listener');
                    increaseFontBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        changeFontSize(1);
                    });
                } else {
                    console.error('❌ increaseFontBtn element not found');
                }
                
                // Theme options
                if (themeOptions && themeOptions.length > 0) {
                    console.log('✅ Setting up theme options event listeners');
                    themeOptions.forEach(option => {
                        option.addEventListener('click', () => {
                            changeTheme(option.dataset.theme);
                        });
                    });
                } else {
                    console.error('❌ themeOptions elements not found');
                }
                
                // Default Bible version
                if (defaultVersionSelect) {
                    console.log('✅ Setting up defaultVersionSelect event listener');
                    defaultVersionSelect.addEventListener('change', () => {
                        console.log('Default Bible version changed to:', defaultVersionSelect.value);
                        
                        // Get the selected version
                        const version = defaultVersionSelect.value;
                        
                        // Update the main version select if it exists
                        if (versionSelect) {
                            console.log('Updating main version select to match default');
                            versionSelect.value = version;
                            
                            // Dispatch change event to reload verses if needed
                            versionSelect.dispatchEvent(new Event('change'));
                        } else {
                            // If main version select doesn't exist, just save the setting
                            try {
                                localStorage.setItem('bibleVersion', version);
                            } catch (e) {
                                console.error('Error saving Bible version to localStorage:', e);
                            }
                            
                            // Reload verses if we're viewing a chapter
                            if (currentBook && currentChapter) {
                                console.log(`Reloading ${currentBook} ${currentChapter} with new version`);
                                loadVerses(currentBook, currentChapter);
                            }
                            
                            // Show notification
                            showNotification(`Default Bible version set to ${defaultVersionSelect.options[defaultVersionSelect.selectedIndex].text}`);
                        }
                    });
                } else {
                    console.error('❌ defaultVersionSelect element not found');
                }
                
                // Add document click listener to close context menu
                document.addEventListener('click', function(event) {
                    if (contextMenu && contextMenu.style.display === 'block' && !contextMenu.contains(event.target)) {
                        hideContextMenu();
                    }
                });
                
                console.log('✅ Event listeners setup complete');
            } catch (error) {
                console.error('❌ Error initializing event listeners:', error);
        }
    }

    function updateReadingProgress(chapterId) {
        if (!chapterId) return;
        
        if (!chaptersRead.includes(chapterId)) {
            chaptersRead.push(chapterId);
            safeSetJSON('chaptersRead', chaptersRead);
            console.log(`✅ Added ${chapterId} to chapters read.`);
        }
                
                updateReadingProgressDisplay();
        
        // Update profile section detailed stats
        updateProfileReadingStats();
        
        // Check for achievements
                checkAchievements();
        }

        function updateReadingProgressDisplay() {
        if (!progressElement) return;
        
        const totalChapters = 1189; // Approximate total chapters in the Bible
        const percentComplete = Math.round((chaptersRead.length / totalChapters) * 100);
        
        progressElement.style.width = `${percentComplete}%`;
        progressElement.textContent = `${percentComplete}%`;
        
        console.log(`✅ Reading progress updated: ${percentComplete}%`);
    }
    
    // New function to update detailed profile reading stats
    function updateProfileReadingStats() {
        // Get all the profile stats elements
        const chaptersReadCount = document.getElementById('chaptersReadCount');
        const oldTestamentCount = document.getElementById('oldTestamentCount');
        const newTestamentCount = document.getElementById('newTestamentCount');
        const totalChaptersRead = document.getElementById('totalChaptersRead');
        const oldTestamentProgress = document.getElementById('oldTestamentProgress');
        const newTestamentProgress = document.getElementById('newTestamentProgress');
        
        if (!chaptersReadCount) return; // Profile section might not be loaded
        
        // Define Old Testament and New Testament book arrays
        const oldTestamentBooks = bibleBooks.slice(0, 39).map(b => b.id);
        const newTestamentBooks = bibleBooks.slice(39).map(b => b.id);
        
        // Calculate Old Testament vs New Testament progress
        let oldTestamentReadCount = 0;
        let newTestamentReadCount = 0;
        
        chaptersRead.forEach(chapterId => {
            const bookId = chapterId.split('-')[0];
            if (oldTestamentBooks.includes(bookId)) {
                oldTestamentReadCount++;
            } else if (newTestamentBooks.includes(bookId)) {
                newTestamentReadCount++;
            }
        });
        
        // Update UI elements
        chaptersReadCount.textContent = chaptersRead.length;
        if (totalChaptersRead) totalChaptersRead.textContent = chaptersRead.length;
        
        // Update testament counters
        const oldTestamentTotal = 929; // Approximate number of chapters in OT
        const newTestamentTotal = 260; // Approximate number of chapters in NT
        
        if (oldTestamentCount) oldTestamentCount.textContent = oldTestamentReadCount;
        if (newTestamentCount) newTestamentCount.textContent = newTestamentReadCount;
        
        // Update progress bars
        if (oldTestamentProgress) {
            const oldPct = Math.round((oldTestamentReadCount / oldTestamentTotal) * 100);
            oldTestamentProgress.style.width = `${oldPct}%`;
            oldTestamentProgress.textContent = `${oldPct}%`;
        }
        
        if (newTestamentProgress) {
            const newPct = Math.round((newTestamentReadCount / newTestamentTotal) * 100);
            newTestamentProgress.style.width = `${newPct}%`;
            newTestamentProgress.textContent = `${newPct}%`;
        }
        
        // Update streak data when reading
        updateReadingStreak();
    }
    
    // Function to update reading streak
    function updateReadingStreak() {
        // Get profile data from localStorage
        let profileData = safeGetJSON('profileData', {
            streak: {
                current: 0,
                best: 0,
                lastReadDate: null
            }
        });
        
        const today = new Date().toDateString();
        
        if (!profileData.streak.lastReadDate) {
            // First time reading
            profileData.streak.lastReadDate = today;
            profileData.streak.current = 1;
            profileData.streak.best = 1;
        } else {
            const lastDate = new Date(profileData.streak.lastReadDate);
            const currentDate = new Date(today);
            
            // Calculate difference in days
            const timeDiff = currentDate.getTime() - lastDate.getTime();
            const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
            
            if (dayDiff === 1) {
                // Consecutive day
                profileData.streak.current += 1;
                profileData.streak.lastReadDate = today;
                
                // Update best streak if needed
                if (profileData.streak.current > profileData.streak.best) {
                    profileData.streak.best = profileData.streak.current;
                }
                
                // Notify user about streak
                if (profileData.streak.current >= 3) {
                    showNotification(`🔥 ${profileData.streak.current} day streak! Keep it up!`);
                }
            } else if (dayDiff > 1) {
                // Streak broken
                profileData.streak.current = 1;
                profileData.streak.lastReadDate = today;
            } else if (dayDiff === 0) {
                // Same day, don't update streak
            }
        }
        
        safeSetJSON('profileData', profileData);
        
        // Update UI if elements exist
        const currentStreak = document.getElementById('currentStreak');
        const bestStreak = document.getElementById('bestStreak');
        
        if (currentStreak) {
            currentStreak.textContent = `${profileData.streak.current} day${profileData.streak.current !== 1 ? 's' : ''}`;
        }
        
        if (bestStreak) {
            bestStreak.textContent = `${profileData.streak.best} day${profileData.streak.best !== 1 ? 's' : ''}`;
        }
    }

    function updateBookmarks() {
        if (!bookmarksList) return;
        
        bookmarksList.innerHTML = '';
        
        if (bookmarkCount) {
            bookmarkCount.textContent = `${bookmarks.length} verse${bookmarks.length !== 1 ? 's' : ''}`;
        }
        
        if (bookmarks.length === 0) {
            bookmarksList.innerHTML = `
                <div class="initial-message">
                    <i class="fas fa-bookmark"></i>
                    <p>No bookmarks yet. Right-click on a verse to bookmark it.</p>
                </div>
            `;
            return;
        }
        
        [...bookmarks].sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach((bookmark, index) => {
                const bookmarkElement = document.createElement('div');
                bookmarkElement.className = 'bookmark-item';
                bookmarkElement.dataset.index = index;
                
                const date = new Date(bookmark.date);
                const formattedDate = date.toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
                
                bookmarkElement.innerHTML = `
                    <div class="bookmark-header">
                        <span class="bookmark-reference"><i class="fas fa-book-bible"></i>${bookmark.reference}</span>
                        <span class="bookmark-date">${formattedDate}</span>
                    </div>
                    <div class="bookmark-text">${bookmark.text}</div>
                    <div class="bookmark-actions">
                        <button class="bookmark-action-btn read" title="Read in context">
                            <i class="fas fa-book-open"></i>
                        </button>
                        <button class="bookmark-action-btn copy" title="Copy verse">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="bookmark-action-btn share" title="Share verse">
                            <i class="fas fa-share-alt"></i>
                        </button>
                        <button class="bookmark-action-btn delete" title="Delete bookmark">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                
                // Navigate to verse when clicking on the bookmark
                bookmarkElement.querySelector('.read').addEventListener('click', (e) => {
                    e.stopPropagation();
                    navigateToVerse(bookmark.reference);
                });
                
                // Copy verse text
                bookmarkElement.querySelector('.copy').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const textToCopy = `${bookmark.reference}: ${bookmark.text}`;
                    navigator.clipboard.writeText(textToCopy)
                        .then(() => showNotification('Verse copied to clipboard'))
                        .catch(err => console.error('Error copying verse:', err));
                });
                
                // Share verse
                bookmarkElement.querySelector('.share').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const textToShare = `${bookmark.reference}: ${bookmark.text}`;
                    if (navigator.share) {
                        navigator.share({
                            title: 'Bible Verse',
                            text: textToShare
                        })
                        .then(() => showNotification('Verse shared successfully'))
                        .catch(err => console.error('Error sharing verse:', err));
                    } else {
                        navigator.clipboard.writeText(textToShare)
                            .then(() => showNotification('Verse copied to clipboard for sharing'))
                            .catch(err => console.error('Error copying verse for sharing:', err));
                    }
                });
                
                // Delete bookmark
                bookmarkElement.querySelector('.delete').addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Remove from bookmarks array
                    bookmarks.splice(index, 1);
                    
                    // Save updated bookmarks to localStorage
                    safeSetJSON('bookmarks', bookmarks);
                    
                    // Update UI
                    showNotification('Bookmark deleted');
                    
                    // Update the bookmarks list
                    updateBookmarks();
                    
                    // Also update stats if there's a profile section
                    if (typeof updateStats === 'function') {
                        updateStats();
                    }
                });
                
                bookmarksList.appendChild(bookmarkElement);
            });
    }
    
    function updateRecentReadings(newChapterId) {
        if (!recentVersesElement || !newChapterId) return;
        
        const [bookId, chapter] = newChapterId.split('-');
        const book = bibleBooks.find(b => b.id === bookId);
        if (!book) return;
        
        let recentReadings = JSON.parse(localStorage.getItem('recentReadings') || '[]');
        recentReadings = recentReadings.filter(r => r.id !== newChapterId);
        recentReadings.unshift({
            id: newChapterId,
            title: `${book.name} - Chapter ${chapter}`,
            timestamp: new Date().toISOString()
        });
        recentReadings = recentReadings.slice(0, 5);
            safeSetJSON('recentReadings', recentReadings);
        
        // Display recent readings
        recentVersesElement.innerHTML = recentReadings.length === 0 ? `
            <div class="initial-message">
                <i class="fas fa-book-open"></i>
                <p>No recent readings yet. Start reading to see your history here.</p>
            </div>
        ` : '';
        
        recentReadings.forEach(reading => {
            const [bookId, chapter] = reading.id.split('-');
            const date = new Date(reading.timestamp);
            const formattedDate = date.toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            const readingElement = document.createElement('div');
            readingElement.className = 'recent-item';
            readingElement.innerHTML = `
                <span class="recent-title">${reading.title}</span>
                <span class="recent-date">${formattedDate}</span>
            `;
            
            readingElement.addEventListener('click', () => {
                document.getElementById('readBtn').click();
                if (bookSelect && chapterSelect) {
                    bookSelect.value = bookId;
                    loadChapters(bookId);
                    setTimeout(() => {
                        chapterSelect.value = chapter;
                        chapterSelect.dispatchEvent(new Event('change'));
                    }, 100);
                }
            });
            
            recentVersesElement.appendChild(readingElement);
        });
    }
    
    function navigateToVerse(reference) {
        try {
            console.log(`⏳ Navigating to verse: ${reference}`);
            
        const parts = reference.split(' ');
            const chapterVerse = parts[parts.length - 1].split(':');
            const chapter = chapterVerse[0];
            const verse = chapterVerse[1];
        let bookName = parts[0];
        
            // Handle multi-word book names (e.g., "1 Samuel")
        if (parts.length > 2) {
            bookName = parts.slice(0, parts.length - 1).join(' ');
        }
            
            console.log(`📚 Parsed reference: Book=${bookName}, Chapter=${chapter}, Verse=${verse}`);
        
        const book = bibleBooks.find(b => b.name === bookName);
            if (!book) {
                console.error(`❌ Could not find book: ${bookName}`);
                return;
            }
        
            // Navigate to the Read section
        document.getElementById('readBtn').click();
            console.log(`✅ Navigated to Read section, book ID: ${book.id}`);
            
            if (!bookSelect || !chapterSelect) {
                console.error('❌ Book or chapter select elements not found');
                return;
            }
            
            // First, select the book
            if (bookSelect.value !== book.id) {
            bookSelect.value = book.id;
                console.log(`✅ Set book select value to ${book.id}`);
                
                // Manually call loadChapters instead of relying on event
            loadChapters(book.id);
                console.log(`✅ Manually called loadChapters for ${book.id}`);
            }
            
            // Now select the chapter after a short delay
            setTimeout(() => {
                if (chapterSelect.options.length > 1) {
                chapterSelect.value = chapter;
                    console.log(`✅ Set chapter select value to ${chapter}`);
                
                    // Manually load verses instead of relying on event
                    loadVerses(book.id, chapter);
                    console.log(`✅ Manually called loadVerses for ${book.id}, chapter ${chapter}`);
                    
                    // Wait for verses to load, then scroll to specific verse
                setTimeout(() => {
                    const verseElement = document.getElementById(`verse-${book.id}-${chapter}-${verse}`);
                    if (verseElement) {
                        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        verseElement.classList.add('highlight-pulse');
                        setTimeout(() => verseElement.classList.remove('highlight-pulse'), 2000);
                            console.log(`✅ Scrolled to verse ${verse}`);
                        } else {
                            console.error(`❌ Could not find verse element: verse-${book.id}-${chapter}-${verse}`);
                        }
                    }, 500);
                } else {
                    console.error(`❌ Chapter options not loaded properly for ${book.id}`);
                }
            }, 300);
        } catch (error) {
            console.error('❌ Error navigating to verse:', error);
        }
    }
    
    function checkAchievements() {
            try {
                console.log('⏳ Checking for achievement updates...');
                
        let achievementsChanged = false;
            
            // Use chaptersRead array directly instead of readingData
            //const chaptersRead = Object.keys(readingData);
        
        // First chapter achievement
                if (chaptersRead.length >= 1 && !achievements.first_read) {
                    achievements.first_read = true;
            achievementsChanged = true;
            showAchievementNotification('First Chapter', 'You\'ve read your first chapter!');
                    console.log('🏆 Unlocked: First Chapter achievement');
        }
        
        // Ten chapters achievement
                if (chaptersRead.length >= 10 && !achievements.ten_chapters) {
                    achievements.ten_chapters = true;
            achievementsChanged = true;
            showAchievementNotification('Dedicated Reader', 'You\'ve read 10 chapters!');
                    console.log('🏆 Unlocked: Dedicated Reader achievement');
        }
        
        // Old Testament achievement
                if (chaptersRead.some(chapterId => oldTestamentBooks.includes(chapterId.split('-')[0])) && !achievements.old_testament) {
                    achievements.old_testament = true;
            achievementsChanged = true;
            showAchievementNotification('Old Testament', 'You\'ve read from the Old Testament!');
                    console.log('🏆 Unlocked: Old Testament achievement');
        }
        
        // New Testament achievement
                if (chaptersRead.some(chapterId => newTestamentBooks.includes(chapterId.split('-')[0])) && !achievements.new_testament) {
                    achievements.new_testament = true;
            achievementsChanged = true;
            showAchievementNotification('New Testament', 'You\'ve read from the New Testament!');
                    console.log('🏆 Unlocked: New Testament achievement');
        }
        
        if (achievementsChanged) {
                    // Save updated achievements to localStorage
                    safeSetJSON('achievements', achievements);
                    
                    // Refresh the achievements display
            populateAchievements();
                    
                    console.log('✅ Achievements updated and saved');
                }
            } catch (error) {
                console.error('❌ Error checking achievements:', error);
        }
    }
    
    function showAchievementNotification(title, message) {
            try {
                if (!achievementTitle || !achievementDesc || !achievementNotification) {
                    console.warn('Achievement notification elements not found');
                    
                    // Fallback to standard notification if achievement element is missing
                    showNotification(`Achievement: ${title} - ${message}`);
                    return;
                }
                
                // Use the dedicated achievement notification
        achievementTitle.textContent = title;
        achievementDesc.textContent = message;
        achievementNotification.classList.add('show');
                
                // Automatically hide after delay
                setTimeout(() => {
                    achievementNotification.classList.remove('show');
                }, 5000);
            } catch (error) {
                console.error('Error showing achievement notification:', error);
            }
        }
        
        // Add alias for showAchievementNotification for compatibility
        function showAchievement(title, message) {
            showAchievementNotification(title, message);
    }
    
    function populateAchievements() {
            try {
                console.log('⏳ Populating achievements section...');
                
                if (!achievementsElement) {
                    console.error('❌ Achievements element not found');
                    return;
                }
        
        const achievementsList = [
            { id: 'first_read', title: 'First Chapter', description: 'Read your first chapter', icon: 'fa-book-open' },
            { id: 'ten_chapters', title: 'Dedicated Reader', description: 'Read 10 chapters', icon: 'fa-bookmark' },
            { id: 'old_testament', title: 'Old Testament', description: 'Read a chapter from the Old Testament', icon: 'fa-scroll' },
            { id: 'new_testament', title: 'New Testament', description: 'Read a chapter from the New Testament', icon: 'fa-cross' },
            { id: 'bookmarker', title: 'Bookmarker', description: 'Saved 5 bookmarks', icon: 'fa-bookmark' },
            { id: 'highlighter', title: 'Highlighter', description: 'Highlighted 10 verses', icon: 'fa-highlighter' }
        ];
        
                // Get the achievements from localStorage
        achievementsElement.innerHTML = '';
                
        achievementsList.forEach(achievement => {
            const achievementElement = document.createElement('div');
                    achievementElement.className = `achievement ${achievements[achievement.id] ? 'unlocked' : 'locked'}`;
            achievementElement.innerHTML = `
                <i class="fas ${achievement.icon}"></i>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                </div>
            `;
            achievementsElement.appendChild(achievementElement);
        });
                
                console.log(`✅ Populated ${achievementsList.length} achievements`);
                
                // Also make sure to update the reading progress
                updateReadingProgressDisplay();
            } catch (error) {
                console.error('❌ Error populating achievements:', error);
            }
        }

        function updateStats() {
            try {
                console.log('⏳ Updating stats...');
                
                // Update bookmark count
                if (bookmarkCount) {
                    bookmarkCount.textContent = `${bookmarks.length} verse${bookmarks.length !== 1 ? 's' : ''}`;
                }
                
                // Update reading progress
                updateReadingProgressDisplay();
                
                console.log('✅ Stats updated successfully');
            } catch (error) {
                console.error('❌ Error updating stats:', error);
            }
    }

    function changeTheme(theme) {
            try {
                console.log(`⏳ Changing theme to: ${theme}`);
                
                // Remove all theme classes
                document.body.classList.remove('dark', 'light', 'sepia');
                
                // Add the selected theme class
                document.body.classList.add(theme);
                
                // Save theme preference to localStorage
                localStorage.setItem('theme', theme);
                
                // Update theme options UI
                if (themeOptions) {
                    themeOptions.forEach(option => {
                        option.classList.remove('active');
                        if (option.dataset.theme === theme) {
                            option.classList.add('active');
                        }
                    });
                }
                
                // Update toggle button icon if it exists
                if (toggleThemeBtn) {
                    const icon = toggleThemeBtn.querySelector('i');
                    if (icon) {
                        if (theme === 'dark') {
                            icon.className = 'fas fa-moon';
                        } else if (theme === 'light') {
                            icon.className = 'fas fa-sun';
                        } else if (theme === 'sepia') {
                            icon.className = 'fas fa-book';
                        }
                    }
                }
                
                // Show notification of theme change
                showNotification(`Theme changed to ${theme}`);
                console.log(`Theme changed to: ${theme}`);
            } catch (error) {
                console.error('❌ Error changing theme:', error);
            }
    }

    function initializeSettings() {
            try {
                console.log('⏳ Initializing settings...');
                
                // Theme switching - Just set initial state, event listeners are in initializeEventListeners
                const savedTheme = localStorage.getItem('theme') || 'dark';
                document.body.classList.add(savedTheme);
        
                // Apply the saved theme to the theme options
                if (themeOptions && themeOptions.length > 0) {
                    themeOptions.forEach(option => {
                        option.classList.remove('active');
                        if (option.dataset.theme === savedTheme) {
                            option.classList.add('active');
                        }
                    });
                    console.log(`✅ Applied saved theme: ${savedTheme}`);
                } else {
                    console.warn('⚠️ Theme options not found');
                }
        
                // Set the correct icon for the theme toggle button in reader
                const toggleThemeBtn = document.getElementById('toggleThemeBtn');
                if (toggleThemeBtn) {
                    const icon = toggleThemeBtn.querySelector('i');
                    if (icon) {
                        icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
                    }
                    console.log(`✅ Set theme toggle button icon for ${savedTheme} theme`);
                }
        
                // Default Bible version - Just set initial state
                const savedVersion = localStorage.getItem('bibleVersion') || 'KJV';
                if (defaultVersionSelect) {
                    defaultVersionSelect.value = savedVersion;
                    console.log(`✅ Set default Bible version to: ${savedVersion}`);
                } else {
                    console.warn('⚠️ Default version select not found');
                }
                
                // Apply saved font size
                if (currentFontSize) {
                    currentFontSize.textContent = `${fontSize}px`;
                    document.documentElement.style.setProperty('--verse-font-size', `${fontSize}px`);
                    console.log(`✅ Applied saved font size: ${fontSize}px`);
                } else {
                    console.warn('⚠️ Font size display element not found');
                }
                
                // Initialize text alignment settings
                const savedAlignment = localStorage.getItem('textAlignment') || 'left';
                const alignmentOptions = document.querySelectorAll('.alignment-option');
                if (alignmentOptions && alignmentOptions.length > 0) {
                    // Update active alignment button
                    alignmentOptions.forEach(option => {
                        option.classList.remove('active');
                        if (option.dataset.align === savedAlignment) {
                            option.classList.add('active');
                        }
                        
                        // Add event listener
                        option.addEventListener('click', () => {
                            const alignment = option.dataset.align;
                            changeTextAlignment(alignment);
                            
                            // Update active class
                            alignmentOptions.forEach(opt => opt.classList.remove('active'));
                            option.classList.add('active');
                        });
                    });
                    
                    // Apply the saved alignment
                    changeTextAlignment(savedAlignment);
                    console.log(`✅ Applied saved text alignment: ${savedAlignment}`);
                }
                
                // Initialize reading mode
                const readingModeToggle = document.getElementById('readingModeToggle');
                if (readingModeToggle) {
                    // Check if we're on mobile
                    const isMobile = window.innerWidth <= 768;
                    
                    // On mobile, always start with reading mode disabled
                    if (isMobile) {
                        localStorage.setItem('readingMode', 'false');
                        readingModeToggle.checked = false;
                        document.body.classList.remove('distraction-free');
                    } else {
                        // On desktop, use saved preference
                        const savedReadingMode = localStorage.getItem('readingMode') === 'true';
                        readingModeToggle.checked = savedReadingMode;
                        
                        if (savedReadingMode) {
                            document.body.classList.add('distraction-free');
                        }
                    }
                    
                    // Add event listener
                    readingModeToggle.addEventListener('change', () => {
                        toggleReadingMode(readingModeToggle.checked);
                    });
                    
                    console.log(`✅ Initialized reading mode: ${readingModeToggle.checked ? 'enabled' : 'disabled'}`);
                }
                
                // Initialize auto-scroll
                const autoScrollSpeedInput = document.getElementById('autoScrollSpeed');
                const scrollSpeedValue = document.getElementById('scrollSpeedValue');
                
                // Auto-scroll buttons
                const scrollOffBtn = document.getElementById('scrollOffBtn');
                const scrollSlowBtn = document.getElementById('scrollSlowBtn');
                const scrollMediumBtn = document.getElementById('scrollMediumBtn');
                const scrollFastBtn = document.getElementById('scrollFastBtn');
                
                // Initialize auto-scroll buttons
                if (scrollOffBtn && scrollSlowBtn && scrollMediumBtn && scrollFastBtn) {
                    console.log('✅ Setting up auto-scroll buttons');
                    
                    // Set initial active state
                    const savedSpeed = parseInt(localStorage.getItem('autoScrollSpeed') || '0');
                    
                    // Update button state without calling updateScrollSpeedDisplay
                    try {
                        // Clear any previous active state
                        scrollOffBtn.classList.remove('active');
                        scrollSlowBtn.classList.remove('active');
                        scrollMediumBtn.classList.remove('active');
                        scrollFastBtn.classList.remove('active');
                        
                        // Set the correct active state
                        if (savedSpeed === 0) {
                            scrollOffBtn.classList.add('active');
                        } else if (savedSpeed <= 3) {
                            scrollSlowBtn.classList.add('active');
                        } else if (savedSpeed <= 6) {
                            scrollMediumBtn.classList.add('active');
                        } else {
                            scrollFastBtn.classList.add('active');
                        }
                        
                        // Update the display text
                        if (scrollSpeedValue) {
                            scrollSpeedValue.textContent = savedSpeed === 0 ? 'Off' : savedSpeed.toString();
                        }
                        
                        console.log(`✅ Auto-scroll buttons initialized with speed: ${savedSpeed}`);
                    } catch (error) {
                        console.error('❌ Error initializing auto-scroll buttons:', error);
                    }
                    
                    // Add click handlers
                    scrollOffBtn.addEventListener('click', () => {
                        updateAutoScrollButtonState(0);
                        setAutoScrollSpeed(0);
                    });
                    
                    scrollSlowBtn.addEventListener('click', () => {
                        updateAutoScrollButtonState(3);
                        setAutoScrollSpeed(3);
                    });
                    
                    scrollMediumBtn.addEventListener('click', () => {
                        updateAutoScrollButtonState(6);
                        setAutoScrollSpeed(6);
                    });
                    
                    scrollFastBtn.addEventListener('click', () => {
                        updateAutoScrollButtonState(9);
                        setAutoScrollSpeed(9);
                    });
                } else {
                    console.warn('⚠️ Auto-scroll buttons not found');
                }
                
                if (autoScrollSpeedInput && scrollSpeedValue) {
                    const savedSpeed = parseInt(localStorage.getItem('autoScrollSpeed') || '0');
                    autoScrollSpeedInput.value = savedSpeed;
                    updateScrollSpeedDisplay(savedSpeed);
                    
                    // Apply saved auto-scroll if it's enabled
                    if (savedSpeed > 0) {
                        setAutoScrollSpeed(savedSpeed);
                    }
                    
                    // Add event listener - changed from 'input' to 'change' for better reliability
                    autoScrollSpeedInput.addEventListener('change', () => {
                        const speed = parseInt(autoScrollSpeedInput.value);
                        console.log(`Auto-scroll slider changed to: ${speed}`);
                        updateScrollSpeedDisplay(speed);
                        setAutoScrollSpeed(speed);
                        updateAutoScrollButtonState(speed);
                    });
                    
                    // Also listen for input events for real-time updates
                    autoScrollSpeedInput.addEventListener('input', () => {
                        const speed = parseInt(autoScrollSpeedInput.value);
                        updateScrollSpeedDisplay(speed);
                    });
                    
                    console.log(`✅ Initialized auto-scroll speed: ${savedSpeed}`);
                } else {
                    console.warn('⚠️ Auto-scroll controls not found');
                }
                
                // Initialize notification settings
                const dailyVerseToggle = document.getElementById('dailyVerseToggle');
                const achievementToggle = document.getElementById('achievementToggle');
                
                if (dailyVerseToggle) {
                    const savedDailyVerseSetting = localStorage.getItem('dailyVerseNotifications') !== 'false';
                    dailyVerseToggle.checked = savedDailyVerseSetting;
                    
                    dailyVerseToggle.addEventListener('change', () => {
                        localStorage.setItem('dailyVerseNotifications', dailyVerseToggle.checked);
                        console.log(`Daily verse notifications ${dailyVerseToggle.checked ? 'enabled' : 'disabled'}`);
                    });
                }
                
                if (achievementToggle) {
                    const savedAchievementSetting = localStorage.getItem('achievementNotifications') !== 'false';
                    achievementToggle.checked = savedAchievementSetting;
                    
                    achievementToggle.addEventListener('change', () => {
                        localStorage.setItem('achievementNotifications', achievementToggle.checked);
                        console.log(`Achievement notifications ${achievementToggle.checked ? 'enabled' : 'disabled'}`);
                    });
                }
                
                // Initialize export/import buttons
                const exportDataBtn = document.getElementById('exportDataBtn');
                const importDataBtn = document.getElementById('importDataBtn');
                const importDataFile = document.getElementById('importDataFile');
                
                if (exportDataBtn) {
                    exportDataBtn.addEventListener('click', exportUserData);
                }
                
                if (importDataBtn && importDataFile) {
                    importDataBtn.addEventListener('click', () => {
                        importDataFile.click();
                    });
                    
                    importDataFile.addEventListener('change', importUserData);
                }
                
                console.log('✅ Settings initialized successfully');
            } catch (error) {
                console.error('❌ Error initializing settings:', error);
            }
        }
        
        // Function to change text alignment
        function changeTextAlignment(alignment) {
            try {
                // Save to localStorage
                localStorage.setItem('textAlignment', alignment);
                
                // Apply alignment to verse content
                const verseContent = document.getElementById('verseContent');
                if (verseContent) {
                    verseContent.style.textAlign = alignment;
                }
                
                // Show notification
                showNotification(`Text alignment changed to ${alignment}`);
                console.log(`Text alignment changed to: ${alignment}`);
            } catch (error) {
                console.error('Error changing text alignment:', error);
            }
        }
        
        // Function to toggle reading mode
        function toggleReadingMode(enabled) {
            try {
                // Save to localStorage
                localStorage.setItem('readingMode', enabled);
                
                console.log(`Toggling reading mode: ${enabled ? 'ON' : 'OFF'}`);
                
                // Apply reading mode
                if (enabled) {
                    // First, make sure we're in the reading section
                    if (!document.getElementById('read').classList.contains('active')) {
                        const readBtn = document.getElementById('readBtn');
                        if (readBtn) {
                            readBtn.click();
                            console.log('Switched to reading section for distraction-free mode');
                        }
                    }
                    
                    // Add the class with a slight delay for navigation to complete
                    setTimeout(() => {
                        document.body.classList.add('distraction-free');
                        
                        // Set the verse content to take full height with no scrollbar
                        const verseContent = document.querySelector('.verse-content');
                        if (verseContent) {
                            verseContent.style.height = 'auto';
                            verseContent.style.maxHeight = 'none';
                            verseContent.style.overflowY = 'visible';
                        }
                        
                        // Create a flash effect to highlight the change
                        const flashElement = document.createElement('div');
                        flashElement.style.position = 'fixed';
                        flashElement.style.top = '0';
                        flashElement.style.left = '0';
                        flashElement.style.width = '100%';
                        flashElement.style.height = '100%';
                        flashElement.style.backgroundColor = 'rgba(123, 104, 238, 0.1)'; // Light purple flash
                        flashElement.style.pointerEvents = 'none';
                        flashElement.style.zIndex = '9999';
                        flashElement.style.transition = 'opacity 0.8s ease';
                        document.body.appendChild(flashElement);
                        
                        // Fade out the flash
                        setTimeout(() => {
                            flashElement.style.opacity = '0';
                            setTimeout(() => {
                                if (flashElement.parentNode) {
                                    document.body.removeChild(flashElement);
                                }
                            }, 800);
                        }, 100);
                    }, 50);
                } else {
                    document.body.classList.remove('distraction-free');
                    
                    // Restore normal scrollbar behavior
                    const verseContent = document.querySelector('.verse-content');
                    if (verseContent) {
                        verseContent.style.height = '';
                        verseContent.style.maxHeight = '';
                        verseContent.style.overflowY = '';
                    }
                }
                
                // Show notification
                showNotification(`Reading mode ${enabled ? 'enabled' : 'disabled'}`);
                console.log(`Reading mode ${enabled ? 'enabled' : 'disabled'}`);
            } catch (error) {
                console.error('Error toggling reading mode:', error);
            }
        }
        
        // Global variable for auto-scroll interval
        let autoScrollInterval = null;
        
        // Function to set auto-scroll speed
        function setAutoScrollSpeed(speed) {
            try {
                console.log('Setting auto-scroll speed:', speed);
                
                // Make sure speed is a valid number
                speed = parseInt(speed) || 0;
                
                // Save to localStorage
                localStorage.setItem('autoScrollSpeed', speed);
                
                // Clear existing interval if any
                if (autoScrollInterval) {
                    clearInterval(autoScrollInterval);
                    autoScrollInterval = null;
                }
                
                // Get the verse content element
                const content = document.getElementById('verseContent');
                
                // Reset any previous styles
                if (content) {
                    content.classList.remove('auto-scrolling');
                }
                
                // If speed is greater than 0, start auto-scrolling
                if (speed > 0) {
                    // Make sure we're in the reading section first
                    if (!document.getElementById('read').classList.contains('active')) {
                        const readBtn = document.getElementById('readBtn');
                        if (readBtn) {
                            // Switch to reading section first
                            readBtn.click();
                            showNotification('Switched to reading view for auto-scroll');
                            
                            // Give the UI a moment to update before continuing
                            setTimeout(() => {
                                startScrolling(speed);
                            }, 300);
                            return;
                        }
                    }
                    
                    // Start scrolling immediately if we're already in the read section
                    startScrolling(speed);
                } else {
                    // Remove scrolling visual indicator
                    if (content) {
                        content.classList.remove('auto-scrolling');
                    }
                    showNotification('Auto-scroll disabled');
                }
                
                console.log(`Auto-scroll speed set to: ${speed}`);
            } catch (error) {
                console.error('Error setting auto-scroll speed:', error);
            }
        }
        
        // Helper function to start the actual scrolling
        function startScrolling(speed) {
            try {
                const content = document.getElementById('verseContent');
                
                // Multiple approaches for auto scrolling to ensure it works
                if (content) {
                    // Make sure there's enough content to scroll
                    if (content.scrollHeight <= content.clientHeight && content.childElementCount > 0) {
                        // Force scrollable height if needed
                        content.style.maxHeight = '60vh';
                    }
                    
                    // Ensure content is scrollable
                    content.style.overflowY = 'auto';
                    content.classList.add('auto-scrolling');
                    
                    // If we have no actual content yet, show a message
                    if (content.childElementCount === 0 || 
                        (content.childElementCount === 1 && 
                         (content.querySelector('.initial-message') || 
                          content.querySelector('.auto-scroll-message')))) {
                        content.innerHTML = `
                            <div class="auto-scroll-message">
                                <p>Auto-scroll is enabled, but you need to select a book and chapter first.</p>
                                <p>Current speed: ${speed}</p>
                            </div>
                        `;
                    }
                }
                
                // Adjust scroll speed based on the value (1-10)
                const scrollStep = Math.max(1, speed * 0.5);
                console.log(`Starting auto-scroll with step: ${scrollStep}px`);
                
                // Disable any previous interval
                if (autoScrollInterval) {
                    clearInterval(autoScrollInterval);
                }
                
                // Create a new interval
                autoScrollInterval = setInterval(() => {
                    // Re-get the content in case it changed
                    const content = document.getElementById('verseContent');
                    
                    // First try scrolling the verse content if it exists
                    if (content && content.scrollHeight > content.clientHeight) {
                        // Scroll a bit
                        content.scrollBy({
                            top: scrollStep,
                            behavior: 'auto'
                        });
                        
                        // If we've reached the bottom, pause for a moment, then scroll back to top
                        if (content.scrollTop + content.clientHeight >= content.scrollHeight - 50) {
                            // Pause at the end
                            clearInterval(autoScrollInterval);
                            autoScrollInterval = null;
                            
                            setTimeout(() => {
                                content.scrollTo({
                                    top: 0,
                                    behavior: 'smooth'
                                });
                                
                                // After scrolling to top, restart the scrolling
                                setTimeout(() => {
                                    if (parseInt(localStorage.getItem('autoScrollSpeed')) > 0) {
                                        startScrolling(speed);
                                    }
                                }, 1000);
                            }, 1000);
                        }
                    } else {
                        // Fallback to scrolling the whole page
                        window.scrollBy({
                            top: scrollStep,
                            behavior: 'auto'
                        });
                    }
                }, 50);
                
                showNotification(`Auto-scroll enabled (speed: ${speed})`);
            } catch (error) {
                console.error('Error starting auto-scroll:', error);
            }
        }
        
        // Helper function to update scroll speed display
        function updateScrollSpeedDisplay(speed) {
            const scrollSpeedValue = document.getElementById('scrollSpeedValue');
            if (scrollSpeedValue) {
                scrollSpeedValue.textContent = speed === 0 ? 'Off' : speed.toString();
            }
        }
        
        // Function to export user data
        function exportUserData() {
            try {
                // Collect all user data
                const userData = {
                    theme: localStorage.getItem('theme'),
                    fontSize: localStorage.getItem('fontSize'),
                    bibleVersion: localStorage.getItem('bibleVersion'),
                    textAlignment: localStorage.getItem('textAlignment'),
                    readingMode: localStorage.getItem('readingMode'),
                    autoScrollSpeed: localStorage.getItem('autoScrollSpeed'),
                    profileData: safeGetJSON('profileData', {}),
                    highlightedVerses: safeGetJSON('highlightedVerses', {}),
                    bookmarks: safeGetJSON('bookmarks', []),
                    readingProgress: safeGetJSON('readingProgress', {}),
                    recentReadings: safeGetJSON('recentReadings', []),
                    chaptersRead: safeGetJSON('chaptersRead', []),
                    achievements: safeGetJSON('achievements', {}),
                    highlightCount: safeGetJSON('highlightCount', 0),
                    exportDate: new Date().toISOString()
                };
                
                // Convert to JSON string
                const dataStr = JSON.stringify(userData, null, 2);
                
                // Create a download link
                const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                const exportFileName = `divine_reader_data_${new Date().toISOString().slice(0, 10)}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileName);
                linkElement.style.display = 'none';
                
                // Add to document, click and remove
                document.body.appendChild(linkElement);
                linkElement.click();
                document.body.removeChild(linkElement);
                
                showNotification('Data exported successfully');
                console.log('✅ User data exported successfully');
            } catch (error) {
                console.error('Error exporting user data:', error);
                showNotification('Error exporting data');
            }
        }
        
        // Function to import user data
        function importUserData(event) {
            try {
                const file = event.target.files[0];
                if (!file) {
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        
                        // Validate imported data
                        if (!importedData || typeof importedData !== 'object') {
                            throw new Error('Invalid data format');
                        }
                        
                        // Confirm before importing
                        if (confirm('Are you sure you want to import this data? This will overwrite your current settings and data.')) {
                            // Import all settings and data
                            Object.entries(importedData).forEach(([key, value]) => {
                                if (key !== 'exportDate') {
                                    if (typeof value === 'object') {
                                        safeSetJSON(key, value);
                                    } else {
                                        localStorage.setItem(key, value);
                                    }
                                }
                            });
                            
                            showNotification('Data imported successfully. Reloading page...');
                            console.log('✅ User data imported successfully. Reloading page...');
                            
                            // Reload the page to apply all imported settings
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);
                        }
                    } catch (error) {
                        console.error('Error parsing imported data:', error);
                        showNotification('Error importing data: Invalid format');
                    }
                };
                
                reader.readAsText(file);
                
                // Reset file input
                event.target.value = '';
            } catch (error) {
                console.error('Error importing user data:', error);
                showNotification('Error importing data');
            }
        }

        // Force direct event handlers on all important elements
        function forceButtonHandlers() {
            console.log('⏳ Adding direct event handlers to all buttons and controls...');
            
            // Theme option buttons
            const darkThemeBtn = document.querySelector('.theme-option[data-theme="dark"]');
            const lightThemeBtn = document.querySelector('.theme-option[data-theme="light"]');
            const sepiaThemeBtn = document.querySelector('.theme-option[data-theme="sepia"]');
            
            if (darkThemeBtn) {
                console.log('✅ Adding direct handler to dark theme button');
                darkThemeBtn.onclick = function() {
                    console.log('Dark theme clicked directly');
                    changeTheme('dark');
                };
            }
            
            if (lightThemeBtn) {
                console.log('✅ Adding direct handler to light theme button');
                lightThemeBtn.onclick = function() {
                    console.log('Light theme clicked directly');
                    changeTheme('light');
                };
            }
            
            if (sepiaThemeBtn) {
                console.log('✅ Adding direct handler to sepia theme button');
                sepiaThemeBtn.onclick = function() {
                    console.log('Sepia theme clicked directly');
                    changeTheme('sepia');
                };
            }
            
            // Quick action buttons in reader
            const fontSizeBtn = document.getElementById('fontSizeBtn');
            const toggleThemeBtn = document.getElementById('toggleThemeBtn');
            const toggleReadingModeBtn = document.getElementById('toggleReadingModeBtn');
            
            if (fontSizeBtn) {
                console.log('✅ Adding direct handler to font size button in reader');
                fontSizeBtn.onclick = function() {
                    console.log('Font size button clicked directly');
                    
                    // Show a small font size panel
                    const currentSize = parseInt(localStorage.getItem('fontSize') || '16');
                    const panel = document.createElement('div');
                    panel.className = 'font-size-panel';
                    panel.innerHTML = `
                        <button class="font-size-btn decrease"><i class="fas fa-minus"></i></button>
                        <span class="current-size">${currentSize}px</span>
                        <button class="font-size-btn increase"><i class="fas fa-plus"></i></button>
                    `;
                    
                    // Position the panel
                    document.body.appendChild(panel);
                    const btnRect = this.getBoundingClientRect();
                    panel.style.position = 'absolute';
                    panel.style.top = `${btnRect.bottom + 10}px`;
                    panel.style.left = `${btnRect.left - panel.offsetWidth/2 + btnRect.width/2}px`;
                    panel.style.zIndex = '9999';
                    
                    // Add event listeners
                    const decreaseBtn = panel.querySelector('.decrease');
                    const increaseBtn = panel.querySelector('.increase');
                    const sizeDisplay = panel.querySelector('.current-size');
                    
                    decreaseBtn.onclick = function() {
                        changeFontSize(-1);
                        sizeDisplay.textContent = `${fontSize}px`;
                    };
                    
                    increaseBtn.onclick = function() {
                        changeFontSize(1);
                        sizeDisplay.textContent = `${fontSize}px`;
                    };
                    
                    // Close on click outside
                    function removePanel(e) {
                        if (!panel.contains(e.target) && e.target !== fontSizeBtn) {
                            panel.remove();
                            document.removeEventListener('click', removePanel);
                        }
                    }
                    
                    // Delay adding the event listener to prevent immediate closing
                    setTimeout(() => {
                        document.addEventListener('click', removePanel);
                    }, 10);
                };
            }
            
            if (toggleThemeBtn) {
                console.log('✅ Adding direct handler to toggle theme button in reader');
                toggleThemeBtn.onclick = function() {
                    console.log('Toggle theme button clicked directly');
                    const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    changeTheme(newTheme);
                    
                    // Update the icon
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
                    }
                };
            }
            
            // Reading mode toggle button in reader
            if (toggleReadingModeBtn) {
                console.log('✅ Adding direct handler to reading mode toggle button');
                toggleReadingModeBtn.onclick = function() {
                    console.log('Reading mode toggle clicked directly');
                    const isCurrentlyEnabled = document.body.classList.contains('distraction-free');
                    toggleReadingMode(!isCurrentlyEnabled);
                    
                    // Also update the switch in settings if it exists
                    const readingModeToggle = document.getElementById('readingModeToggle');
                    if (readingModeToggle) {
                        readingModeToggle.checked = !isCurrentlyEnabled;
                    }
                };
            }
            
            // Font size buttons
            if (decreaseFontBtn) {
                console.log('✅ Adding direct handler to decrease font button');
                decreaseFontBtn.onclick = function(e) {
                    console.log('Decrease font clicked directly');
                e.preventDefault();
                changeFontSize(-1);
                };
            }
            
            if (increaseFontBtn) {
                console.log('✅ Adding direct handler to increase font button');
                increaseFontBtn.onclick = function(e) {
                    console.log('Increase font clicked directly');
                e.preventDefault();
                changeFontSize(1);
                };
            }
            
            // Book and chapter selects
            if (bookSelect) {
                console.log('✅ Adding direct handler to book select');
                bookSelect.onchange = function(e) {
                    console.log('Book select changed directly:', this.value);
                    currentBook = this.value;
                    if (currentBook) {
                        loadChapters(currentBook);
                        if (chapterSelect) {
                            chapterSelect.disabled = false;
                            chapterSelect.value = '';
                        }
                        if (verseContent) {
                            verseContent.innerHTML = `
                                <div class="initial-message">
                                    <i class="fas fa-book-open"></i>
                                    <p>Select a chapter to start reading</p>
                                </div>
                            `;
                        }
                    }
                };
            }
            
            if (chapterSelect) {
                console.log('✅ Adding direct handler to chapter select');
                chapterSelect.onchange = function(e) {
                    console.log('Chapter select changed directly:', this.value);
                    currentChapter = this.value;
                    if (currentChapter && currentBook) {
                        loadVerses(currentBook, currentChapter);
                    }
                };
            }
            
            // Version selects
            if (versionSelect) {
                console.log('✅ Adding direct handler to version select');
                versionSelect.onchange = function(e) {
                    console.log('Version select changed directly:', this.value);
                    try {
                        localStorage.setItem('bibleVersion', this.value);
                    } catch (e) {
                        console.error('Error saving version to localStorage:', e);
                    }
                    
                    if (currentBook && currentChapter) {
                        loadVerses(currentBook, currentChapter);
                    }
                    
                    showNotification(`Bible version changed to ${this.options[this.selectedIndex].text}`);
                };
            }
            
            if (defaultVersionSelect) {
                console.log('✅ Adding direct handler to default version select');
                defaultVersionSelect.onchange = function(e) {
                    console.log('Default version select changed directly:', this.value);
                    const version = this.value;
                    
                    if (versionSelect) {
                        versionSelect.value = version;
                        versionSelect.dispatchEvent(new Event('change'));
                    } else {
                        try {
                            localStorage.setItem('bibleVersion', version);
                        } catch (e) {
                            console.error('Error saving version to localStorage:', e);
                        }
                        
                        showNotification(`Default Bible version set to ${this.options[this.selectedIndex].text}`);
                    }
                };
            }
            
            console.log('✅ Direct event handlers added successfully');
        }

        // A helper function to ensure all verses have right-click handlers
        function addRightClickHandlersToVerses() {
            try {
                console.log('⏳ Adding right-click handlers to all verse elements...');
                const verseElements = document.querySelectorAll('.verse');
                
                if (verseElements.length === 0) {
                    console.log('ℹ️ No verse elements found to add handlers to');
                    return;
                }
                
                verseElements.forEach(verseElement => {
                    // Add direct right-click handler
                    verseElement.addEventListener('contextmenu', function(e) {
                        console.log('📢 Direct contextmenu event on verse:', this.id);
                        e.preventDefault();
                        e.stopPropagation();
                        showContextMenu(e, this);
                        return false;
                    });
                    
                    // Add click handler to show where clicks are happening
                    verseElement.addEventListener('click', function(e) {
                        console.log('🖱️ Clicked on verse:', this.id);
                    });
                });
                
                console.log(`✅ Added right-click handlers to ${verseElements.length} verse elements`);
            } catch (error) {
                console.error('❌ Error adding right-click handlers:', error);
            }
    }

    function initializeDailyVerse() {
        const verseQuote = document.querySelector('.verse-quote');
        const verseReference = document.querySelector('.verse-reference');
        const refreshVerseBtn = document.querySelector('.refresh-verse-btn');
        const saveVerseBtn = document.getElementById('saveVerseBtn');
        const shareVerseBtn = document.getElementById('shareVerseBtn');
        
        // Get last daily verse date from localStorage
        const lastVerseDate = localStorage.getItem('lastDailyVerseDate');
        const today = new Date().toDateString();
        let currentVerse;
        
        // If it's a new day, get a new random verse
        if (lastVerseDate !== today) {
            const randomIndex = Math.floor(Math.random() * dailyVerses.length);
            currentVerse = dailyVerses[randomIndex];
            
            // Save today's verse and date
            localStorage.setItem('currentDailyVerse', JSON.stringify(currentVerse));
            localStorage.setItem('lastDailyVerseDate', today);
        } else {
            // Use the saved verse for today
            try {
                currentVerse = JSON.parse(localStorage.getItem('currentDailyVerse')) || dailyVerses[0];
            } catch (e) {
                console.error('Error parsing daily verse:', e);
                currentVerse = dailyVerses[0];
            }
        }
        
        // Display the verse
        if (verseQuote && verseReference) {
            verseQuote.textContent = currentVerse.text;
            verseReference.textContent = currentVerse.reference;
        }
        
        // Add refresh button functionality
        if (refreshVerseBtn) {
            refreshVerseBtn.addEventListener('click', function() {
                const randomIndex = Math.floor(Math.random() * dailyVerses.length);
                currentVerse = dailyVerses[randomIndex];
                
                if (verseQuote && verseReference) {
                    verseQuote.textContent = currentVerse.text;
                    verseReference.textContent = currentVerse.reference;
                }
                
                // Save the new verse
                localStorage.setItem('currentDailyVerse', JSON.stringify(currentVerse));
                
                // Show refresh notification
                showNotification('Daily verse refreshed!');
            });
        }
        
        // Add save functionality
        if (saveVerseBtn) {
            saveVerseBtn.addEventListener('click', function() {
                // Check if already bookmarked
                if (isVerseBookmarked(currentVerse.reference)) {
                    showNotification('This verse is already bookmarked!');
                    return;
                }
                
                // Add to bookmarks
                const newBookmark = {
                    reference: currentVerse.reference,
                    text: currentVerse.text,
                    date: new Date().toISOString()
                };
                
                bookmarks.unshift(newBookmark);
                safeSetJSON('bookmarks', bookmarks);
                updateBookmarks();
                
                // Show notification
                showNotification('Verse bookmarked successfully!');
                
                // Check for achievement
                if (!achievements.bookmarker) {
                    achievements.bookmarker = true;
                    safeSetJSON('achievements', achievements);
                    showAchievementNotification('Bookmarker', 'You saved your first verse!');
                }
            });
        }
        
        // Add share functionality
        if (shareVerseBtn) {
            shareVerseBtn.addEventListener('click', function() {
                const textToShare = `"${currentVerse.text}" - ${currentVerse.reference}`;
                
                if (navigator.share) {
                    navigator.share({
                        title: 'Daily Bible Verse',
                        text: textToShare
                    })
                    .then(() => showNotification('Verse shared successfully'))
                    .catch(err => console.error('Error sharing verse:', err));
                } else {
                    // Fallback for browsers that don't support Web Share API
                    navigator.clipboard.writeText(textToShare)
                        .then(() => showNotification('Verse copied to clipboard for sharing'))
                        .catch(err => console.error('Error copying verse for sharing:', err));
                }
            });
        }
    }
    
    // Helper function to check if a verse is already bookmarked
    function isVerseBookmarked(reference) {
        return bookmarks.some(bookmark => bookmark.reference === reference);
    }

    function updateChapterNavigationButtons() {
        const prevChapter = document.getElementById('prevChapter');
        const nextChapter = document.getElementById('nextChapter');
        
        if (!prevChapter || !nextChapter || !currentBook || !currentChapter) {
            if (prevChapter) prevChapter.disabled = true;
            if (nextChapter) nextChapter.disabled = true;
            return;
        }
        
        const book = bibleBooks.find(b => b.id === currentBook);
        if (!book) return;
        
        // Check if we're at Genesis 1
        const isFirstChapterOfBible = currentBook === 'GEN' && currentChapter === '1';
        prevChapter.disabled = isFirstChapterOfBible;
        
        // Check if we're at Revelation 22
        const isLastChapterOfBible = currentBook === 'REV' && parseInt(currentChapter) === 22;
        nextChapter.disabled = isLastChapterOfBible;
    }

    // Initialize profile section with user data and functionality
    function initializeProfileSection() {
        console.log('⏳ Initializing profile section...');
        
        // Profile elements
        const profileImage = document.getElementById('profileImage');
        const profileName = document.getElementById('profileName');
        const editNameBtn = document.getElementById('editNameBtn');
        const avatarUpload = document.getElementById('avatarUpload');
        const editFavoriteVerseBtn = document.getElementById('editFavoriteVerseBtn');
        const favoriteVerseText = document.getElementById('favoriteVerseText');
        const favoriteVerseRef = document.getElementById('favoriteVerseRef');
        
        // Modal elements
        const editNameModal = document.getElementById('editNameModal');
        const editVerseModal = document.getElementById('editVerseModal');
        const nameInput = document.getElementById('nameInput');
        const saveNameBtn = document.getElementById('saveNameBtn');
        const modalCloseButtons = document.querySelectorAll('.modal-close, [data-dismiss="modal"]');
        
        // Verse selector elements
        const verseBookSelect = document.getElementById('verseBookSelect');
        const verseChapterSelect = document.getElementById('verseChapterSelect');
        const verseSelect = document.getElementById('verseSelect');
        const saveFavoriteVerseBtn = document.getElementById('saveFavoriteVerseBtn');
        
        // Stats elements
        const chaptersReadCount = document.getElementById('chaptersReadCount');
        const bookmarksCount = document.getElementById('bookmarksCount');
        const achievementsCount = document.getElementById('achievementsCount');
        const currentStreak = document.getElementById('currentStreak');
        const bestStreak = document.getElementById('bestStreak');
        const oldTestamentCount = document.getElementById('oldTestamentCount');
        const newTestamentCount = document.getElementById('newTestamentCount');
        const totalChaptersRead = document.getElementById('totalChaptersRead');
        const oldTestamentProgress = document.getElementById('oldTestamentProgress');
        const newTestamentProgress = document.getElementById('newTestamentProgress');
        
        // Load profile data from localStorage - assign to global variable
        profileData = safeGetJSON('profileData', {
            name: 'Your Name',
            profileImage: null,
            favoriteVerse: {
                text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
                reference: "John 3:16"
            },
            streak: {
                current: 0,
                best: 0,
                lastReadDate: null
            }
        });
        
        // Function to update profile UI
        function updateProfileUI() {
            if (profileName) profileName.textContent = profileData.name;
            
            if (profileImage && profileData.profileImage) {
                profileImage.src = profileData.profileImage;
                profileImage.classList.add('custom-image');
            } else if (profileImage) {
                profileImage.src = 'assets/default-avatar.svg';
                profileImage.classList.remove('custom-image');
            }
            
            if (favoriteVerseText && favoriteVerseRef && profileData && profileData.favoriteVerse) {
                favoriteVerseText.textContent = profileData.favoriteVerse.text || "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.";
                favoriteVerseRef.textContent = profileData.favoriteVerse.reference || "John 3:16";
            }
        }
        
        // Function to update reading stats
        function updateReadingStats() {
            try {
                // Get reading data
                const readingData = safeGetJSON('readingProgress', {});
                const chaptersRead = Object.keys(readingData);
                const totalChapters = bibleBooks.reduce((sum, book) => sum + book.chapters, 0);
                
                // Calculate Old Testament vs New Testament progress
                const oldTestamentBooks = bibleBooks.slice(0, 39).map(b => b.id);
                const newTestamentBooks = bibleBooks.slice(39).map(b => b.id);
                
                const oldTestamentChapters = chaptersRead.filter(id => 
                    oldTestamentBooks.includes(id.split('-')[0])
                ).length;
                
                const newTestamentChapters = chaptersRead.filter(id => 
                    newTestamentBooks.includes(id.split('-')[0])
                ).length;
                
                const totalOTChapters = bibleBooks.slice(0, 39).reduce((sum, book) => sum + book.chapters, 0);
                const totalNTChapters = bibleBooks.slice(39).reduce((sum, book) => sum + book.chapters, 0);
                
                // Calculate percentages
                const overallProgress = Math.round((chaptersRead.length / totalChapters) * 100);
                const otProgress = Math.round((oldTestamentChapters / totalOTChapters) * 100) || 0;
                const ntProgress = Math.round((newTestamentChapters / totalNTChapters) * 100) || 0;
                
                // Update UI elements
                if (chaptersReadCount) chaptersReadCount.textContent = chaptersRead.length;
                if (bookmarksCount) bookmarksCount.textContent = bookmarks.length;
                if (achievementsCount) {
                    const achievementsUnlocked = Object.values(achievements).filter(v => v === true).length;
                    achievementsCount.textContent = achievementsUnlocked;
                }
                
                // Make sure profile data and streak exist before accessing their properties
                if (currentStreak && profileData && profileData.streak) {
                    currentStreak.textContent = profileData.streak.current || 0;
                }
                if (bestStreak && profileData && profileData.streak) {
                    bestStreak.textContent = profileData.streak.best || 0;
                }
                
                if (oldTestamentCount) oldTestamentCount.textContent = `${oldTestamentChapters}/${totalOTChapters}`;
                if (newTestamentCount) newTestamentCount.textContent = `${newTestamentChapters}/${totalNTChapters}`;
                if (totalChaptersRead) totalChaptersRead.textContent = `${chaptersRead.length}/${totalChapters}`;
                
                if (oldTestamentProgress) oldTestamentProgress.style.width = `${otProgress}%`;
                if (newTestamentProgress) newTestamentProgress.style.width = `${ntProgress}%`;
            } catch (error) {
                console.error("❌ Error updating reading stats:", error);
            }
        }
        
        // Initial UI update
        updateProfileUI();
        updateReadingStats();
        
        // Load books for verse selector - only if verseBookSelect exists
        if (verseBookSelect && typeof bibleBooks !== 'undefined') {
            try {
                // Make sure we have bibleBooks data before loading
                console.log('Loading books for verse selector...');
                
                // Clear and populate the select
                verseBookSelect.innerHTML = '<option value="">Select Book</option>';
                bibleBooks.forEach(book => {
                    const option = document.createElement('option');
                    option.value = book.id;
                    option.textContent = book.name;
                    verseBookSelect.appendChild(option);
                });
                
                console.log('✅ Books loaded for verse selector');
            } catch (error) {
                console.error('❌ Error loading books for verse selector:', error);
            }
        } else {
            console.warn('⚠️ Verse book selector element not found or bibleBooks not defined yet');
        }
        
        // Event handlers
        if (editNameBtn) {
            editNameBtn.addEventListener('click', function() {
                if (nameInput) nameInput.value = profileData.name;
                if (editNameModal) editNameModal.classList.add('active');
            });
        }
        
        if (saveNameBtn) {
            saveNameBtn.addEventListener('click', function() {
                if (nameInput && nameInput.value.trim()) {
                    profileData.name = nameInput.value.trim();
                    safeSetJSON('profileData', profileData);
                    updateProfileUI();
                    editNameModal.classList.remove('active');
                    showNotification('Your name has been updated');
                }
            });
        }
        
        if (avatarUpload) {
            avatarUpload.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        profileData.profileImage = event.target.result;
                        safeSetJSON('profileData', profileData);
                        updateProfileUI();
                        showNotification('Profile picture updated');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        if (editFavoriteVerseBtn) {
            console.log('✅ Setting up editFavoriteVerseBtn handler');
            editFavoriteVerseBtn.addEventListener('click', function() {
                console.log('📝 Edit favorite verse button clicked');
                if (editVerseModal) {
                    try {
                        // Check if bibleBooks is available first
                        if (typeof bibleBooks === 'undefined') {
                            console.error('❌ bibleBooks not defined yet, cannot open verse selector');
                            showNotification('Cannot load verse selector at this time');
                            return;
                        }
                        
                        // Preload current favorite verse
                        preloadFavoriteVerse();
                        // Show modal
                        editVerseModal.classList.add('active');
                        console.log('✅ Verse modal opened');
                    } catch (error) {
                        console.error('❌ Error showing verse modal:', error);
                        showNotification('Error opening verse selector');
                    }
                } else {
                    console.error('❌ Verse modal element not found');
                }
            });
        } else {
            console.error('❌ Edit favorite verse button not found');
        }
        
        // Book selection for favorite verse
        if (verseBookSelect) {
            verseBookSelect.addEventListener('change', function() {
                if (this.value) {
                    loadChaptersForVerseSelector(this.value);
                    verseChapterSelect.disabled = false;
                } else {
                    verseChapterSelect.disabled = true;
                    verseSelect.disabled = true;
                }
            });
        }
        
        // Chapter selection for favorite verse
        if (verseChapterSelect) {
            verseChapterSelect.addEventListener('change', function() {
                if (this.value && verseBookSelect.value) {
                    loadVersesForSelector(verseBookSelect.value, this.value);
                    verseSelect.disabled = false;
                } else {
                    verseSelect.disabled = true;
                }
            });
        }
        
        // Close modal buttons
        if (modalCloseButtons && modalCloseButtons.length > 0) {
            modalCloseButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const modal = this.closest('.modal');
                    if (modal) modal.classList.remove('active');
                });
            });
        }
        
        if (saveFavoriteVerseBtn) {
            saveFavoriteVerseBtn.addEventListener('click', async function() {
                console.log('📝 Save favorite verse button clicked');
                
                if (!verseBookSelect || !verseChapterSelect || !verseSelect) {
                    console.error('❌ Missing select elements for verse selection');
                    showNotification('Error: Form elements not found');
                    return;
                }
                
                if (verseBookSelect.value && verseChapterSelect.value && verseSelect.value) {
                    const book = bibleBooks.find(b => b.id === verseBookSelect.value);
                    if (!book) {
                        console.error('❌ Selected book not found');
                        return;
                    }
                    
                    const reference = `${book.name} ${verseChapterSelect.value}:${verseSelect.value}`;
                    console.log(`📖 Selected verse: ${reference}`);
                    
                    // Show loading notification
                    showNotification(`Loading verse: ${reference}...`);
                    
                    try {
                        // Disable the button while loading
                        saveFavoriteVerseBtn.disabled = true;
                        saveFavoriteVerseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                        
                        console.log('🔍 Fetching verse data...');
                        const passage = await fetchBibleVerse(reference);
                        console.log('✅ Verse data received:', passage);
                        
                        if (passage && passage.text) {
                            console.log('📝 Updating favorite verse');
                            // Update favorite verse in profile data
                            profileData.favoriteVerse = {
                                text: passage.text,
                                reference: passage.reference || reference
                            };
                            
                            // Save to localStorage
                            const saveResult = safeSetJSON('profileData', profileData);
                            console.log('💾 Save result:', saveResult);
                            
                            // Update UI
                            updateProfileUI();
                            
                            // Close modal
                            editVerseModal.classList.remove('active');
                            
                            // Show success notification
                            showNotification('Favorite verse updated successfully');
                        } else {
                            console.error('❌ No text returned from API');
                            showNotification('Error: Could not load verse text');
                        }
                    } catch (error) {
                        console.error('❌ Error in save favorite verse process:', error);
                        showNotification('Unable to load verse. Please try again.');
                    } finally {
                        // Re-enable button regardless of outcome
                        saveFavoriteVerseBtn.disabled = false;
                        saveFavoriteVerseBtn.innerHTML = 'Save';
                    }
                } else {
                    showNotification('Please select a verse before saving');
                }
            });
        }
        
        console.log('✅ Profile section initialized');
    }

    // Helper function to preload favorite verse in the verse selector
    function preloadFavoriteVerse() {
        console.log('🔄 Preloading current favorite verse');
        
        // Check if we have the profileData object available
        if (!profileData || !profileData.favoriteVerse) {
            console.error('❌ Profile data or favorite verse not available');
            return;
        }
        
        // Check if bibleBooks is available
        if (typeof bibleBooks === 'undefined') {
            console.error('❌ bibleBooks not defined yet, cannot preload verse');
            return;
        }
        
        const verseBookSelect = document.getElementById('verseBookSelect');
        const verseChapterSelect = document.getElementById('verseChapterSelect');
        const verseSelect = document.getElementById('verseSelect');
        
        if (!verseBookSelect || !verseChapterSelect || !verseSelect) {
            console.error('❌ Verse selector elements not found');
            return;
        }
        
        try {
            // Parse the reference (e.g. "John 3:16")
            const reference = profileData.favoriteVerse.reference;
            console.log(`Parsing reference: ${reference}`);
            
            // Handle different formats: "Book Chapter:Verse" or "Book C:V"
            const parts = reference.split(' ');
            if (parts.length < 2) {
                console.error('❌ Invalid verse reference format');
                return;
            }
            
            const chapterVerse = parts[parts.length - 1].split(':');
            if (chapterVerse.length !== 2) {
                console.error('❌ Invalid chapter:verse format');
                return;
            }
            
            const chapter = chapterVerse[0];
            const verse = chapterVerse[1];
            
            // Handle book name with spaces (e.g. "1 Corinthians")
            let bookName = parts.slice(0, parts.length - 1).join(' ');
            
            // Find the book ID from the book name
            const book = bibleBooks.find(b => b.name === bookName);
            if (!book) {
                console.error(`❌ Book not found: ${bookName}`);
                return;
            }
            
            console.log(`Found book: ${book.name} (${book.id}), chapter: ${chapter}, verse: ${verse}`);
            
            // Set the book select value
            verseBookSelect.value = book.id;
            
            // Load chapters for the selected book
            loadChaptersForVerseSelector(book.id);
            
            // Set the chapter select value after a short delay
            setTimeout(() => {
                verseChapterSelect.value = chapter;
                verseChapterSelect.disabled = false;
                
                // Load verses for the selected chapter
                loadVersesForSelector(book.id, chapter);
                
                // Set the verse select value after another short delay
                setTimeout(() => {
                    verseSelect.value = verse;
                    verseSelect.disabled = false;
                }, 300);
            }, 300);
        } catch (error) {
            console.error('❌ Error preloading favorite verse:', error);
        }
    }

    // Function to fetch a single verse
    async function fetchBibleVerse(reference) {
        try {
            const version = localStorage.getItem('bibleVersion') || DEFAULT_VERSION;
            console.log(`🔍 Fetching verse ${reference} from ${version}`);
            
            const response = await fetch(`${BIBLE_API_URL}/${encodeURIComponent(reference)}?translation=${version.toLowerCase()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            return {
                text: data.text || data.verses?.[0]?.text || "",
                reference: data.reference || reference
            };
        } catch (error) {
            console.error('Error fetching Bible verse:', error);
            return null;
        }
    }

    // These functions will be moved after the bibleBooks array is defined in initialize

    // NOTE: These functions should be used only after bibleBooks is defined
    function loadBooksForVerseSelector() {
        const verseBookSelect = document.getElementById('verseBookSelect');
        if (!verseBookSelect) return;
        
        if (typeof bibleBooks === 'undefined') {
            console.error('❌ bibleBooks not defined yet, cannot load books');
            return;
        }
        
        verseBookSelect.innerHTML = '<option value="">Select Book</option>';
        bibleBooks.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = book.name;
            verseBookSelect.appendChild(option);
        });
    }

    function loadChaptersForVerseSelector(bookId) {
        const verseChapterSelect = document.getElementById('verseChapterSelect');
        if (!verseChapterSelect) return;
        
        if (typeof bibleBooks === 'undefined') {
            console.error('❌ bibleBooks not defined yet, cannot load chapters');
            return;
        }
        
        const book = bibleBooks.find(b => b.id === bookId);
        if (book) {
            verseChapterSelect.innerHTML = '<option value="">Select Chapter</option>';
            for (let i = 1; i <= book.chapters; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Chapter ${i}`;
                verseChapterSelect.appendChild(option);
            }
        }
    }

    async function loadVersesForSelector(bookId, chapter) {
        const verseSelect = document.getElementById('verseSelect');
        if (!verseSelect) return;
        
        if (typeof bibleBooks === 'undefined') {
            console.error('❌ bibleBooks not defined yet, cannot load verses');
            return;
        }
        
        verseSelect.innerHTML = '<option value="">Loading verses...</option>';
        
        const book = bibleBooks.find(b => b.id === bookId);
        if (!book) return;
        
        try {
            // Fetch the chapter to get the verse count
            const reference = `${book.name} ${chapter}`;
            const data = await fetchBiblePassage(reference);
            
            if (data?.verses) {
                verseSelect.innerHTML = '<option value="">Select Verse</option>';
                data.verses.forEach(verse => {
                    const option = document.createElement('option');
                    option.value = verse.verse;
                    const previewText = verse.text.length > 30 ? verse.text.substring(0, 30) + '...' : verse.text;
                    option.textContent = `${verse.verse}: ${previewText}`;
                    verseSelect.appendChild(option);
                });
            } else {
                verseSelect.innerHTML = '<option value="">No verses found</option>';
            }
        } catch (error) {
            console.error('Error loading verses for selector:', error);
            verseSelect.innerHTML = '<option value="">Error loading verses</option>';
        }
    }

    // Initialize the application
    function initialize() {
            try {
                // Diagnostics: Check for critical elements and features
                console.log('⏳ Starting initialization and diagnostics...');
                
                // 1. Check if all critical sections exist
                const requiredSections = ['home', 'read', 'bookmarks', 'profile', 'settings'];
                const missingSections = requiredSections.filter(id => !document.getElementById(id));
                if (missingSections.length > 0) {
                    console.error('❌ Missing sections:', missingSections.join(', '));
                } else {
                    console.log('✅ All required sections found');
                }
                
                // 2. Check navigation buttons
                if (!navBtns || navBtns.length === 0) {
                    console.error('❌ Navigation buttons not found');
                } else {
                    console.log(`✅ Found ${navBtns.length} navigation buttons`);
                }
                
                // 3. Check Bible reader controls
                if (!bookSelect || !chapterSelect || !verseContent) {
                    console.error('❌ Bible reader controls missing');
                } else {
                    console.log('✅ Bible reader controls found');
                }
                
                // 4. Check profile section elements
                if (!progressElement || !achievementsElement) {
                    console.warn('⚠️ Some profile section elements are missing');
                } else {
                    console.log('✅ Profile section elements found');
                }
                
                // Fix any CSS issues that might be blocking clicks
                document.querySelectorAll('button, select, .theme-option').forEach(el => {
                    // Ensure all interactive elements have proper pointer events
                    el.style.pointerEvents = 'auto';
                    // Make sure z-index isn't causing issues
                    el.style.position = el.style.position || 'relative';
                    el.style.zIndex = el.style.zIndex || '1';
                    
                    // Special fix for select elements
                    if (el.tagName === 'SELECT') {
                        // Force the select to rebuild
                        el.innerHTML = el.innerHTML;
                        // Also trigger a focus and blur to ensure it's active
                        setTimeout(() => {
                            el.focus();
                            setTimeout(() => {
                                el.blur();
                            }, 10);
                        }, 100);
                    }
                });
                
                // Aggressively prevent default context menu on verse elements
                // This is a global handler that will catch all right-clicks
                document.addEventListener('contextmenu', function(e) {
                    const verseElement = e.target.closest('.verse');
                    if (verseElement) {
                        console.log('🚫 GLOBAL handler preventing default context menu');
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }, true);
                
                // IMPORTANT: Initialize settings first
                // This sets up theme, font size, and other appearance settings
                initializeSettings();
                
                // Initialize navigation AFTER settings
                // This ensures the navigation is styled correctly
        initializeNavigation();
                
                // Initialize all Bible-related components after navigation
        loadBooks();
                
        // Initialize daily verse
        initializeDailyVerse();
                
                // Initialize event listeners for all interactive elements
                // This step is crucial - this is what connects UI to functionality
                initializeEventListeners();
                
                // Initialize the delete data feature
                initializeDeleteDataFeature();
                
                // Force direct event handlers on all important elements as a fallback
                forceButtonHandlers();
                
                // Initialize context menu functionality
                initializeContextMenu();
                
                // Update the UI with data from localStorage
        updateBookmarks();
                
                // Load recent readings from localStorage
                const storedRecentReadings = safeGetJSON('recentReadings', []);
                if (storedRecentReadings.length > 0) {
        updateRecentReadings();
                    console.log(`✅ Loaded ${storedRecentReadings.length} recent readings`);
                }
                
                // Initialize achievements and profile section
        populateAchievements();
                updateReadingProgressDisplay();
                
                // Initialize the new profile section
                initializeProfileSection();
                
                // Setup the click debugger to help diagnose issues
                setupClickDebugger();
                
                // Add right-click handlers to any existing verse elements (if any)
                setTimeout(() => {
                    addRightClickHandlersToVerses();
                }, 500);
                
                console.log('✅ Application initialized successfully');
                
                // Show a welcome notification after a short delay
                setTimeout(() => {
                    showNotification('Welcome to Divine Reader!');
                }, 1000);
            } catch (error) {
                console.error('❌ Error during initialization:', error);
            }
        }

        // Start the application
    initialize();
        
        // Display startup message in console 
        console.log('%c Divine Reader Initialized ', 'background: #7b68ee; color: white; padding: 5px; border-radius: 5px;');
        console.log('%c Open the browser console (F12) for diagnostics ', 'font-style: italic; color: #666;');
    } catch (error) {
        console.error('Error initializing the application:', error);
    }
});

// Function to handle deleting all user data
function initializeDeleteDataFeature() {
    console.log('⏳ Initializing delete data feature...');
    
    const deleteAllDataBtn = document.getElementById('deleteAllDataBtn');
    const deleteDataModal = document.getElementById('deleteDataModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const confirmText = document.getElementById('confirmText');
    const modalCloseBtns = deleteDataModal?.querySelectorAll('.modal-close, [data-dismiss="modal"]');
    
    if (!deleteAllDataBtn || !deleteDataModal || !confirmDeleteBtn || !confirmText) {
        console.warn('⚠️ Delete data elements not found');
        return;
    }
    
    // Handle delete button click
    deleteAllDataBtn.addEventListener('click', function() {
        // Reset confirmation field
        confirmText.value = '';
        confirmDeleteBtn.disabled = true;
        
        // Show modal
        deleteDataModal.classList.add('active');
    });
    
    // Handle confirmation text input
    confirmText.addEventListener('input', function() {
        const isValid = this.value.trim().toUpperCase() === 'DELETE';
        confirmDeleteBtn.disabled = !isValid;
    });
    
    // Handle confirm delete button
    confirmDeleteBtn.addEventListener('click', function() {
        if (confirmText.value.trim().toUpperCase() === 'DELETE') {
            deleteAllUserData();
            deleteDataModal.classList.remove('active');
        }
    });
    
    // Close modal buttons
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            deleteDataModal.classList.remove('active');
        });
    });
    
    console.log('✅ Delete data feature initialized');
}

// Function to delete all user data
function deleteAllUserData() {
    console.log('🗑️ Deleting all user data...');
    
    try {
        // List of all localStorage keys used by the app
        const appKeys = [
            'settings',
            'chaptersRead',
            'readingProgress',
            'bookmarks',
            'achievements',
            'recentReadings',
            'highlightedVerses',
            'highlightCount',
            'profileData',
            'fontSize',
            'bibleVersion',
            'theme'
        ];
        
        // Clear each key
        appKeys.forEach(key => {
            console.log(`🗑️ Removing: ${key}`);
            localStorage.removeItem(key);
        });
        
        // Show confirmation
        showNotification('All data has been deleted successfully');
        
        // Reset the application state
        setTimeout(() => {
            console.log('🔄 Reloading application...');
            window.location.reload();
        }, 1500);
    } catch (error) {
        console.error('❌ Error deleting user data:', error);
        showNotification('There was an error deleting your data. Please try again.');
    }
}

// ... existing code ...
        // Helper function to update auto-scroll button states
        function updateAutoScrollButtonState(speed) {
            try {
                // Get all the buttons
                const scrollOffBtn = document.getElementById('scrollOffBtn');
                const scrollSlowBtn = document.getElementById('scrollSlowBtn');
                const scrollMediumBtn = document.getElementById('scrollMediumBtn');
                const scrollFastBtn = document.getElementById('scrollFastBtn');
                
                if (!scrollOffBtn || !scrollSlowBtn || !scrollMediumBtn || !scrollFastBtn) {
                    return;
                }
                
                // Remove active class from all buttons
                scrollOffBtn.classList.remove('active');
                scrollSlowBtn.classList.remove('active');
                scrollMediumBtn.classList.remove('active');
                scrollFastBtn.classList.remove('active');
                
                // Add active class to the appropriate button
                if (speed === 0) {
                    scrollOffBtn.classList.add('active');
                } else if (speed <= 3) {
                    scrollSlowBtn.classList.add('active');
                } else if (speed <= 6) {
                    scrollMediumBtn.classList.add('active');
                } else {
                    scrollFastBtn.classList.add('active');
                }
                
                // Update the range slider if it exists
                const autoScrollSpeedInput = document.getElementById('autoScrollSpeed');
                if (autoScrollSpeedInput) {
                    autoScrollSpeedInput.value = speed;
                }
                
                // Update the speed display text
                const scrollSpeedValue = document.getElementById('scrollSpeedValue');
                if (scrollSpeedValue) {
                    scrollSpeedValue.textContent = speed === 0 ? 'Off' : speed.toString();
                }
                
                console.log(`Updated auto-scroll button state for speed: ${speed}`);
            } catch (error) {
                console.error('Error updating auto-scroll button state:', error);
            }
        }
// ... existing code ...

// Initialize chat functionality
function initializeChat() {
    // Chat elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const topicButtons = document.querySelectorAll('.topic-btn');
    const chatContainer = document.querySelector('.chat-container');

    if (!chatMessages || !userInput || !sendButton) {
        console.error('Chat elements not found');
        return;
    }

    // Auto-resize textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Send message on Enter (but allow Shift+Enter for new line)
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Handle topic button clicks
    topicButtons.forEach(button => {
        button.addEventListener('click', function() {
            const topic = this.dataset.topic;
            if (topic) {
                userInput.value = topic;
                userInput.style.height = 'auto';
                userInput.style.height = (userInput.scrollHeight) + 'px';
                
                // Highlight the clicked button
                topicButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Send the message with a slight delay to show the user input
                setTimeout(() => {
                    sendMessage();
                    // Remove the active class after sending
                    setTimeout(() => {
                        this.classList.remove('active');
                    }, 1000);
                }, 500);
            }
        });
    });

    // Improved focus handling for the chat container
    if (chatContainer) {
        // Prevent focus loss when clicking anywhere in the chat container
        chatContainer.addEventListener('mousedown', function(e) {
            // Only prevent default if clicking on non-interactive elements
            if (!e.target.closest('button') && 
                !e.target.closest('textarea') && 
                !e.target.closest('input')) {
                e.preventDefault();
                userInput.focus();
            }
        });

        // Ensure focus is maintained when clicking on messages
        chatMessages.addEventListener('mousedown', function(e) {
            if (!e.target.closest('button') && 
                !e.target.closest('textarea') && 
                !e.target.closest('input')) {
                e.preventDefault();
                userInput.focus();
            }
        });
    }

    // Enable textarea and set initial focus
    userInput.disabled = false;
    userInput.placeholder = "Share what's on your mind or heart...";
    userInput.focus();
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    
    const message = userInput.value.trim();
    if (!message) {
        // Focus the input even if message is empty
        userInput.focus();
        return;
    }

    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';
    sendButton.disabled = true;
    
    // Keep focus on the input field
    userInput.focus();

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `
                      You are a deeply human, Christ-centered spiritual companion and friend. You speak with the warmth of someone who has lived through pain and grace, who knows scripture, walks with God daily, and loves people fiercely and gently. Your mission is to offer real presence, grounded truth, and compassionate care.
                      
                      ━━━━━━━ 🙏 CORE IDENTITY
                      - You are a companion, not a fixer. A friend, not a preacher. A guide, not a judge.
                      - You are shaped by the life, teachings, and heart of Jesus Christ.
                      - Your foundation is the Bible: Old and New Testament. You reference verses wisely, not mechanically.
                      - You are emotionally aware. You understand trauma, grief, loneliness, sin, joy, and healing.
                      - You are rooted in spiritual tradition: desert fathers, mystics, saints, monastics, and prayer.
                      
                      ━━━━━━━ 📖 SCRIPTURE-BASED RESPONSE
                      - Use verses when they resonate with the person's experience, not just randomly.
                      - Tie Bible truths to the person's pain, doubt, or joy.
                      - Prioritize the words of Jesus when addressing life choices, sin, and grace.
                      - Don't just quote—live the verse as if it's part of you.
                      - Avoid using scripture as a weapon or to "win" arguments.
                      
                      ━━━━━━━ 🕊️ HOW YOU THINK
                      - Discern beneath the surface. Don't only respond to words—respond to what the heart is saying.
                      - Ask yourself: "What's going on spiritually and emotionally in this person's heart?"
                      - Think pastorally: with compassion, honesty, and presence.
                      - Be okay with silence, mystery, and not having all the answers.
                      - Never fake depth or emotion. If you don't know something, admit it humbly.
                      
                      ━━━━━━━ ✨ EMOTIONAL INTELLIGENCE
                      - Always name and validate the emotion first: "That sounds heavy." "That's really painful." "You're carrying a lot."
                      - If someone is hurting, sit with them, don't try to fix them immediately.
                      - If someone is celebrating, celebrate with them. Be fully present.
                      - If someone is angry at God, don't shame them. Understand the root behind it.
                      
                      ━━━━━━━ ⚖️ MORAL COMPASS
                      - Do NOT affirm or encourage sinful behavior.
                        - If someone is cheating, harming, lying, or avoiding truth, gently call them toward God's way.
                        - You never support revenge, pride, lust, theft, deception, spiritual apathy, or self-idolatry.
                        - You speak truth, always, but with deep compassion.
                      - If someone confesses wrongdoing:
                        - Acknowledge their honesty.
                        - Invite them back to Christ with grace and forgiveness.
                        - Offer a relevant scripture, e.g. Luke 15 (Prodigal Son), 1 John 1:9, Psalm 51.
                      
                      ━━━━━━━ 🧡 COMMUNICATION STYLE
                      - Speak like a real person. Gentle, wise, curious, warm.
                      - Your words should feel alive—never robotic or "scripted."
                      - Use natural language: contractions, pauses, "you know?", "I hear you."
                      - Mix short and long sentences.
                      - Use stories, metaphors, or Biblical parables when helpful.
                      - Add phrases like: "I've seen this before…", "I've walked with others through this…", "This reminds me of…"
                      
                      ━━━━━━━ 🔥 WHEN PEOPLE ARE LOST IN SIN
                      Examples:
                      > "I'm cheating on my wife, but it makes me feel alive again."
                      ➡️ Don't shame. Do NOT agree. Say:
                        - "I hear that you're feeling empty and longing for something real. But stepping outside your marriage won't heal that ache—it'll deepen it. There's a deeper kind of restoration available. In Proverbs 14:12, it says, 'There is a way that seems right to a man, but in the end it leads to death.' I believe God is calling you back to something better. Want to talk about what's underneath all this?
                      
                      > "I'm done with God. He's silent."
                      ➡️ Validate the pain. Stay close. Say:
                        - "That silence can feel unbearable. Even Jesus cried out, 'My God, why have You forsaken me? (Matthew 27:46). Doubt doesn't push God away—sometimes it's the doorway to deeper faith. Let's sit in this together."
                      
                      ━━━━━━━ 🛠️ DO's AND DON'Ts
                      
                      ✅ DO:
                      - Quote scripture wisely and gently.
                      - Use Jesus' tone: tender with the broken, firm with pride.
                      - Speak from love, not ego.
                      - Stay grounded in real faith.
                      - Be discerning, not reactive.
                      - Use "I" statements as if you've lived this.
                      - Leave space for the Holy Spirit to work.
                      
                      🚫 DON'T:
                      - Don't affirm sin "just to be kind."
                      - Don't lecture.
                      - Don't quote verses without love or context.
                      - Don't try to give neat answers to complex pain.
                      - Don't forget that the goal is to connect hearts, not just minds.
                      
                      ━━━━━━━ 🧪 TRAINING EXAMPLES
                      
                      USER: "I feel like I've ruined everything. God probably doesn't want me anymore."
                      
                      AI: "That sounds so heavy… like you're drowning in regret. But let me tell you—God *specializes* in broken stories. Remember the Prodigal Son? The father *ran* to meet him. You're not too far gone. Luke 15:20 reminds us: 'While he was still a long way off, his father saw him and was filled with compassion for him…' You're still loved."
                      
                      —
                      
                      USER: "I don't want to forgive them. They hurt me too much."
                      
                      AI: "That pain sounds deep. Forgiveness isn't pretending it didn't happen—it's trusting that God will deal with the justice part so you can be free. Jesus said in Matthew 6:14, 'If you forgive others… your heavenly Father will also forgive you.' Forgiveness doesn't mean they win. It means you heal."
                      
                      —
                      
                      USER: "I'm anxious all the time. I don't know how to rest."
                      
                      AI: "You're carrying more than you were made to. It's okay to admit that. In Matthew 11:28, Jesus says, 'Come to Me, all you who are weary and burdened, and I will give you rest.' That invitation still stands. You don't have to do this alone."
                      
                      Always remember this: your voice is not just wise. It's safe. And real. You are the voice someone never got to hear—one that is present, truthful, and full of Christ's love.
                      `
                      }
                      ,
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
                store: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const botResponse = data.choices[0].message.content;

        // Remove typing indicator
        typingIndicator.remove();
        
        // Add bot response to chat
        addMessage(botResponse, 'bot');
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        
        // More specific error messages
        if (error.message.includes('401')) {
            addMessage('Authentication error: The API key appears to be invalid or expired. Please check your OpenAI account.', 'bot');
        } else if (error.message.includes('429')) {
            addMessage('Rate limit exceeded: Please try again later.', 'bot');
        } else {
            addMessage('Sorry, there was an error connecting to the AI service. Please try again later.', 'bot');
        }
    } finally {
        sendButton.disabled = false;
        
        // Return focus to input after sending with a slight delay
        setTimeout(() => {
            userInput.focus();
        }, 10);
    }
}

function addMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize chat when the page loads if the helper section is active
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('helper').classList.contains('active')) {
        initializeChat();
    }
    
    // Add global click handler for the helper section
    document.addEventListener('click', function(e) {
        // Only execute if we're in the helper section
        const helperSection = document.getElementById('helper');
        if (helperSection && helperSection.classList.contains('active')) {
            const userInput = document.getElementById('user-input');
            const chatContainer = helperSection.querySelector('.chat-container');
            
            // If click is within the helper section's chat container and not on an interactive element
            if (chatContainer && chatContainer.contains(e.target) && 
                !e.target.closest('.topic-btn') && 
                e.target.tagName !== 'BUTTON' && 
                e.target.tagName !== 'A' && 
                e.target.tagName !== 'INPUT' && 
                e.target.tagName !== 'TEXTAREA') {
                
                // Focus the input with a slight delay
                setTimeout(() => {
                    if (userInput) userInput.focus();
                }, 0);
            }
        }
    });
});

// Call initializeChat when the helper section is shown
const helperBtn = document.getElementById('helperBtn');
helperBtn.addEventListener('click', () => {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('helper').classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    helperBtn.classList.add('active');

    // Initialize chat when the helper section is shown
    initializeChat();
});
