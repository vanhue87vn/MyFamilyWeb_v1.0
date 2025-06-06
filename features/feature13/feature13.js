        // Enhanced game data with categories and explanations
        const gameData = {
            general: [
                { 
                    statement: "Honey never spoils. Archaeologists have found edible honey in ancient Egyptian tombs.", 
                    answer: "fact",
                    explanation: "Honey's low moisture content and acidic pH make it inhospitable to bacteria. Archaeologists have indeed found 3,000-year-old honey that's still edible!"
                },
                { 
                    statement: "The Great Wall of China is the only man-made structure visible from space.", 
                    answer: "fiction",
                    explanation: "This is a common myth. Many large human-made structures are visible from low Earth orbit, but the Great Wall isn't particularly visible to the naked eye."
                }
            ],
            science: [
                { 
                    statement: "Bananas are berries, but strawberries aren't.", 
                    answer: "fact",
                    explanation: "Botanically, berries develop from a single ovary and typically contain multiple seeds. Bananas qualify, while strawberries develop from multiple ovaries."
                },
                { 
                    statement: "The human body has five senses.", 
                    answer: "fiction",
                    explanation: "Humans have at least 9 senses, including balance (equilibrioception), temperature (thermoception), and pain (nociception)."
                }
            ],
            history: [
                { 
                    statement: "Cleopatra lived closer to the invention of the iPhone than to the building of the pyramids.", 
                    answer: "fact",
                    explanation: "The pyramids were built around 2560 BCE, Cleopatra lived around 30 BCE (2,530 years later), and the iPhone debuted in 2007 (2,037 years after Cleopatra)."
                },
                { 
                    statement: "The Titanic was the deadliest ship disaster in history.", 
                    answer: "fiction",
                    explanation: "While tragic (1,500+ deaths), the Wilhelm Gustloff sinking in 1945 killed about 9,400 people, making it the deadliest maritime disaster."
                }
            ],
            animals: [
                { 
                    statement: "A group of flamingos is called a 'flamboyance'.", 
                    answer: "fact",
                    explanation: "This colorful term fits these vibrant birds perfectly! Other great animal group names include a 'murder' of crows and a 'parliament' of owls."
                },
                { 
                    statement: "Bats are blind.", 
                    answer: "fiction",
                    explanation: "While bats use echolocation to navigate, they can see quite well. In fact, many species have excellent night vision."
                }
            ],
            geography: [
                { 
                    statement: "The Eiffel Tower grows taller in the summer due to heat expansion.", 
                    answer: "fact",
                    explanation: "Iron expands when heated! The tower can grow up to 6 inches (15 cm) taller on hot days."
                },
                { 
                    statement: "Canada is the largest country in the world by land area.", 
                    answer: "fiction",
                    explanation: "Russia is the largest (17.1 million km²), followed by Canada (9.98 million km²). Canada is larger than China and the US though!"
                }
            ]
        };

        // Game variables
        let currentQuestions = [];
        let currentFactIndex = 0;
        let score = 0;
        let gameActive = true;
        let selectedCategory = 'all';

        // DOM elements
        const factDisplay = document.getElementById('fact-display');
        const factBtn = document.getElementById('fact-btn');
        const fictionBtn = document.getElementById('fiction-btn');
        const nextBtn = document.getElementById('next-btn');
        const scoreDisplay = document.getElementById('score');
        const feedbackDisplay = document.getElementById('feedback');
        const explanationDisplay = document.getElementById('explanation');
        const questionCountDisplay = document.getElementById('question-count');
        const totalQuestionsDisplay = document.getElementById('total-questions');
        const progressBar = document.getElementById('progress-bar');
        const categorySelector = document.createElement('select');
        
        // Initialize the game
        function initGame() {
            // Create category selector
            categorySelector.id = 'category-select';
            categorySelector.innerHTML = `
                <option value="all">All Categories</option>
                <option value="general">General Knowledge</option>
                <option value="science">Science</option>
                <option value="history">History</option>
                <option value="animals">Animals</option>
                <option value="geography">Geography</option>
            `;
            categorySelector.addEventListener('change', (e) => {
                selectedCategory = e.target.value;
                startGame();
            });
            
            const container = document.querySelector('.container');
            container.insertBefore(categorySelector, factDisplay);
            
            startGame();
        }
        
        function startGame() {
            // Reset game state
            currentFactIndex = 0;
            score = 0;
            gameActive = true;
            scoreDisplay.textContent = score;
            
            // Get questions based on category
            if (selectedCategory === 'all') {
                currentQuestions = Object.values(gameData).flat();
            } else {
                currentQuestions = [...gameData[selectedCategory]];
            }
            
            // Shuffle questions
            currentQuestions = shuffleArray(currentQuestions);
            totalQuestionsDisplay.textContent = currentQuestions.length;
            
            loadFact();
        }
        
        function shuffleArray(array) {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        }
        
        function loadFact() {
            if (currentFactIndex >= currentQuestions.length) {
                endGame();
                return;
            }
            
            questionCountDisplay.textContent = currentFactIndex + 1;
            progressBar.style.width = `${((currentFactIndex + 1) / currentQuestions.length) * 100}%`;
            
            factDisplay.textContent = currentQuestions[currentFactIndex].statement;
            feedbackDisplay.textContent = '';
            feedbackDisplay.className = 'feedback';
            explanationDisplay.textContent = '';
            explanationDisplay.className = 'explanation';
            nextBtn.style.display = 'none';
            factBtn.style.display = 'block';
            fictionBtn.style.display = 'block';
            factBtn.disabled = false;
            fictionBtn.disabled = false;
        }
        
        function checkAnswer(guess) {
            if (!gameActive) return;
            
            const correctAnswer = currentQuestions[currentFactIndex].answer;
            factBtn.disabled = true;
            fictionBtn.disabled = true;
            nextBtn.style.display = 'block';
            
            // Show explanation
            explanationDisplay.textContent = currentQuestions[currentFactIndex].explanation;
            explanationDisplay.classList.add('show-explanation');
            
            if (guess === correctAnswer) {
                score++;
                scoreDisplay.textContent = score;
                feedbackDisplay.textContent = "Correct! 🎉";
                feedbackDisplay.className = 'feedback correct';
                createConfetti();
            } else {
                feedbackDisplay.textContent = `Wrong! It's ${correctAnswer === 'fact' ? 'a FACT' : 'FICTION'}.`;
                feedbackDisplay.className = 'feedback incorrect';
            }
        }
        
        function endGame() {
            factDisplay.innerHTML = `Game Over!<br>Your final score: ${score}/${currentQuestions.length}`;
            feedbackDisplay.textContent = '';
            explanationDisplay.textContent = '';
            nextBtn.style.display = 'none';
            factBtn.style.display = 'none';
            fictionBtn.style.display = 'none';
            gameActive = false;
            
            if (score === currentQuestions.length) {
                createConfetti(true);
            }
        }
        
        function createConfetti(intense = false) {
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
            const container = document.querySelector('.container');
            
            const confettiCount = intense ? 100 : 20;
            
            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.top = '-10px';
                container.appendChild(confetti);
                
                const animationDuration = Math.random() * 3 + 2;
                
                confetti.animate([
                    { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
                    { transform: `translate(${Math.random() * 200 - 100}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
                ], {
                    duration: animationDuration * 1000,
                    easing: 'cubic-bezier(0.1, 0.8, 0.9, 1)'
                });
                
                setTimeout(() => {
                    confetti.remove();
                }, animationDuration * 1000);
            }
        }
        
        // Event listeners
        factBtn.addEventListener('click', () => checkAnswer('fact'));
        fictionBtn.addEventListener('click', () => checkAnswer('fiction'));
        nextBtn.addEventListener('click', () => {
            currentFactIndex++;
            loadFact();
        });
        
        // Start the game when page loads
        window.addEventListener('load', initGame);