-- Add sample questions for testing quick match functionality

INSERT INTO public.multiplayer_quiz_questions (question, options, correct_answer, difficulty, time_limit, category) VALUES
-- General Knowledge
('What is the capital of Japan?', '["Tokyo", "Kyoto", "Osaka", "Yokohama"]', 'Tokyo', 'easy', 10, 'General'),
('Which planet is known as the Red Planet?', '["Venus", "Mars", "Jupiter", "Saturn"]', 'Mars', 'easy', 10, 'General'),
('What is the largest ocean on Earth?', '["Atlantic", "Indian", "Arctic", "Pacific"]', 'Pacific', 'easy', 10, 'General'),
('Who painted the Mona Lisa?', '["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"]', 'Da Vinci', 'medium', 15, 'General'),
('What year did World War I begin?', '["1914", "1915", "1916", "1917"]', '1914', 'medium', 15, 'General'),

-- Science
('What is the chemical symbol for gold?', '["Go", "Gd", "Au", "Ag"]', 'Au', 'medium', 15, 'Science'),
('What is the hardest natural substance on Earth?', '["Steel", "Iron", "Diamond", "Platinum"]', 'Diamond', 'easy', 10, 'Science'),
('What is the largest organ in the human body?', '["Heart", "Brain", "Liver", "Skin"]', 'Skin', 'easy', 10, 'Science'),
('What is the atomic number of carbon?', '["4", "6", "8", "12"]', '6', 'medium', 15, 'Science'),
('What is the speed of light?', '["186,000 mph", "186,000 km/s", "186,000 m/s", "186,000 km/h"]', '186,000 km/s', 'hard', 20, 'Science'),

-- History
('Who was the first President of the United States?', '["John Adams", "Thomas Jefferson", "George Washington", "Benjamin Franklin"]', 'George Washington', 'easy', 10, 'History'),
('In which year did Columbus discover America?', '["1492", "1493", "1494", "1495"]', '1492', 'medium', 15, 'History'),
('What was the name of the ship that sank in 1912?', '["Lusitania", "Titanic", "Britannic", "Olympic"]', 'Titanic', 'easy', 10, 'History'),
('Who was the first Emperor of Rome?', '["Julius Caesar", "Augustus", "Nero", "Caligula"]', 'Augustus', 'medium', 15, 'History'),
('What year did the Berlin Wall fall?', '["1987", "1988", "1989", "1990"]', '1989', 'medium', 15, 'History'),

-- Technology
('What does CPU stand for?', '["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Computer Processing Unit"]', 'Central Processing Unit', 'easy', 10, 'Technology'),
('Who founded Microsoft?', '["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Elon Musk"]', 'Bill Gates', 'easy', 10, 'Technology'),
('What year was the first iPhone released?', '["2005", "2006", "2007", "2008"]', '2007', 'medium', 15, 'Technology'),
('What does HTML stand for?', '["HyperText Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"]', 'HyperText Markup Language', 'medium', 15, 'Technology'),
('What is the main programming language of Android?', '["Java", "Python", "Swift", "C#"]', 'Java', 'medium', 15, 'Technology'),

-- Sports
('Which country has won the most FIFA World Cups?', '["Germany", "Brazil", "Argentina", "Italy"]', 'Brazil', 'easy', 10, 'Sports'),
('What is the national sport of Japan?', '["Sumo", "Karate", "Judo", "Baseball"]', 'Sumo', 'medium', 15, 'Sports'),
('How many players are on a basketball team?', '["4", "5", "6", "7"]', '5', 'easy', 10, 'Sports'),
('What year was the first modern Olympics held?', '["1896", "1900", "1904", "1908"]', '1896', 'medium', 15, 'Sports'),
('Which sport uses the term "love"?', '["Golf", "Tennis", "Badminton", "Table Tennis"]', 'Tennis', 'easy', 10, 'Sports');
