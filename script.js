/**
 * UPES Hypervision
 * Main JavaScript file handling all logic and interactions
 */

// Configuration constants
const CONFIG = {
  MAX_SELECTIONS_PER_OPTION: 20,
  THRESHOLD_AVAILABLE: 14,
  THRESHOLD_FEW_SLOTS: 15,
  OPTIONS: ['optionA', 'optionB', 'optionC'],
  OPTION_NAMES: {
    optionA: 'Problem Statement A',
    optionB: 'Problem Statement B',
    optionC: 'Problem Statement C'
  }
};

// Application state (stored in memory, synced with localStorage)
let appState = {
  currentUsername: '',
  optionCounts: {
    optionA: 0,
    optionB: 0,
    optionC: 0
  },
  userSelections: {}, // { username: optionId }
  hasUserSelected: false
};

/**
 * Initialize the application on page load
 */
function initializeApp() {
  // Load state from storage
  loadStateFromStorage();
  

  
  // Check if user already has a session and selection
  const savedUsername = getStoredUsername();
  
  if (savedUsername && appState.userSelections[savedUsername]) {
    // User has already selected, show selection screen with their choice
    appState.currentUsername = savedUsername;
    appState.hasUserSelected = true;
    showSelectionScreen();
  } else {
    // Show username entry screen
    showUsernameScreen();
  }
  
  // Setup event listeners
  setupEventListeners();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Username entry
  const enterPortalBtn = document.getElementById('enterPortalBtn');
  const usernameInput = document.getElementById('usernameInput');
  
  enterPortalBtn.addEventListener('click', (e) => {
    createRipple(e);
    handleEnterPortal();
  });
  
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleEnterPortal();
    }
  });
  
  // Option selection buttons
  const optionButtons = document.querySelectorAll('.option-select-btn');
  optionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      createRipple(e);
      const optionId = e.target.getAttribute('data-option');
      handleOptionSelection(optionId);
    });
  });
  

  
  // Add hover sound feedback (visual only)
  const allButtons = document.querySelectorAll('.btn, .option-select-btn');
  allButtons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (!btn.disabled) {
        btn.style.transition = 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
      }
    });
  });
  

  
  // Add card hover effects
  const cards = document.querySelectorAll('.option-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (!card.classList.contains('disabled')) {
        card.style.transition = 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
        
        // Animate icon on hover
        const icon = card.querySelector('.card-icon');
        if (icon) {
          icon.style.transform = 'scale(1.2) rotate(5deg)';
          icon.style.opacity = '0.6';
        }
      }
    });
    
    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.card-icon');
      if (icon) {
        icon.style.transform = 'scale(1) rotate(0deg)';
        icon.style.opacity = '0.3';
      }
    });
  });
  
  // Add parallax effect to floating shapes
  document.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.floating-shape');
    shapes.forEach((shape, index) => {
      const speed = (index + 1) * 0.02;
      const x = (window.innerWidth - e.pageX * speed) / 100;
      const y = (window.innerHeight - e.pageY * speed) / 100;
      shape.style.transform = `translate(${x}px, ${y}px)`;
    });
  });
}

/**
 * Handle username entry and portal access
 */
function handleEnterPortal() {
  const usernameInput = document.getElementById('usernameInput');
  const errorMessage = document.getElementById('usernameError');
  const enterBtn = document.getElementById('enterPortalBtn');
  const username = usernameInput.value.trim();
  
  // Validate username
  if (!username) {
    errorMessage.textContent = 'Please enter your name to continue.';
    usernameInput.focus();
    shakeElement(usernameInput);
    return;
  }
  
  if (username.length < 2) {
    errorMessage.textContent = 'Name must be at least 2 characters long.';
    usernameInput.focus();
    shakeElement(usernameInput);
    return;
  }
  
  // Clear error and store username
  errorMessage.textContent = '';
  appState.currentUsername = username;
  storeUsername(username);
  
  // Show loading state
  enterBtn.classList.add('loading');
  enterBtn.disabled = true;
  
  // Check if this user already made a selection
  if (appState.userSelections[username]) {
    appState.hasUserSelected = true;
  }
  
  // Simulate loading and transition
  setTimeout(() => {
    enterBtn.classList.remove('loading');
    showSelectionScreen();
  }, 500);
}

/**
 * Shake animation for validation errors
 */
function shakeElement(element) {
  element.style.animation = 'none';
  setTimeout(() => {
    element.style.animation = 'shake 0.5s';
  }, 10);
}

/**
 * Handle option selection
 */
function handleOptionSelection(optionId) {
  // Prevent selection if user already selected
  if (appState.hasUserSelected) {
    return;
  }
  
  // Prevent selection if option is full
  if (appState.optionCounts[optionId] >= CONFIG.MAX_SELECTIONS_PER_OPTION) {
    // Shake animation for full cards
    const card = document.querySelector(`.option-card[data-option="${optionId}"]`);
    card.style.animation = 'none';
    setTimeout(() => {
      card.style.animation = 'shake 0.5s';
    }, 10);
    return;
  }
  
  // Increment count
  const oldCount = appState.optionCounts[optionId];
  appState.optionCounts[optionId]++;
  
  // Store user's selection
  appState.userSelections[appState.currentUsername] = optionId;
  appState.hasUserSelected = true;
  
  // Save to storage
  saveStateToStorage();
  
  // Animate counter change
  animateCounterChange(optionId, oldCount, appState.optionCounts[optionId]);
  
  // Update UI
  updateUI();
  
  // Show success animation
  triggerSuccessAnimation(optionId);
  
  // Show confirmation message
  showSuccessMessage(optionId);
}

/**
 * Show username entry screen
 */
function showUsernameScreen() {
  const usernameScreen = document.getElementById('usernameScreen');
  const selectionScreen = document.getElementById('selectionScreen');
  
  usernameScreen.classList.add('active');
  selectionScreen.classList.remove('active');
  
  // Focus input
  setTimeout(() => {
    document.getElementById('usernameInput').focus();
  }, 100);
}

/**
 * Show selection screen
 */
function showSelectionScreen() {
  const usernameScreen = document.getElementById('usernameScreen');
  const selectionScreen = document.getElementById('selectionScreen');
  
  // Fade out username screen
  usernameScreen.style.transition = 'opacity 0.5s ease';
  usernameScreen.style.opacity = '0';
  
  setTimeout(() => {
    usernameScreen.classList.remove('active');
    selectionScreen.classList.add('active');
    
    // Update greeting with typing effect
    const greeting = document.getElementById('userGreeting');
    typeText(greeting, `Welcome, ${appState.currentUsername}!`, 30);
    
    // Update UI
    updateUI();
    
    // Add staggered animation to cards
    const cards = document.querySelectorAll('.option-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 + (index * 150));
    });
  }, 500);
}

/**
 * Typing effect for text
 */
function typeText(element, text, speed = 50) {
  element.textContent = '';
  let i = 0;
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

/**
 * Update all UI elements based on current state
 */
function updateUI() {
  // Update counters and card states for each option
  CONFIG.OPTIONS.forEach(optionId => {
    updateOptionCard(optionId);
  });
  
  // Check if user already selected
  if (appState.hasUserSelected) {
    disableAllOptions();
    const selectedOption = appState.userSelections[appState.currentUsername];
    if (selectedOption) {
      highlightSelectedOption(selectedOption);
    }
  }
  
  // Check if all options are full
  checkIfAllFull();
  
  // Update summary section
  updateSummary();
}

/**
 * Update individual option card
 */
function updateOptionCard(optionId) {
  const count = appState.optionCounts[optionId];
  const card = document.querySelector(`.option-card[data-option="${optionId}"]`);
  const counter = document.getElementById(`counter${optionId.slice(-1).toUpperCase()}`);
  const badge = card.querySelector('.option-status-badge');
  const statusText = badge.querySelector('.status-text');
  const selectBtn = card.querySelector('.option-select-btn');
  
  // Update progress bar width based on count
  const progressPercent = (count / CONFIG.MAX_SELECTIONS_PER_OPTION) * 100;
  const counterElement = card.querySelector('.option-counter');
  if (counterElement && counterElement.style) {
    counterElement.style.setProperty('--progress-width', `${progressPercent}%`);
  }
  
  // Update counter
  counter.textContent = `${count}/${CONFIG.MAX_SELECTIONS_PER_OPTION}`;
  
  // Update status and styling based on count
  if (count >= CONFIG.MAX_SELECTIONS_PER_OPTION) {
    // Full
    badge.setAttribute('data-status', 'full');
    statusText.textContent = 'Full';
    card.classList.add('disabled');
    selectBtn.disabled = true;
    selectBtn.textContent = 'Limit Reached';
  } else if (count >= CONFIG.THRESHOLD_FEW_SLOTS) {
    // Few slots left
    badge.setAttribute('data-status', 'few-slots');
    statusText.textContent = 'Few Slots Left';
    card.classList.remove('disabled');
    selectBtn.disabled = false;
    selectBtn.textContent = 'Select This Problem Statement';
  } else {
    // Available
    badge.setAttribute('data-status', 'available');
    statusText.textContent = 'Available';
    card.classList.remove('disabled');
    selectBtn.disabled = false;
    selectBtn.textContent = 'Select This Problem Statement';
  }
  
  // Disable if user already selected something
  if (appState.hasUserSelected) {
    selectBtn.disabled = true;
  }
}

/**
 * Disable all option buttons
 */
function disableAllOptions() {
  const buttons = document.querySelectorAll('.option-select-btn');
  buttons.forEach(btn => {
    btn.disabled = true;
  });
}

/**
 * Highlight the option selected by current user
 */
function highlightSelectedOption(optionId) {
  const card = document.querySelector(`.option-card[data-option="${optionId}"]`);
  const selectBtn = card.querySelector('.option-select-btn');
  
  selectBtn.textContent = '✔ Selected';
  selectBtn.style.background = 'var(--gradient-success)';
  selectBtn.style.borderColor = 'var(--status-available)';
  selectBtn.style.boxShadow = '0 4px 15px rgba(17, 153, 142, 0.4)';
  
  // Add selected class to card
  card.classList.add('selected');
  
  // Animate the icon
  const icon = card.querySelector('.card-icon');
  if (icon) {
    icon.style.animation = 'iconBounce 0.6s ease';
  }
}

/**
 * Show success message after selection
 */
function showSuccessMessage(optionId) {
  const successMessage = document.getElementById('successMessage');
  const successText = document.getElementById('successText');
  const optionName = CONFIG.OPTION_NAMES[optionId];
  
  successText.textContent = `Thank you ${appState.currentUsername}, you have successfully selected ${optionName}.`;
  successMessage.classList.remove('hidden');
  
  // Scroll to top to show message
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Trigger confetti animation
  createConfetti();
}

/**
 * Animate counter value change
 */
function animateCounterChange(optionId, oldValue, newValue) {
  const counterId = `counter${optionId.slice(-1).toUpperCase()}`;
  const counterElement = document.getElementById(counterId);
  
  if (!counterElement) return;
  
  // Animate the counter
  counterElement.style.animation = 'countUp 0.5s ease-out';
  
  // Animate number count up
  let current = oldValue;
  const increment = 1;
  const duration = 500; // ms
  const steps = 10;
  const stepDuration = duration / steps;
  
  const interval = setInterval(() => {
    current += increment / steps;
    if (current >= newValue) {
      current = newValue;
      clearInterval(interval);
    }
    counterElement.textContent = `${Math.floor(current)}/${CONFIG.MAX_SELECTIONS_PER_OPTION}`;
  }, stepDuration);
}

/**
 * Trigger success animation on selected card
 */
function triggerSuccessAnimation(optionId) {
  const card = document.querySelector(`.option-card[data-option="${optionId}"]`);
  if (!card) return;
  
  // Add selected class
  card.classList.add('selected');
  
  // Create pulse ring effect
  const pulseRing = document.createElement('div');
  pulseRing.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    border: 2px solid var(--status-available);
    transform: translate(-50%, -50%);
    pointer-events: none;
    animation: pulseRing 1s ease-out forwards;
  `;
  
  card.style.position = 'relative';
  card.appendChild(pulseRing);
  
  // Remove pulse ring after animation
  setTimeout(() => {
    if (pulseRing.parentNode) {
      pulseRing.parentNode.removeChild(pulseRing);
    }
  }, 1000);
}

/**
 * Create confetti animation
 */
function createConfetti() {
  const colors = ['#667eea', '#764ba2', '#11998e', '#38ef7d', '#f093fb', '#f5576c', '#FFC107', '#4CAF50'];
  const confettiCount = 60;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const animationDelay = Math.random() * 0.5;
    const size = Math.random() * 8 + 4;
    
    confetti.style.cssText = `
      position: fixed;
      top: -10px;
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      opacity: 0.8;
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      pointer-events: none;
      z-index: 9999;
      animation: confetti ${2 + Math.random() * 2}s ease-out ${animationDelay}s forwards;
    `;
    
    document.body.appendChild(confetti);
    
    // Remove confetti after animation
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, (2 + Math.random() * 2 + animationDelay) * 1000);
  }
}

/**
 * Add ripple effect to button
 */
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    left: ${x}px;
    top: ${y}px;
    transform: scale(0);
    pointer-events: none;
    animation: ripple 0.6s ease-out;
  `;
  
  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(ripple);
  
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 600);
}

/**
 * Check if all options are full and show message
 */
function checkIfAllFull() {
  const allFull = CONFIG.OPTIONS.every(
    optionId => appState.optionCounts[optionId] >= CONFIG.MAX_SELECTIONS_PER_OPTION
  );
  
  const allFullMessage = document.getElementById('allFullMessage');
  const optionsGrid = document.getElementById('optionsGrid');
  
  if (allFull) {
    allFullMessage.classList.remove('hidden');
    optionsGrid.style.display = 'none';
  } else {
    allFullMessage.classList.add('hidden');
    optionsGrid.style.display = 'grid';
  }
}

/**
 * Load application state from in-memory storage
 * Note: In a sandboxed environment, we use in-memory state management
 */
function loadStateFromStorage() {
  // State is maintained in memory during the session
  // In a real application, this would sync with a backend server
  if (!appState.optionCounts) {
    initializeDefaultState();
  }
}

/**
 * Save application state to in-memory storage
 * Note: In a sandboxed environment, we use in-memory state management
 */
function saveStateToStorage() {
  // State is automatically saved in memory
  // In a real application, this would sync with a backend server
  console.log('State saved:', appState);
}

/**
 * Get stored username from in-memory storage
 */
function getStoredUsername() {
  return appState.currentUsername || null;
}

/**
 * Store username in in-memory storage
 */
function storeUsername(username) {
  appState.currentUsername = username;
}

/**
 * Initialize default state
 */
function initializeDefaultState() {
  appState.optionCounts = {
    optionA: 0,
    optionB: 0,
    optionC: 0
  };
  appState.userSelections = {};
}















/**
 * Update summary section with current statistics
 */
function updateSummary() {
  // Calculate total selections
  const totalSelections = CONFIG.OPTIONS.reduce((sum, optionId) => {
    return sum + appState.optionCounts[optionId];
  }, 0);
  
  // Calculate available slots
  const availableSlots = 60 - totalSelections;
  
  // Calculate distinct users
  const distinctUsers = Object.keys(appState.userSelections).length;
  
  // Update stat cards with animation
  animateValue('total-selections', totalSelections);
  animateValue('available-slots', availableSlots);
  animateValue('distinct-users', distinctUsers);
  
  // Update breakdown for each problem statement
  const optionLetters = ['A', 'B', 'C'];
  CONFIG.OPTIONS.forEach((optionId, index) => {
    const count = appState.optionCounts[optionId];
    const percentage = Math.round((count / CONFIG.MAX_SELECTIONS_PER_OPTION) * 100);
    const letter = optionLetters[index].toLowerCase();
    
    // Update count text
    const countElement = document.getElementById(`count-${letter}`);
    if (countElement) {
      countElement.textContent = `${count}/20 (${percentage}%)`;
    }
    
    // Update progress bar
    const progressBar = document.getElementById(`progress-${letter}`);
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
      
      // Update status class based on count
      progressBar.classList.remove('status-available', 'status-few-slots', 'status-full');
      
      if (count >= CONFIG.MAX_SELECTIONS_PER_OPTION) {
        progressBar.classList.add('status-full');
      } else if (count >= CONFIG.THRESHOLD_FEW_SLOTS) {
        progressBar.classList.add('status-few-slots');
      } else {
        progressBar.classList.add('status-available');
      }
    }
  });
}

/**
 * Animate value change in stat cards
 */
function animateValue(elementId, targetValue) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const currentValue = parseInt(element.textContent) || 0;
  
  if (currentValue === targetValue) return;
  
  const duration = 800; // ms
  const steps = 30;
  const stepDuration = duration / steps;
  const increment = (targetValue - currentValue) / steps;
  
  let current = currentValue;
  let step = 0;
  
  const interval = setInterval(() => {
    step++;
    current += increment;
    
    if (step >= steps) {
      element.textContent = targetValue;
      clearInterval(interval);
    } else {
      element.textContent = Math.round(current);
    }
  }, stepDuration);
  
  // Add pulse animation
  element.style.animation = 'none';
  setTimeout(() => {
    element.style.animation = 'pulse 0.5s ease';
  }, 10);
}



// Add additional CSS animations dynamically
function addDynamicStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    @keyframes pulseRing {
      0% {
        width: 0;
        height: 0;
        opacity: 1;
      }
      100% {
        width: 200px;
        height: 200px;
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}







// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addDynamicStyles();
    initializeApp();
  });
} else {
  addDynamicStyles();
  initializeApp();
}