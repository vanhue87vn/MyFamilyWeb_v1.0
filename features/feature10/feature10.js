        // Conversation context
        let lastTopic = null;
        
        document.getElementById('send-button').addEventListener('click', sendMessage);
        document.getElementById('user-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        function quickQuestion(question) {
            document.getElementById('user-input').value = question;
            sendMessage();
        }

        function sendMessage() {
            const userInput = document.getElementById('user-input');
            const message = userInput.value.trim();
            
            if (message) {
                addMessage(message, 'user-message');
                userInput.value = '';
                
                setTimeout(() => {
                    const botResponse = getBotResponse(message);
                    addMessage(botResponse.text, 'bot-message');
                    
                    // Add suggestions if provided
                    if (botResponse.suggestions) {
                        const suggestionsDiv = document.createElement('div');
                        suggestionsDiv.className = 'suggestions';
                        
                        botResponse.suggestions.forEach(suggestion => {
                            const suggestionElement = document.createElement('div');
                            suggestionElement.className = 'suggestion';
                            suggestionElement.textContent = suggestion;
                            suggestionElement.onclick = () => quickQuestion(suggestion);
                            suggestionsDiv.appendChild(suggestionElement);
                        });
                        
                        document.getElementById('chat-messages').lastChild.appendChild(suggestionsDiv);
                    }
                }, 500);
            }
        }

        function addMessage(text, className) {
            const chatMessages = document.getElementById('chat-messages');
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', className);
            messageElement.textContent = text;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function getBotResponse(userMessage) {
            const msg = userMessage.toLowerCase();
            let response = { text: "", suggestions: [] };
            
            // Reset last topic if the user asks a completely different question
            if (msg.match(/\b(hi|hello|hey|greetings|sup|help|start over)\b/)) {
                lastTopic = null;
            }
            
            // ========== MATH CALCULATIONS ==========
            if (msg.match(/\b(\d+[\+\-\*\/]\d+|\d+\s?plus\s?\d+|\d+\s?minus\s?\d+|\d+\s?times\s?\d+|\d+\s?divided by\s?\d+|what is \d+[\+\-\*\/]\d+)\b/) || 
                lastTopic === 'math') {
                lastTopic = 'math';
                
                try {
                    // Extract math expression
                    let mathExpr = msg.replace(/[^\d\+\-\*\/\.]/g, '');
                    
                    // Handle worded math questions
                    if (mathExpr === '' && msg.includes('plus')) {
                        const nums = msg.match(/\d+/g);
                        if (nums && nums.length === 2) mathExpr = nums[0] + '+' + nums[1];
                    }
                    if (mathExpr === '' && msg.includes('minus')) {
                        const nums = msg.match(/\d+/g);
                        if (nums && nums.length === 2) mathExpr = nums[0] + '-' + nums[1];
                    }
                    if (mathExpr === '' && msg.includes('times')) {
                        const nums = msg.match(/\d+/g);
                        if (nums && nums.length === 2) mathExpr = nums[0] + '*' + nums[1];
                    }
                    if (mathExpr === '' && msg.includes('divided by')) {
                        const nums = msg.match(/\d+/g);
                        if (nums && nums.length === 2) mathExpr = nums[0] + '/' + nums[1];
                    }
                    
                    // Calculate if we have a valid expression
                    if (mathExpr.match(/^[\d\+\-\*\/\.]+$/)) {
                        const result = eval(mathExpr); // Note: Using eval is simple but be careful in production
                        response.text = `${mathExpr} = ${result}`;
                        response.suggestions = ["Another calculation", "Main menu"];
                        return response;
                    }
                } catch (e) {
                    // Fall through to general math response
                }
                
                // General math response if no specific match
                response.text = "I can help with basic math calculations!\n" +
                    "Try asking things like:\n" +
                    "'What is 15 + 27?' or\n" +
                    "'Calculate 100 divided by 4' or\n" +
                    "Just type '45 * 3'";
                response.suggestions = ["123 + 456", "100 / 5", "8 * 9"];
                return response;
            }
            
            // ========== GREETINGS ==========
            if (msg.match(/\b(hi|hello|hey|greetings|sup)\b/)) {
                response.text = getRandomResponse([
                    "Hello there! I can do math, tech support, recommendations, and more!",
                    "Hi! I know math, tech, books, movies, and jokes. What would you like?",
                    "Hey! I can calculate, troubleshoot, and entertain. Ask me anything!"
                ]);
                response.suggestions = ["Calculate 15 + 27", "Tech help", "Book recommendation"];
                return response;
            }
            
            // ========== HELP ==========
            if (msg.includes('help') || msg.includes('support') || msg.includes('what can you do')) {
                response.text = "I can help with:\n" +
                    "- Math calculations\n" +
                    "- Tech troubleshooting\n" +
                    "- Book/movie recommendations\n" +
                    "- Jokes and fun facts\n\n" +
                    "What would you like help with?";
                response.suggestions = ["Math problem", "Book recommendation", "Tell me a joke"];
                lastTopic = 'help';
                return response;
            }
            
            // ========== TECH SUPPORT ==========
            if (msg.match(/\b(tech|computer|internet|wifi|printer|phone|device)\b/) || lastTopic === 'tech') {
                lastTopic = 'tech';
                
                if (msg.match(/\b(wifi|internet|connection|online)\b/)) {
                    response.text = "For WiFi issues:\n" +
                        "1. Restart your router\n" +
                        "2. Check if other devices can connect\n" +
                        "3. Move closer to the router\n" +
                        "4. Contact your ISP if problems persist";
                    response.suggestions = ["Printer not working", "Computer is slow", "Back to main menu"];
                    return response;
                }
                
                if (msg.match(/\b(printer|printing)\b/)) {
                    response.text = "Printer troubleshooting:\n" +
                        "1. Check if it's powered on\n" +
                        "2. Verify paper is loaded\n" +
                        "3. Restart both printer and computer\n" +
                        "4. Reinstall drivers if needed";
                    return response;
                }
                
                if (msg.match(/\b(slow|lagging|freezing)\b/)) {
                    response.text = "For a slow computer:\n" +
                        "1. Close unused programs\n" +
                        "2. Restart your computer\n" +
                        "3. Check for malware\n" +
                        "4. Consider upgrading hardware";
                    return response;
                }
                
                // General tech response if no specific match
                response.text = "For tech support, try these steps:\n" +
                    "1. Restart the device\n" +
                    "2. Check for updates\n" +
                    "3. Search online for your specific error\n" +
                    "4. Contact manufacturer support\n\n" +
                    "What exactly isn't working?";
                response.suggestions = ["WiFi problems", "Printer issues", "Slow computer"];
                return response;
            }
            
            // ========== RECOMMENDATIONS ==========
            if (msg.match(/\b(book|movie|recommend|suggest|watch|read)\b/) || lastTopic === 'recommend') {
                lastTopic = 'recommend';
                
                if (msg.match(/\b(book|read|novel)\b/)) {
                    const books = [
                        "Fantasy: 'The Name of the Wind' by Patrick Rothfuss",
                        "Sci-Fi: 'Project Hail Mary' by Andy Weir",
                        "Mystery: 'Gone Girl' by Gillian Flynn",
                        "Classic: 'To Kill a Mockingbird' by Harper Lee"
                    ];
                    response.text = "Here are some book recommendations:\n" + books.join("\n");
                    response.suggestions = ["Movie suggestions", "More books", "Something else"];
                    return response;
                }
                
                if (msg.match(/\b(movie|film|watch)\b/)) {
                    const movies = [
                        "Action: 'John Wick' series",
                        "Comedy: 'The Grand Budapest Hotel'",
                        "Sci-Fi: 'Interstellar'",
                        "Drama: 'The Shawshank Redemption'"
                    ];
                    response.text = "Some movie suggestions:\n" + movies.join("\n");
                    response.suggestions = ["Book recommendations", "More movies", "Different topic"];
                    return response;
                }
                
                // General recommendation response
                response.text = "I can recommend books or movies. Which would you prefer?";
                response.suggestions = ["Book recommendations", "Movie suggestions"];
                return response;
            }
            
            // ========== FUN/JOKES ==========
            if (msg.match(/\b(joke|funny|laugh|humor)\b/)) {
                const jokes = [
                    "Why don't skeletons fight each other? They don't have the guts!",
                    "What's the best thing about Switzerland? I don't know, but the flag is a big plus!",
                    "How do you organize a space party? You planet!",
                    "Why did the scarecrow win an award? Because he was outstanding in his field!"
                ];
                response.text = getRandomResponse(jokes);
                response.suggestions = ["Another joke", "Tell me a fact", "Different topic"];
                return response;
            }
            
            if (msg.match(/\b(fact|interesting|learn|teach me)\b/)) {
                const facts = [
                    "Honey never spoils - archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible!",
                    "Octopuses have three hearts and blue blood.",
                    "The shortest war in history was between Britain and Zanzibar in 1896 - it lasted only 38 minutes.",
                    "Bananas are berries, but strawberries aren't."
                ];
                response.text = "Did you know?\n" + getRandomResponse(facts);
                response.suggestions = ["Another fact", "Tell me a joke", "Tech help"];
                return response;
            }
            
            // ========== TIME/DATE ==========
            if (msg.match(/\b(time|what time is it|current time)\b/)) {
                response.text = "The current time is: " + new Date().toLocaleTimeString();
                return response;
            }
            
            if (msg.match(/\b(date|today's date|what day is it)\b/)) {
                response.text = "Today is: " + new Date().toLocaleDateString();
                return response;
            }
            
            // ========== DEFAULT RESPONSE ==========
            // If we got this far, we didn't understand the question
            const unknownResponses = [
                "I'm not quite sure about that. I can help with math, tech, recommendations, and fun facts!",
                "That's an interesting question! I'm better with math problems, tech help, and recommendations.",
                "Hmm, I might not know that one. I can calculate math problems or help with other topics."
            ];
            
            response.text = getRandomResponse(unknownResponses) + "\n" +
                "- Math calculations\n" +
                "- Tech support\n" +
                "- Recommendations\n" +
                "- Fun facts/jokes";
                
            response.suggestions = ["Calculate 45 + 67", "Tech help", "Book recommendation"];
            return response;
        }
        
        function getRandomResponse(responses) {
            return responses[Math.floor(Math.random() * responses.length)];
        }