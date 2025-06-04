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
let answerTimeoutId = null; // Variable to store the timeout ID

// Fetch questions from questions.json
fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    allQuestions = data;
  })
  .catch(error => console.error('Error loading questions:', error));

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
  questionsContainer.innerHTML = ''; // Clear previous questions

  // Clear any existing answer timeout when a new question is displayed
  if (answerTimeoutId) {
    clearTimeout(answerTimeoutId);
    answerTimeoutId = null;
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

    // Create a container for the answer and countdown
    const answerContainer = document.createElement('div');
    answerContainer.classList.add('answer-container');
    questionDiv.appendChild(answerContainer);

    if (q.answer) {
      const answerParagraph = document.createElement('p');
      answerParagraph.classList.add('answer');
      answerParagraph.textContent = `الجواب: ${q.answer}`;
      answerParagraph.style.display = 'none'; // Initially hide the answer

      const countdownParagraph = document.createElement('p');
      countdownParagraph.classList.add('countdown');
      countdownParagraph.textContent = ' 5';

      answerContainer.appendChild(countdownParagraph);
      answerContainer.appendChild(answerParagraph);

      // Start countdown
      let countdown = 5;
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          countdownParagraph.textContent = ` ${countdown} `;
        } else {
          clearInterval(countdownInterval);
          countdownParagraph.style.display = 'none';
          answerParagraph.style.display = 'block';
        }
      }, 1000);

      // Store the interval ID in case we need to clear it early (e.g., when navigating to next/prev question)
      // We'll use a timeout to clear this interval if the user navigates away before 5s
      // This is a simplified approach; for robustness, manage intervals more directly.
      answerTimeoutId = setTimeout(() => { // This timeout is just to ensure cleanup if interval isn't cleared by navigation
        clearInterval(countdownInterval);
      }, 5500); // A bit longer than the countdown itself

    } else {
        const noAnswerText = document.createElement('p');
        noAnswerText.textContent = 'No answer provided for this question.';
        answerContainer.appendChild(noAnswerText);
    }

    questionsContainer.appendChild(questionDiv);

    // Update navigation button visibility and disabled state
    prevQuestionBtn.style.display = 'block';
    nextQuestionBtn.style.display = 'block';
    prevQuestionBtn.disabled = currentQuestionIndex === 0;
    nextQuestionBtn.disabled = currentQuestionIndex === currentQuestions.length - 1;

  } else {
    questionsContainer.textContent = 'No questions available for this category.';
    prevQuestionBtn.style.display = 'none';
    nextQuestionBtn.style.display = 'none';
  }
}

// Event listeners for navigation buttons
nextQuestionBtn.addEventListener('click', () => {
  if (answerTimeoutId) clearTimeout(answerTimeoutId); // Clear previous timeout
  if (currentQuestionIndex < currentQuestions.length - 1) {
    currentQuestionIndex++;
    displaySingleQuestion(questionCategoryTitle.textContent);
  }
});

prevQuestionBtn.addEventListener('click', () => {
  if (answerTimeoutId) clearTimeout(answerTimeoutId); // Clear previous timeout
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displaySingleQuestion(questionCategoryTitle.textContent);
  }
});

// Event listener for the back button
backToCarouselBtn.addEventListener('click', () => {
  if (answerTimeoutId) clearTimeout(answerTimeoutId); // Clear previous timeout
  questionsSection.style.display = 'none';
  carouselSection.style.display = 'block';
});