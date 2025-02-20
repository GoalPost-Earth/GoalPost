MATCH (n)
DETACH DELETE n;

WITH 
[
    "John", "Emily", "Michael", "Sarah", "David", "Jessica", "Daniel", "Sophia", "James", "Olivia",
    "Robert", "Emma", "William", "Ava", "Joseph", "Mia", "Charles", "Isabella", "Thomas", "Liam",
    "Christopher", "Grace", "Matthew", "Chloe", "Anthony", "Ella", "Andrew", "Amelia", "Joshua", "Zoe",
    "Alexander", "Lily", "Ryan", "Hannah", "Jacob", "Samantha", "Nicholas", "Natalie", "Tyler", "Victoria",
    "Benjamin", "Layla", "Samuel", "Aubrey", "Ethan", "Brooklyn", "Nathan", "Scarlett", "Logan", "Savannah",
    "Christian", "Addison", "Jonathan", "Evelyn", "Aaron", "Harper", "Justin", "Avery", "Brandon", "Mila",
    "Kevin", "Aria", "Zachary", "Ellie", "Jason", "Lillian", "Brian", "Nora", "Eric", "Hazel",
    "Adam", "Aurora", "Steven", "Riley", "Sean", "Penelope", "Charles", "Claire", "Patrick", "Skylar",
    "Mark", "Lucy", "Paul", "Paisley", "Kenneth", "Everly", "Gregory", "Anna", "George", "Caroline",
    "Joshua", "Madelyn", "Edward", "Kennedy", "Kyle", "Genesis", "Timothy", "Kinsley", "Raymond", "Allison",
    "Peter", "Maya", "Henry", "Sarah", "Jack", "Madeline", "Walter", "Alice", "Jerry", "Cora",
    "Dennis", "Ruby", "Frank", "Eva", "Lawrence", "Serenity", "Bruce", "Autumn", "Jordan", "Quinn",
    "Albert", "Piper", "Arthur", "Sophie", "Wayne", "Sadie", "Ralph", "Delilah", "Roy", "Josephine",
    "Billy", "Nevaeh", "Eugene", "Willow", "Carl", "Emilia", "Louis", "Naomi", "Russell", "Ariana",
    "Bobby", "Elena", "Philip", "Gabriella", "Johnny", "Violet", "Howard", "Stella", "Fred", "Eliana",
    "Harry", "Isla", "Randy", "Reagan", "Steve", "Emery", "Stanley", "Valentina", "Leonard", "Everleigh",
    "Dale", "Clara", "Curtis", "Vivian", "Norman", "Raelynn", "Allen", "Liliana", "Marvin", "Sophie",
    "Vincent", "Brielle", "Glenn", "Madilyn", "Jeffrey", "Jade", "Travis", "Melanie", "Bradley", "Peyton",
    "Craig", "Adeline", "Shawn", "Rylee", "Gerald", "Athena", "Keith", "Isabelle", "Roger", "Emerson",
    "Terry", "Adalynn", "Harold", "Arya", "Sean", "Eden", "Lawrence", "Remi", "Walter", "Mackenzie"
] AS firstNames,
[
    "Smith", "Johnson", "Brown", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
    "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee", "Walker", "Hall",
    "Allen", "Young", "Hernandez", "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams",
    "Baker", "Gonzalez", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell",
    "Parker", "Evans", "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook",
    "Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper", "Richardson", "Cox", "Howard", "Ward",
    "Torres", "Peterson", "Gray", "Ramirez", "James", "Watson", "Brooks", "Kelly", "Sanders", "Price",
    "Bennett", "Wood", "Barnes", "Ross", "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long",
    "Patterson", "Hughes", "Flores", "Washington", "Butler", "Simmons", "Foster", "Gonzales", "Bryant", "Alexander",
    "Russell", "Griffin", "Diaz", "Hayes", "Myers", "Ford", "Hamilton", "Graham", "Sullivan", "Wallace"
] AS lastNames,
[
    "chocolate", "coffee", "books", "music", "movies", "traveling", "nature", "fitness", "technology", "art",
    "photography", "sports", "cooking", "hiking", "painting", "gaming", "writing", "dancing", "gardening", "fishing",
    "baking", "yoga", "knitting", "cycling", "swimming", "running", "camping", "birdwatching", "pottery", "sculpting",
    "drawing", "sketching", "singing", "playing guitar", "playing piano", "playing violin", "playing drums", "acting", "theater", "opera",
    "ballet", "jazz", "blues", "rock music", "pop music", "classical music", "hip hop", "rap", "country music", "reggae",
    "salsa", "tango", "waltz", "swing", "folk music", "electronic music", "house music", "techno", "trance", "dubstep",
    "metal music", "punk rock", "indie music", "alternative music", "grunge", "ska", "funk", "soul music", "R&B", "gospel",
    "choir", "acapella", "karaoke", "DJing", "producing music", "mixing music", "composing music", "songwriting", "poetry", "storytelling",
    "novel writing", "short stories", "screenwriting", "playwriting", "journalism", "blogging", "vlogging", "podcasting", "public speaking", "debating",
    "philosophy", "psychology", "sociology", "anthropology", "history", "archaeology", "politics", "economics", "law", "business"
] AS favorites,
[
    "environment", "helping others", "innovation", "education", "healthcare", "writing", "science", "entrepreneurship", "mentorship", "spirituality",
    "technology", "art", "music", "sports", "traveling", "nature", "fitness", "photography", "cooking", "hiking",
    "painting", "gaming", "dancing", "gardening", "fishing", "baking", "yoga", "knitting", "cycling", "swimming",
    "running", "camping", "birdwatching", "pottery", "sculpting", "drawing", "sketching", "singing", "playing guitar", "playing piano",
    "playing violin", "playing drums", "acting", "theater", "opera", "ballet", "jazz", "blues", "rock music", "pop music",
    "classical music", "hip hop", "rap", "country music", "reggae", "salsa", "tango", "waltz", "swing", "folk music",
    "electronic music", "house music", "techno", "trance", "dubstep", "metal music", "punk rock", "indie music", "alternative music", "grunge",
    "ska", "funk", "soul music", "R&B", "gospel", "choir", "acapella", "karaoke", "DJing", "producing music",
    "mixing music", "composing music", "songwriting", "poetry", "storytelling", "novel writing", "short stories", "screenwriting", "playwriting", "journalism",
    "blogging", "vlogging", "podcasting", "public speaking", "debating", "philosophy", "psychology", "sociology", "anthropology", "history"
] AS passions,
[
    "kind", "ambitious", "creative", "analytical", "curious", "patient", "adventurous", "compassionate", "determined", "humble",
    "generous", "loyal", "optimistic", "practical", "reliable", "resourceful", "sincere", "thoughtful", "trustworthy", "understanding",
    "versatile", "witty", "zealous", "brave", "calm", "charming", "confident", "considerate", "courageous", "courteous",
    "diligent", "disciplined", "dynamic", "empathetic", "enthusiastic", "fair", "flexible", "friendly", "funny", "gentle",
    "hardworking", "honest", "imaginative", "independent", "intelligent", "kind-hearted", "logical", "modest", "motivated", "observant",
    "organized", "passionate", "perceptive", "persistent", "polite", "positive", "pragmatic", "proactive", "punctual", "rational",
    "respectful", "responsible", "self-disciplined", "self-reliant", "sensible", "sensitive", "sociable", "supportive", "tactful", "tenacious",
    "tolerant", "trusting", "unassuming", "unbiased", "understanding", "unselfish", "upbeat", "valiant", "vigilant", "warm",
    "wise", "youthful", "zealous", "adaptable", "affectionate", "ambitious", "amiable", "articulate", "assertive", "attentive"
] AS traits,
[
    "mental health", "education", "climate action", "animal welfare", "poverty relief", "social justice", "elderly care", "children’s welfare", "medical research", "public safety",
    "disaster relief", "community development", "human rights", "environmental conservation", "sustainable development", "gender equality", "racial equality", "LGBTQ+ rights", "refugee support", "homelessness",
    "food security", "clean water access", "sanitation", "renewable energy", "wildlife protection", "ocean conservation", "forest conservation", "urban planning", "public health", "mental health advocacy",
    "addiction recovery", "domestic violence support", "child protection", "elder abuse prevention", "disability rights", "veteran support", "youth empowerment", "women's empowerment", "men's health", "family support",
    "community policing", "crime prevention", "legal aid", "employment support", "job training", "financial literacy", "microfinance", "entrepreneurship", "small business support", "fair trade",
    "ethical fashion", "sustainable agriculture", "organic farming", "permaculture", "urban farming", "food waste reduction", "recycling", "zero waste", "circular economy", "green building",
    "energy efficiency", "clean transportation", "public transportation", "bike sharing", "car sharing", "electric vehicles", "solar energy", "wind energy", "hydropower", "geothermal energy",
    "carbon offsetting", "climate change mitigation", "climate change adaptation", "environmental education", "ecotourism", "sustainable tourism", "wildlife tourism", "cultural heritage preservation", "historic preservation", "archaeological conservation"
] AS fieldsOfCare,
[
    "reading", "coding", "photography", "sports", "cooking", "hiking", "painting", "gaming", "music", "writing",
    "dancing", "gardening", "fishing", "baking", "yoga", "knitting", "cycling", "swimming", "running", "camping",
    "birdwatching", "pottery", "sculpting", "drawing", "sketching", "singing", "playing guitar", "playing piano", "playing violin", "playing drums",
    "acting", "theater", "opera", "ballet", "jazz", "blues", "rock music", "pop music", "classical music", "hip hop",
    "rap", "country music", "reggae", "salsa", "tango", "waltz", "swing", "folk music", "electronic music", "house music",
    "techno", "trance", "dubstep", "metal music", "punk rock", "indie music", "alternative music", "grunge", "ska", "funk",
    "soul music", "R&B", "gospel", "choir", "acapella", "karaoke", "DJing", "producing music", "mixing music", "composing music",
    "songwriting", "poetry", "storytelling", "novel writing", "short stories", "screenwriting", "playwriting", "journalism", "blogging", "vlogging",
    "podcasting", "public speaking", "debating", "philosophy", "psychology", "sociology", "anthropology", "history", "archaeology", "politics"
] AS interests

FOREACH (i IN RANGE(1, 100) |
    CREATE (p:Person {
        id: 'p' + i,
        firstName: firstNames[toInteger(rand() * size(firstNames))],
        lastName: lastNames[toInteger(rand() * size(lastNames))],
        email: toLower(firstNames[toInteger(rand() * size(firstNames))] + "." + lastNames[toInteger(rand() * size(lastNames))] + "@example.com"),
        favorite: favorites[toInteger(rand() * size(favorites))],
        passion: passions[toInteger(rand() * size(passions))],
        trait: traits[toInteger(rand() * size(traits))],
        fieldOfCare: fieldsOfCare[toInteger(rand() * size(fieldsOfCare))],
        interest: interests[toInteger(rand() * size(interests))]
    })
);



// Create communities
CREATE (c1:Community {id: 'c1', name: 'Horizon Cooperative', description: 'A cooperative dedicated to sustainable living, mutual aid, and economic empowerment.'}),
       (c2:Community {id: 'c2', name: 'Green Earth Society', description: 'A community focused on environmental conservation and sustainable practices.'}),
       (c3:Community {id: 'c3', name: 'Tech Innovators', description: 'A group of tech enthusiasts working on innovative solutions for social good.'}),
       (c4:Community {id: 'c4', name: 'Health and Wellness Group', description: 'A community promoting physical and mental well-being through various activities.'}),
       (c5:Community {id: 'c5', name: 'Art and Culture Collective', description: 'A collective of artists and cultural enthusiasts sharing and promoting art and culture.'});

// Assign people to communities and create CONNECTED_TO relationships
WITH ['c1', 'c2', 'c3', 'c4', 'c5'] AS communities, range(1, 100) AS people
UNWIND communities AS communityId
WITH communityId, apoc.coll.randomItems(people, 20) AS communityMembers
UNWIND communityMembers AS personId
MATCH (p:Person {id: 'p' + personId})

MATCH (c:Community {id: communityId})
CREATE (p)-[:BELONGS_TO]->(c)
WITH communityId, communityMembers, personId
UNWIND communityMembers AS otherPersonId
WITH communityId, personId, otherPersonId
WHERE personId <> otherPersonId
MATCH (p1:Person {id: 'p' + personId})
MATCH (p2:Person {id: 'p' + otherPersonId})
CREATE (p1)-[:CONNECTED_TO {why: 'Shared interests', interests: [apoc.coll.randomItem(['environment', 'helping others', 'innovation', 'education', 'healthcare', 'writing', 'science', 'entrepreneurship', 'mentorship', 'spirituality'])]}]->(p2);


// Create core values
WITH [
    "Integrity", "Respect", "Empathy", "Compassion", "Honesty", "Accountability", "Transparency", "Inclusivity", "Diversity", "Collaboration",
    "Innovation", "Sustainability", "Responsibility", "Courage", "Perseverance", "Excellence", "Humility", "Gratitude", "Generosity", "Kindness",
    "Fairness", "Justice", "Equality", "Freedom", "Trust", "Loyalty", "Commitment", "Dedication", "Passion", "Creativity",
    "Curiosity", "Wisdom", "Patience", "Optimism", "Resilience", "Self-discipline", "Self-awareness", "Mindfulness", "Adaptability", "Flexibility",
    "Open-mindedness", "Resourcefulness", "Determination", "Teamwork", "Leadership", "Service", "Community", "Well-being", "Balance", "Joy"
] AS coreValues

FOREACH (i IN RANGE(0, size(coreValues) - 1) |
    CREATE (:CoreValue {id: 'cv' + (i + 1), name: coreValues[i], description: coreValues[i] + ' is a core value.'})
);

// Connect core values to people who are members of communities
MATCH (p:Person)-[:BELONGS_TO]->(:Community)
WITH p, collect(p) AS peopleList
UNWIND range(0, size(peopleList) - 1) AS idx
WITH peopleList[idx] AS person, apoc.coll.randomItems(range(1, 50), 5) AS coreValueIds
UNWIND coreValueIds AS coreValueId
MATCH (cv:CoreValue {id: 'cv' + coreValueId})
CREATE (person)-[:EMBRACES]->(cv);
