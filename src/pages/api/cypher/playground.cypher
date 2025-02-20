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

// Create a specific person with the email "jaedagy@gmail.com"
CREATE (p:Person {
    id: 'p101',
    firstName: 'Jae',
    lastName: 'Dagy',
    email: 'jaedagy@gmail.com',
    favorite: 'music',
    passion: 'technology',
    trait: 'creative',
    fieldOfCare: 'innovation',
    interest: 'coding',
    createdAt: datetime(),
    updatedAt: datetime()
});

// Add him to a community and connect him to other people
MATCH (p:Person {email: 'jaedagy@gmail.com'})
WITH p
MATCH (c:Community {id: 'c1'})
CREATE (p)-[:BELONGS_TO]->(c)
WITH p
MATCH (p2:Person)
WHERE p2 <> p
CREATE (p)-[:CONNECTED_TO {why: 'Shared interests', interests: [apoc.coll.randomItem(['environment', 'helping others', 'innovation', 'education', 'healthcare', 'writing', 'science', 'entrepreneurship', 'mentorship', 'spirituality'])]}]->(p2);


// Create communities
WITH [
    "Horizon Cooperative", "Green Earth Society", "Tech Innovators", "Health and Wellness Group", "Art and Culture Collective"
] AS communityNames,
[
    "A cooperative dedicated to sustainable living, mutual aid, and economic empowerment.",
    "A community focused on environmental conservation and sustainable practices.",
    "A group of tech enthusiasts working on innovative solutions for social good.",
    "A community promoting physical and mental well-being through various activities.",
    "A collective of artists and cultural enthusiasts sharing and promoting art and culture."
] AS communityDescriptions

FOREACH (i IN RANGE(1, 5) |
    CREATE (:Community {
        id: 'c' + i,
        name: communityNames[i - 1],
        description: communityDescriptions[i - 1],
        status: 'ACTIVE',
        why: 'Why for community ' + i,
        location: 'Location for community ' + i,
        time: 'Time for community ' + i,
        activities: 'Activities for community ' + i,
        resultsAchieved: 'Results achieved for community ' + i
    })
);

// Assign people to communities and create CONNECTED_TO relationships
WITH ['c1', 'c2', 'c3', 'c4', 'c5'] AS communities, range(1, 100) AS people
UNWIND communities AS communityId
WITH communityId, apoc.coll.randomItems(people, 20) AS communityMembers
UNWIND communityMembers AS personId
MATCH (p:Person {id: 'p' + personId}), (c:Community {id: communityId})
CREATE (p)-[:BELONGS_TO]->(c)
WITH communityId, communityMembers, personId
UNWIND communityMembers AS otherPersonId
WITH communityId, personId, otherPersonId
WHERE personId <> otherPersonId
MATCH (p1:Person {id: 'p' + personId}), (p2:Person {id: 'p' + otherPersonId})
CREATE (p1)-[:CONNECTED_TO {why: 'Shared interests', interests: [apoc.coll.randomItem(['environment', 'helping others', 'innovation', 'education', 'healthcare', 'writing', 'science', 'entrepreneurship', 'mentorship', 'spirituality'])]}]->(p2);

// Create core values
WITH [
    "Integrity", "Respect", "Empathy", "Compassion", "Honesty", "Accountability", "Transparency", "Inclusivity", "Diversity", "Collaboration",
    "Innovation", "Sustainability", "Responsibility", "Courage", "Perseverance", "Excellence", "Humility", "Gratitude", "Generosity", "Kindness",
    "Fairness", "Justice", "Equality", "Freedom", "Trust", "Loyalty", "Commitment", "Dedication", "Passion", "Creativity",
    "Curiosity", "Wisdom", "Patience", "Optimism", "Resilience", "Self-discipline", "Self-awareness", "Mindfulness", "Adaptability", "Flexibility",
    "Open-mindedness", "Resourcefulness", "Determination", "Teamwork", "Leadership", "Service", "Community", "Well-being", "Balance", "Joy"
] AS coreValues,
[
    "Challenge for core value 1", "Challenge for core value 2", "Challenge for core value 3", "Challenge for core value 4", "Challenge for core value 5",
    "Challenge for core value 6", "Challenge for core value 7", "Challenge for core value 8", "Challenge for core value 9", "Challenge for core value 10",
    "Challenge for core value 11", "Challenge for core value 12", "Challenge for core value 13", "Challenge for core value 14", "Challenge for core value 15",
    "Challenge for core value 16", "Challenge for core value 17", "Challenge for core value 18", "Challenge for core value 19", "Challenge for core value 20"
] AS alignmentChallenges,
[
    "Example for core value 1", "Example for core value 2", "Example for core value 3", "Example for core value 4", "Example for core value 5",
    "Example for core value 6", "Example for core value 7", "Example for core value 8", "Example for core value 9", "Example for core value 10",
    "Example for core value 11", "Example for core value 12", "Example for core value 13", "Example for core value 14", "Example for core value 15",
    "Example for core value 16", "Example for core value 17", "Example for core value 18", "Example for core value 19", "Example for core value 20"
] AS alignmentExamples,
[
    "Description for core value 1", "Description for core value 2", "Description for core value 3", "Description for core value 4", "Description for core value 5",
    "Description for core value 6", "Description for core value 7", "Description for core value 8", "Description for core value 9", "Description for core value 10",
    "Description for core value 11", "Description for core value 12", "Description for core value 13", "Description for core value 14", "Description for core value 15",
    "Description for core value 16", "Description for core value 17", "Description for core value 18", "Description for core value 19", "Description for core value 20"
] AS descriptions,
[
    "Why for core value 1", "Why for core value 2", "Why for core value 3", "Why for core value 4", "Why for core value 5",
    "Why for core value 6", "Why for core value 7", "Why for core value 8", "Why for core value 9", "Why for core value 10",
    "Why for core value 11", "Why for core value 12", "Why for core value 13", "Why for core value 14", "Why for core value 15",
    "Why for core value 16", "Why for core value 17", "Why for core value 18", "Why for core value 19", "Why for core value 20"
] AS whys

FOREACH (i IN RANGE(1, 20) |
    CREATE (:CoreValue {
        id: 'cv' + i,
        name: coreValues[i - 1],
        alignmentChallenges: alignmentChallenges[toInteger(rand() * size(alignmentChallenges))],
        alignmentExamples: alignmentExamples[toInteger(rand() * size(alignmentExamples))],
        description: descriptions[toInteger(rand() * size(descriptions))],
        why: whys[toInteger(rand() * size(whys))]
    })
);

// Connect core values to people who are members of communities
MATCH (p:Person)-[:BELONGS_TO]->(:Community)
WITH p, collect(p) AS peopleList
UNWIND range(0, size(peopleList) - 1) AS idx
WITH peopleList[idx] AS person, apoc.coll.randomItems(range(1, 50), 5) AS coreValueIds
UNWIND coreValueIds AS coreValueId
MATCH (cv:CoreValue {id: 'cv' + coreValueId})
CREATE (person)-[:EMBRACES]->(cv);

// Create goals
WITH [
    "To make my parents proud", "To achieve personal growth", "To contribute to my community", "To gain new skills", "To improve my health",
    "To help others in need", "To advance my career", "To build meaningful relationships", "To create a positive impact", "To achieve financial stability",
    "To pursue my passion", "To challenge myself", "To leave a legacy", "To inspire others", "To make a difference",
    "To achieve work-life balance", "To travel the world", "To learn new things", "To be a role model", "To achieve inner peace",
    "To support my family", "To achieve academic success", "To develop a new hobby", "To improve my mental health", "To achieve a personal milestone",
    "To give back to society", "To achieve a long-term goal", "To overcome a challenge", "To achieve a dream", "To make new friends",
    "To achieve a fitness goal", "To improve my skills", "To achieve a professional milestone", "To achieve a personal best", "To achieve a life goal",
    "To achieve a financial goal", "To achieve a health goal", "To achieve a career goal", "To achieve a relationship goal", "To achieve a spiritual goal",
    "To achieve a creative goal", "To achieve a social goal", "To achieve a community goal", "To achieve a family goal", "To achieve a personal development goal"
] AS whys,
[
    "Description for goal 1", "Description for goal 2", "Description for goal 3", "Description for goal 4", "Description for goal 5",
    "Description for goal 6", "Description for goal 7", "Description for goal 8", "Description for goal 9", "Description for goal 10",
    "Description for goal 11", "Description for goal 12", "Description for goal 13", "Description for goal 14", "Description for goal 15",
    "Description for goal 16", "Description for goal 17", "Description for goal 18", "Description for goal 19", "Description for goal 20"
] AS descriptions,
[
    "Measure success by achieving milestones for goal 1", "Measure success by achieving milestones for goal 2", "Measure success by achieving milestones for goal 3", "Measure success by achieving milestones for goal 4", "Measure success by achieving milestones for goal 5",
    "Measure success by achieving milestones for goal 6", "Measure success by achieving milestones for goal 7", "Measure success by achieving milestones for goal 8", "Measure success by achieving milestones for goal 9", "Measure success by achieving milestones for goal 10",
    "Measure success by achieving milestones for goal 11", "Measure success by achieving milestones for goal 12", "Measure success by achieving milestones for goal 13", "Measure success by achieving milestones for goal 14", "Measure success by achieving milestones for goal 15",
    "Measure success by achieving milestones for goal 16", "Measure success by achieving milestones for goal 17", "Measure success by achieving milestones for goal 18", "Measure success by achieving milestones for goal 19", "Measure success by achieving milestones for goal 20"
] AS successMeasures,
[
    "Location for goal 1", "Location for goal 2", "Location for goal 3", "Location for goal 4", "Location for goal 5",
    "Location for goal 6", "Location for goal 7", "Location for goal 8", "Location for goal 9", "Location for goal 10",
    "Location for goal 11", "Location for goal 12", "Location for goal 13", "Location for goal 14", "Location for goal 15",
    "Location for goal 16", "Location for goal 17", "Location for goal 18", "Location for goal 19", "Location for goal 20"
] AS locations,
[
    "Time for goal 1", "Time for goal 2", "Time for goal 3", "Time for goal 4", "Time for goal 5",
    "Time for goal 6", "Time for goal 7", "Time for goal 8", "Time for goal 9", "Time for goal 10",
    "Time for goal 11", "Time for goal 12", "Time for goal 13", "Time for goal 14", "Time for goal 15",
    "Time for goal 16", "Time for goal 17", "Time for goal 18", "Time for goal 19", "Time for goal 20"
] AS times,
[
    "Activities for goal 1", "Activities for goal 2", "Activities for goal 3", "Activities for goal 4", "Activities for goal 5",
    "Activities for goal 6", "Activities for goal 7", "Activities for goal 8", "Activities for goal 9", "Activities for goal 10",
    "Activities for goal 11", "Activities for goal 12", "Activities for goal 13", "Activities for goal 14", "Activities for goal 15",
    "Activities for goal 16", "Activities for goal 17", "Activities for goal 18", "Activities for goal 19", "Activities for goal 20"
] AS activities

FOREACH (id IN RANGE(1, 200) |
    CREATE (:Goal {
        id: 'g' + id,
        name: 'Goal ' + id,
        description: descriptions[toInteger(rand() * size(descriptions))],
        successMeasures: successMeasures[toInteger(rand() * size(successMeasures))],
        photo: 'https://example.com/photo' + id + '.jpg',
        activities: activities[toInteger(rand() * size(activities))],
        status: 'ACTIVE',
        why: whys[toInteger(rand() * size(whys))],
        location: locations[toInteger(rand() * size(locations))],
        time: times[toInteger(rand() * size(times))]
    })
);

// Create resources
WITH [
    "To provide essential services", "To support community initiatives", "To offer educational opportunities", "To promote health and wellness", "To provide financial assistance",
    "To support environmental conservation", "To offer recreational activities", "To provide mental health support", "To offer career development opportunities", "To support social justice initiatives",
    "To provide housing assistance", "To offer legal support", "To provide food security", "To support disaster relief efforts", "To offer transportation services",
    "To provide childcare services", "To support elderly care", "To offer technology resources", "To provide cultural enrichment", "To support arts and culture",
    "To offer language learning opportunities", "To provide job training", "To support entrepreneurship", "To offer mentorship programs", "To provide healthcare services",
    "To support addiction recovery", "To offer financial literacy programs", "To provide clean water access", "To support renewable energy projects", "To offer community building activities",
    "To provide emergency services", "To support animal welfare", "To offer sports and fitness programs", "To provide mental health education", "To support sustainable agriculture",
    "To offer environmental education", "To provide disaster preparedness training", "To support refugee assistance", "To offer legal aid", "To provide public safety services",
    "To support community policing", "To offer youth empowerment programs", "To provide women's empowerment programs", "To support men's health initiatives", "To offer family support services",
    "To provide community development resources", "To support crime prevention", "To offer employment support", "To provide job placement services", "To support fair trade initiatives"
] AS resourceWhys,
[
    "Description for resource 1", "Description for resource 2", "Description for resource 3", "Description for resource 4", "Description for resource 5",
    "Description for resource 6", "Description for resource 7", "Description for resource 8", "Description for resource 9", "Description for resource 10",
    "Description for resource 11", "Description for resource 12", "Description for resource 13", "Description for resource 14", "Description for resource 15",
    "Description for resource 16", "Description for resource 17", "Description for resource 18", "Description for resource 19", "Description for resource 20"
] AS resourceDescriptions

FOREACH (id IN RANGE(1, 500) |
    CREATE (:Resource {
        id: 'r' + id,
        name: 'Resource ' + id,
        description: resourceDescriptions[toInteger(rand() * size(resourceDescriptions))],
        status: 'ACTIVE',
        why: resourceWhys[toInteger(rand() * size(resourceWhys))],
        location: 'Location for resource ' + id,
        time: 'Time for resource ' + id
    })
);

// Connect 200 goals and 200 resources to people who are community members
MATCH (p:Person)-[:BELONGS_TO]->(:Community)
WITH p, collect(p) AS communityMembers
UNWIND range(1, 200) AS id
WITH communityMembers, id
MATCH (g:Goal {id: 'g' + id}), (r:Resource {id: 'r' + id})
WITH communityMembers[toInteger(rand() * size(communityMembers))] AS member, g, r
CREATE (member)-[:MOTIVATED_BY]->(g)
CREATE (member)-[:PROVIDES]->(r);

// Connect 300 resources to people who are not community members
MATCH (p:Person)
WHERE NOT (p)-[:BELONGS_TO]->(:Community)
WITH p, collect(p) AS nonCommunityMembers
UNWIND range(201, 500) AS id
WITH nonCommunityMembers, id
MATCH (r:Resource {id: 'r' + id})
WITH nonCommunityMembers[toInteger(rand() * size(nonCommunityMembers))] AS nonMember, r
CREATE (nonMember)-[:PROVIDES]->(r);

// Create carepoints
WITH [
    "CarePoint 1", "CarePoint 2", "CarePoint 3", "CarePoint 4", "CarePoint 5",
    "CarePoint 6", "CarePoint 7", "CarePoint 8", "CarePoint 9", "CarePoint 10",
    "CarePoint 11", "CarePoint 12", "CarePoint 13", "CarePoint 14", "CarePoint 15",
    "CarePoint 16", "CarePoint 17", "CarePoint 18", "CarePoint 19", "CarePoint 20"
] AS carePointNames,
[
    "Description for care point 1", "Description for care point 2", "Description for care point 3", "Description for care point 4", "Description for care point 5",
    "Description for care point 6", "Description for care point 7", "Description for care point 8", "Description for care point 9", "Description for care point 10",
    "Description for care point 11", "Description for care point 12", "Description for care point 13", "Description for care point 14", "Description for care point 15",
    "Description for care point 16", "Description for care point 17", "Description for care point 18", "Description for care point 19", "Description for care point 20"
] AS carePointDescriptions

FOREACH (id IN RANGE(1, 20) |
    CREATE (:CarePoint {
        id: 'cp' + id,
        name: carePointNames[toInteger(rand() * size(carePointNames))],
        description: carePointDescriptions[toInteger(rand() * size(carePointDescriptions))],
        status: 'ACTIVE',
        why: 'Why for care point ' + id,
        location: 'Location for care point ' + id,
        time: 'Time for care point ' + id,
        levelFulfilled: 'Level fulfilled for care point ' + id,
        fulfillmentDate: 'Fulfillment date for care point ' + id,
        successMeasures: 'Success measures for care point ' + id,
        issuesIdentified: 'Issues identified for care point ' + id,
        issuesResolved: 'Issues resolved for care point ' + id
    })
);

// Connect carepoints to resources, goals, and people
MATCH (cp:CarePoint), (r:Resource), (g:Goal), (p:Person)
WITH cp, r, g, p
WHERE rand() < 0.1
CREATE (cp)-[:DEPENDS_ON]->(r)
CREATE (cp)-[:ENABLED_BY]->(g)
CREATE (cp)-[:CARES_FOR]->(g)
CREATE (p)-[:MOTIVATED_BY]->(g)
CREATE (p)-[:PROVIDES]->(r);
