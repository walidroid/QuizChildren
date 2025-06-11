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
const questionJumpNavigation = document.getElementById('question-jump-navigation'); // Get the new div
const questionSelect = document.getElementById('question-select'); // Get the new select element

// New elements for question navigation
const questionNavigation = document.createElement('div');
questionNavigation.className = 'question-navigation-container'; // Add class for styling
// questionNavigation.style.display = 'flex'; // Remove inline styles, handled by CSS
// questionNavigation.style.justifyContent = 'space-between'; // Remove inline styles
// questionNavigation.style.marginTop = '20px'; // Remove inline styles

const prevQuestionBtn = document.createElement('button');
prevQuestionBtn.textContent = 'السؤال السابق';
// prevQuestionBtn.style.padding = '10px 20px'; // Remove inline styles
// prevQuestionBtn.style.backgroundColor = '#28a745'; // Remove inline styles
// prevQuestionBtn.style.color = 'white'; // Remove inline styles
// prevQuestionBtn.style.border = 'none'; // Remove inline styles
// prevQuestionBtn.style.borderRadius = '5px'; // Remove inline styles
// prevQuestionBtn.style.cursor = 'pointer'; // Remove inline styles
prevQuestionBtn.style.display = 'none'; // Hidden initially

const nextQuestionBtn = document.createElement('button');
nextQuestionBtn.textContent = 'السؤال التالي';
// nextQuestionBtn.style.padding = '10px 20px'; // Remove inline styles
// nextQuestionBtn.style.backgroundColor = '#28a745'; // Remove inline styles
// nextQuestionBtn.style.color = 'white'; // Remove inline styles
// nextQuestionBtn.style.border = 'none'; // Remove inline styles
// nextQuestionBtn.style.borderRadius = '5px'; // Remove inline styles
// nextQuestionBtn.style.cursor = 'pointer'; // Remove inline styles
nextQuestionBtn.style.display = 'none'; // Hidden initially

questionNavigation.appendChild(prevQuestionBtn);
questionNavigation.appendChild(nextQuestionBtn);
questionsSection.appendChild(questionNavigation); // Append navigation to questions section

let allQuestions = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let answerTimeoutId = null;
let countdownIntervalId = null; // For the new animation interval

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
    setCookie('lastQuestion', '', -1); // Set expiry to past to delete
}

// Fetch questions from questions.json
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    allQuestions = data;
    // Attempt to load last question from cookie after questions are loaded
    loadLastQuestionFromCookie();
  })
  .catch(error => console.error('Error loading questions:', error));

// Function to load and display the last question from cookie
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
                    clearLastQuestionCookie(); // Invalid index, clear cookie
                }
            }
        } catch (e) {
            console.error('Error parsing lastQuestion cookie:', e);
            clearLastQuestionCookie(); // Clear corrupted cookie
        }
    }
}

// Add click event listeners to each swiper slide
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

// Function to display a single question
function displaySingleQuestion(category) {
  carouselSection.style.display = 'none';
  questionsSection.style.display = 'block';
  questionCategoryTitle.textContent = category;
  questionsContainer.innerHTML = '';

  // Save current question to cookie
  setCookie('lastQuestion', JSON.stringify({ category: category, index: currentQuestionIndex }), 7); // Save for 7 days

  if (answerTimeoutId) clearTimeout(answerTimeoutId);
  if (countdownIntervalId) clearInterval(countdownIntervalId);

  // Populate the question selection dropdown
  questionSelect.innerHTML = ''; // Clear previous options
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
    questionJumpNavigation.style.display = 'block'; // Show the dropdown
  } else {
    questionJumpNavigation.style.display = 'none'; // Hide if no questions
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

      // New Animated Countdown Element
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
        }
      }, 1000);

      // Fallback timeout to ensure answer shows if interval somehow fails
      answerTimeoutId = setTimeout(() => {
        clearInterval(countdownIntervalId); // Clear interval if still running
        animatedCountdownDiv.style.display = 'none';
        answerParagraph.style.display = 'block';
      }, (countdown + 0.5) * 1000); // 5.5 seconds total

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
    questionSelect.value = currentQuestionIndex; // Ensure dropdown is synced

  } else {
    questionsContainer.textContent = 'No questions available for this category.';
    prevQuestionBtn.style.display = 'none';
    nextQuestionBtn.style.display = 'none';
    questionJumpNavigation.style.display = 'none'; // Hide dropdown if no questions
  }
}

// Event listeners for navigation buttons
nextQuestionBtn.addEventListener('click', () => {
  if (answerTimeoutId) clearTimeout(answerTimeoutId);
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  if (currentQuestionIndex < currentQuestions.length - 1) {
    currentQuestionIndex++;
    displaySingleQuestion(questionCategoryTitle.textContent);
  }
});

prevQuestionBtn.addEventListener('click', () => {
  if (answerTimeoutId) clearTimeout(answerTimeoutId);
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displaySingleQuestion(questionCategoryTitle.textContent);
  }
});

// Event listener for the question select dropdown
questionSelect.addEventListener('change', function() {
  const selectedIndex = parseInt(this.value, 10);
  if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < currentQuestions.length) {
    currentQuestionIndex = selectedIndex;
    // It's important to get the category from a reliable source if needed here.
    // Assuming 'questionCategoryTitle.textContent' holds the current category name accurately.
    displaySingleQuestion(questionCategoryTitle.textContent);
  }
});

// Event listener for the back to carousel button
backToCarouselBtn.addEventListener('click', () => {
  questionsSection.style.display = 'none';
  carouselSection.style.display = 'block';
  questionJumpNavigation.style.display = 'none'; // Hide dropdown when going back
  if (answerTimeoutId) clearTimeout(answerTimeoutId);
  if (countdownIntervalId) clearInterval(countdownIntervalId); // Clear countdown interval
  // The following line will be removed:
  // clearLastQuestionCookie(); 
});

// Initial check in case questions are already loaded (e.g., from cache) and DOM is ready
// This is a fallback, primary load is in fetch().then()
if (Object.keys(allQuestions).length > 0) {
    loadLastQuestionFromCookie();
}