const carousel3Dswiper = new Swiper(".carousel-3D-swiper", {
    loop: true,
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 3, // Default for larger screens
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 350,
      modifier: 1,
      slideShadows: true
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination"
    },
    // Add responsive breakpoints
    breakpoints: {
      // when window width is >= 320px
      320: {
        slidesPerView: 1,
        coverflowEffect: {
          depth: 100,
          modifier: 1
        }
      },
      // when window width is >= 768px
      768: {
        slidesPerView: 2,
        coverflowEffect: {
          depth: 250,
          modifier: 1
        }
      },
      // when window width is >= 1024px
      1024: {
        slidesPerView: 3,
        coverflowEffect: {
          depth: 350,
          modifier: 1
        }
      }
    }
  });

const carouselSection = document.querySelector('.carousel-3D-swiper-section');
const questionsSection = document.getElementById('questions-section');
const questionCategoryTitle = document.getElementById('question-category-title');
const questionsContainer = document.getElementById('questions-container');
const backToCarouselBtn = document.getElementById('back-to-carousel');
const questionJumpNavigation = document.getElementById('question-jump-navigation');
const questionSelect = document.getElementById('question-select');

// New elements for question navigation
const questionNavigation = document.createElement('div');
questionNavigation.className = 'question-navigation-container';

const prevQuestionBtn = document.createElement('button');
prevQuestionBtn.textContent = 'السؤال السابق';
prevQuestionBtn.style.display = 'none';

const nextQuestionBtn = document.createElement('button');
nextQuestionBtn.textContent = 'السؤال التالي';
nextQuestionBtn.style.display = 'none';

questionNavigation.appendChild(prevQuestionBtn);
questionNavigation.appendChild(nextQuestionBtn);
questionsSection.appendChild(questionNavigation);

let allQuestions = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let answerTimeoutId = null;
let countdownIntervalId = null;
// NEW: Variable to hold the auto-next timer
let autoNextTimeoutId = null;

// Cookie helper functions
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function clearLastQuestionCookie() {
    setCookie('lastQuestion', '', -1);
}

// Fetch questions from questions.json
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    allQuestions = data;
    loadLastQuestionFromCookie();
  })
  .catch(error => console.error('Error loading questions:', error));

function loadLastQuestionFromCookie() {
    const lastQuestionCookie = getCookie('lastQuestion');
    if (lastQuestionCookie) {
        try {
            const { category, index } = JSON.parse(lastQuestionCookie);
            if (category && allQuestions[category] && index !== undefined) {
                currentQuestions = allQuestions[category];
                currentQuestionIndex = parseInt(index, 10);
                if (currentQuestionIndex >= 0 && currentQuestionIndex < currentQuestions.length) {
                    displaySingleQuestion(category);
                } else {
                    clearLastQuestionCookie();
                }
            }
        } catch (e) {
            console.error('Error parsing lastQuestion cookie:', e);
            clearLastQuestionCookie();
        }
    }
}

document.querySelectorAll('.swiper-slide').forEach(slide => {
  slide.addEventListener('click', function() {
    const category = this.dataset.category;
    if (category && allQuestions[category]) {
      currentQuestions = allQuestions[category];
      currentQuestionIndex = 0;
      displaySingleQuestion(category);
    }
  });
});

// Helper function to trigger the 20-second wait and auto-advance
function startAutoNextTimer(category) {
    // Only set the timer if there is a next question
    if (currentQuestionIndex < currentQuestions.length - 1) {
        autoNextTimeoutId = setTimeout(() => {
            currentQuestionIndex++;
            displaySingleQuestion(category);
        }, 20000); // 20000 milliseconds = 20 seconds
    }
}

function displaySingleQuestion(category) {
  carouselSection.style.display = 'none';
  questionsSection.style.display = 'block';
  questionCategoryTitle.textContent = category;
  questionsContainer.innerHTML = '';

  setCookie('lastQuestion', JSON.stringify({ category: category, index: currentQuestionIndex }), 7);

  // Clear ALL timers (answer reveal, countdown, and auto-next)
  if (answerTimeoutId) clearTimeout(answerTimeoutId);
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  if (autoNextTimeoutId) clearTimeout(autoNextTimeoutId);

  questionSelect.innerHTML = '';
  if (currentQuestions.length > 0) {
    currentQuestions.forEach((q, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `السؤال ${index + 1}`;
      if (index === currentQuestionIndex) {
        option.selected = true;
      }
      questionSelect.appendChild(option);
    });
    questionJumpNavigation.style.display = 'block';
  } else {
    questionJumpNavigation.style.display = 'none';
  }

  if (currentQuestions.length > 0) {
    const q = currentQuestions[currentQuestionIndex];
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question-item');

    const questionText = document.createElement('p');
    const strongQuestionText = document.createElement('strong');
    strongQuestionText.textContent = `${currentQuestionIndex + 1}: ${q.question}`;
    questionText.appendChild(strongQuestionText);
    questionDiv.appendChild(questionText);

    if (q.options) {
      const optionsList = document.createElement('ul');
      q.options.forEach(option => {
        const optionItem = document.createElement('li');
        optionItem.textContent = option;
        optionsList.appendChild(optionItem);
      });
      questionDiv.appendChild(optionsList);
    }

    const answerContainer = document.createElement('div');
    answerContainer.classList.add('answer-container');
    questionDiv.appendChild(answerContainer);

    if (q.answer) {
      const answerParagraph = document.createElement('p');
      answerParagraph.classList.add('answer');
      answerParagraph.textContent = ` ${q.answer}`;
      answerParagraph.style.display = 'none';

      const animatedCountdownDiv = document.createElement('div');
      animatedCountdownDiv.classList.add('animated-countdown');
      const countdownNumberSpan = document.createElement('span');
      animatedCountdownDiv.appendChild(countdownNumberSpan);
      answerContainer.appendChild(animatedCountdownDiv);
      answerContainer.appendChild(answerParagraph);

      let countdown = 8;
      countdownNumberSpan.textContent = countdown;
      animatedCountdownDiv.style.setProperty('--timer-duration', `${countdown}s`);

      countdownIntervalId = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          countdownNumberSpan.textContent = countdown;
        } else {
          clearInterval(countdownIntervalId);
          animatedCountdownDiv.style.display = 'none';
          answerParagraph.style.display = 'block';
          // START 20 SECOND WAIT HERE
          startAutoNextTimer(category);
        }
      }, 1000);

      // Fallback timeout
      answerTimeoutId = setTimeout(() => {
        clearInterval(countdownIntervalId);
        animatedCountdownDiv.style.display = 'none';
        answerParagraph.style.display = 'block';
        
        // Ensure timer starts if fallback is triggered and timer isn't already running
        if (!autoNextTimeoutId) {
             startAutoNextTimer(category);
        }
      }, (countdown + 0.5) * 1000);

    } else {
      const noAnswerText = document.createElement('p');
      noAnswerText.textContent = 'No answer provided for this question.';
      answerContainer.appendChild(noAnswerText);
    }

    questionsContainer.appendChild(questionDiv);

    prevQuestionBtn.style.display = 'block';
    nextQuestionBtn.style.display = 'block';
    prevQuestionBtn.disabled = currentQuestionIndex === 0;
    nextQuestionBtn.disabled = currentQuestionIndex === currentQuestions.length - 1;
    questionSelect.value = currentQuestionIndex;

  } else {
    questionsContainer.textContent = 'No questions available for this category.';
    prevQuestionBtn.style.display = 'none';
    nextQuestionBtn.style.display = 'none';
    questionJumpNavigation.style.display = 'none';
  }
}

// Event listeners for navigation buttons
nextQuestionBtn.addEventListener('click', () => {
  if (answerTimeoutId) clearTimeout(answerTimeoutId);
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  if (autoNextTimeoutId) clearTimeout(autoNextTimeoutId); // Clear auto-next on manual click
  if (currentQuestionIndex < currentQuestions.length - 1) {
    currentQuestionIndex++;
    displaySingleQuestion(questionCategoryTitle.textContent);
  }
});

prevQuestionBtn.addEventListener('click', () => {
  if (answerTimeoutId) clearTimeout(answerTimeoutId);
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  if (autoNextTimeoutId) clearTimeout(autoNextTimeoutId); // Clear auto-next on manual click
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displaySingleQuestion(questionCategoryTitle.textContent);
  }
});

questionSelect.addEventListener('change', function() {
  const selectedIndex = parseInt(this.value, 10);
  if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < currentQuestions.length) {
    currentQuestionIndex = selectedIndex;
    displaySingleQuestion(questionCategoryTitle.textContent);
  }
});

backToCarouselBtn.addEventListener('click', () => {
  questionsSection.style.display = 'none';
  carouselSection.style.display = 'block';
  questionJumpNavigation.style.display = 'none';
  if (answerTimeoutId) clearTimeout(answerTimeoutId);
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  if (autoNextTimeoutId) clearTimeout(autoNextTimeoutId); // Clear auto-next on back
});

if (Object.keys(allQuestions).length > 0) {
    loadLastQuestionFromCookie();
}
