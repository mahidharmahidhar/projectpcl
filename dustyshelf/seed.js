// seed.js — Run with: node seed.js
// Generates 400 realistic book records and uploads to Firestore

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// ── PASTE YOUR FIREBASE CONFIG HERE ─────────────────────────────────────────
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Book Data Pool ───────────────────────────────────────────────────────────
const conditions = ["Like New", "Good", "Acceptable"];
const categories = {
  Fiction:     ["The Midnight Library","The Kite Runner","A Little Life","Normal People","The Road","Life of Pi","Atonement","The Secret History","Never Let Me Go","Beloved","The Lovely Bones","White Noise","Everything is Illuminated","The Corrections","Americanah","The Remains of the Day","On Earth We're Briefly Gorgeous","Lincoln in the Bardo","A Gentleman in Moscow","The God of Small Things","Shuggie Bain","Hamnet","The Goldfinch","A Man Called Ove","The Shadow of the Wind","The House on Mango Street","Their Eyes Were Watching God","The Brief Wondrous Life of Oscar Wao","The Curious Incident of the Dog in the Night-Time","The Perks of Being a Wallflower","Room","Where the Crawdads Sing","Big Little Lies","The Girl on the Train","Gone Girl","The Woman in the Window","Behind Closed Doors","The Silent Patient","The Couple Next Door","Verity","It Ends with Us","Beautiful Boy","Three Women","A Little Life","Daisy Jones & The Six","Firefly Lane","Lessons in Chemistry","Tomorrow, and Tomorrow, and Tomorrow","The Seven Husbands of Evelyn Hugo","People We Meet on Vacation"],
  Classic:     ["Pride and Prejudice","1984","To Kill a Mockingbird","The Great Gatsby","Of Mice and Men","Brave New World","Jane Eyre","Wuthering Heights","Crime and Punishment","The Brothers Karamazov","Anna Karenina","War and Peace","Moby Dick","Don Quixote","The Odyssey","Hamlet","Macbeth","The Canterbury Tales","Middlemarch","Sense and Sensibility","Emma","Persuasion","Great Expectations","David Copperfield","A Tale of Two Cities","The Picture of Dorian Gray","Frankenstein","Dracula","The Call of the Wild","The Old Man and the Sea","For Whom the Bell Tolls","A Farewell to Arms","The Sun Also Rises","As I Lay Dying","The Sound and the Fury","Light in August","Absalom Absalom","Catch-22","Slaughterhouse-Five","The Catcher in the Rye","Lord of the Flies","Animal Farm","One Flew Over the Cuckoo's Nest","The Grapes of Wrath","East of Eden","Cannery Row","Of Mice and Men","Fahrenheit 451","The Stranger","Nausea"],
  NonFiction:  ["Sapiens","Homo Deus","21 Lessons for the 21st Century","A Short History of Nearly Everything","The Body","Thinking, Fast and Slow","Outliers","The Tipping Point","Blink","David and Goliath","Freakonomics","Superfreakonomics","The Innovators","Steve Jobs","Elon Musk","Bad Blood","The Big Short","Flash Boys","Liar's Poker","When Genius Failed","The Black Swan","Antifragile","Fooled by Randomness","Guns, Germs, and Steel","The Third Chimpanzee","The Selfish Gene","A Brief History of Time","The Grand Design","Cosmos","Pale Blue Dot","The Demon-Haunted World","The Emperor of All Maladies","Being Mortal","When Breath Becomes Air","The Spirit Catches You","Mountains Beyond Mountains","Complications","Better","The Checklist Manifesto","How We Die","Say Nothing","The Journalist and the Murderer","The Lost City of Z","Into Thin Air","Touching the Void","Into the Wild","Wild","H is for Hawk","The Diving Bell and the Butterfly","Let Us Now Praise Famous Men"],
  SelfHelp:    ["Atomic Habits","The 7 Habits of Highly Effective People","Think and Grow Rich","How to Win Friends and Influence People","The Power of Habit","Deep Work","Digital Minimalism","Cal Newport So Good They Can't Ignore You","The 4-Hour Workweek","Getting Things Done","Essentialism","The One Thing","Eat That Frog","The Miracle Morning","The 5AM Club","Tools of Titans","Tribe of Mentors","The Tim Ferriss Show Transcripts","Principles","Skin in the Game","The Subtle Art of Not Giving a F*ck","Everything is F*cked","Can't Hurt Me","Mindset","Grit","Daring Greatly","Braving the Wilderness","Gifts of Imperfection","Rising Strong","The Body Keeps the Score","Untamed","Big Magic","Year of Yes","Educated","Becoming","I Know Why the Caged Bird Sings","Man's Search for Meaning","The Alchemist","The Monk Who Sold His Ferrari","The Power of Now","A New Earth","Stillness is the Key","Ego is the Enemy","The Obstacle is the Way","Meditations","Letters from a Stoic","How to Think Like a Roman Emperor","The Daily Stoic","Courage is Calling","Discipline is Destiny"],
  Fantasy:     ["The Lord of the Rings","The Hobbit","A Game of Thrones","A Clash of Kings","A Storm of Swords","The Name of the Wind","The Wise Man's Fear","Harry Potter and the Philosopher's Stone","Harry Potter and the Chamber of Secrets","Harry Potter and the Prisoner of Azkaban","The Way of Kings","Words of Radiance","Oathbringer","Rhythm of War","Mistborn","The Well of Ascension","The Hero of Ages","Elantris","The Final Empire","Warbreaker","The Blade Itself","Before They Are Hanged","Last Argument of Kings","Best Served Cold","The Heroes","Red Country","The Lies of Locke Lamora","Red Seas under Red Skies","The Republic of Thieves","American Gods","Anansi Boys","Good Omens","Small Gods","Mort","Colour of Magic","Light Fantastic","Equal Rites","Sourcery","Wyrd Sisters","Reaper Man","The Golden Compass","The Subtle Knife","The Amber Spyglass","Eragon","Eldest","Brisingr","Inheritance","The Sword of Kaigen","The Dragon Republic","The Poppy War"],
  SciFi:       ["Dune","Dune Messiah","Children of Dune","Foundation","Foundation and Empire","Second Foundation","The Hitchhiker's Guide to the Galaxy","The Restaurant at the End of the Universe","Life, the Universe and Everything","So Long, and Thanks for All the Fish","Mostly Harmless","Ender's Game","Speaker for the Dead","Xenocide","Children of the Mind","Neuromancer","Count Zero","Mona Lisa Overdrive","Snow Crash","The Diamond Age","Cryptonomicon","The Martian","Artemis","Project Hail Mary","Old Man's War","The Ghost Brigades","The Last Colony","Zoe's Tale","Ancillary Justice","Ancillary Sword","Ancillary Mercy","The Left Hand of Darkness","The Dispossessed","The Word for World is Forest","Do Androids Dream of Electric Sheep?","A Scanner Darkly","Ubik","The Man in the High Castle","Flowers for Algernon","I, Robot","The Caves of Steel","The Naked Sun","The Robots of Dawn","2001: A Space Odyssey","Childhood's End","Rendezvous with Rama","The Songs of Distant Earth","The City and the Stars","Against the Fall of Night","Ringworld"],
  Academic:    ["Introduction to Algorithms","The Art of Computer Programming","Structure and Interpretation of Computer Programs","Clean Code","The Pragmatic Programmer","Design Patterns","Refactoring","Code Complete","Head First Design Patterns","Introduction to the Theory of Computation","Computer Networks","Operating System Concepts","Computer Organization and Architecture","Database System Concepts","Artificial Intelligence: A Modern Approach","Pattern Recognition and Machine Learning","Deep Learning","Reinforcement Learning","Linear Algebra Done Right","Abstract Algebra","Real Analysis","Complex Analysis","Calculus by Apostol","Principles of Mathematical Analysis","Topology","Algebraic Topology","Differential Geometry","Probability and Statistics","Statistical Inference","Bayesian Data Analysis","The Elements of Statistical Learning","Introduction to Statistical Learning","Data Mining Concepts","Computer Vision","Natural Language Processing with Python","Speech and Language Processing","Information Theory","Cryptography and Network Security","Computer Security","The Art of Intrusion","Hacking: The Art of Exploitation","Principles of Economics","Microeconomic Theory","Macroeconomics","International Economics","Game Theory","A Random Walk Down Wall Street","Security Analysis","The Intelligent Investor","Corporate Finance"],
  Biography:   ["Becoming","The Story of My Experiments with Truth","Long Walk to Freedom","I Am Malala","The Diary of a Young Girl","Night","Mein Kampf","The Autobiography of Malcolm X","My Experiments with Truth","Wings of Fire","Playing It My Way","Open","Agassi Open","Andre Agassi My Story","Born a Crime","Brain on Fire","The Glass Castle","A Child Called It","A Boy Called It","The Liar's Club","Angela's Ashes","This Boy's Life","The Color of Water","Educated","The Storyteller","The Best We Could Do","Persepolis","Fun Home","When Things Fall Apart","Between the World and Me","Just Mercy","Say Nothing","The Feather Thief","The Art Thief","The Lost Painting","The Goldfinch","Picasso","Da Vinci by Isaacson","Benjamin Franklin","Einstein His Life","The Last Lion","Churchill Walking with Destiny","Napoleon","Alexander the Great","Julius Caesar","Augustus","Cleopatra","Catherine the Great","Peter the Great","Genghis Khan"],
  Mystery:     ["Gone Girl","The Girl with the Dragon Tattoo","The Girl Who Played with Fire","The Girl Who Kicked the Hornet's Nest","Big Little Lies","The Silent Patient","In the Woods","The Likeness","Faithful Place","Broken Harbor","The Secret Place","The Trespasser","And Then There Were None","Murder on the Orient Express","Death on the Nile","The ABC Murders","Crooked House","A Murder is Announced","The Seven Dials Mystery","Curtain","Sleeping Murder","The Mirror Crack'd from Side to Side","Evil Under the Sun","Appointment with Death","Cards on the Table","Five Little Pigs","Towards Zero","Sparkling Cyanide","The Hollow","Taken at the Flood","The Mysterious Mr Quin","Parker Pyne Investigates","The Regatta Mystery","The Listerdale Mystery","The Hound of the Baskervilles","A Study in Scarlet","The Sign of Four","The Adventures of Sherlock Holmes","The Memoirs of Sherlock Holmes","The Return of Sherlock Holmes","His Last Bow","The Case-Book of Sherlock Holmes","The Valley of Fear","The Final Problem","A Scandal in Bohemia","The Red-Headed League","The Speckled Band","Silver Blaze","The Dancing Men"],
};

const authors = {
  Fiction:["Matt Haig","Khaled Hosseini","Hanya Yanagihara","Sally Rooney","Cormac McCarthy","Yann Martel","Ian McEwan","Donna Tartt","Kazuo Ishiguro","Toni Morrison"],
  Classic:["Jane Austen","George Orwell","Harper Lee","F. Scott Fitzgerald","John Steinbeck","Aldous Huxley","Charlotte Brontë","Emily Brontë","Fyodor Dostoevsky","Leo Tolstoy"],
  NonFiction:["Yuval Noah Harari","Bill Bryson","Malcolm Gladwell","Walter Isaacson","Michael Lewis","Nassim Taleb","Jared Diamond","Richard Dawkins","Stephen Hawking","Carl Sagan"],
  SelfHelp:["James Clear","Stephen Covey","Napoleon Hill","Dale Carnegie","Charles Duhigg","Cal Newport","Mark Manson","David Goggins","Carol Dweck","Angela Duckworth"],
  Fantasy:["J.R.R. Tolkien","George R.R. Martin","Patrick Rothfuss","J.K. Rowling","Brandon Sanderson","Joe Abercrombie","Scott Lynch","Neil Gaiman","Terry Pratchett","Philip Pullman"],
  SciFi:["Frank Herbert","Douglas Adams","Orson Scott Card","William Gibson","Neal Stephenson","Andy Weir","John Scalzi","Ann Leckie","Ursula K. Le Guin","Philip K. Dick"],
  Academic:["Thomas H. Cormen","Donald E. Knuth","Harold Abelson","Robert C. Martin","David Thomas","Erich Gamma","Martin Fowler","Michael T. Goodrich","Steven S. Skiena","Kevin Murphy"],
  Biography:["Michelle Obama","Mahatma Gandhi","Nelson Mandela","Malala Yousafzai","Anne Frank","Elie Wiesel","Malcolm X","A.P.J. Abdul Kalam","Sachin Tendulkar","Andre Agassi"],
  Mystery:["Gillian Flynn","Stieg Larsson","Liane Moriarty","Alex Michaelides","Tana French","Agatha Christie","Arthur Conan Doyle","Daphne du Maurier","P.D. James","Ruth Rendell"],
};

const descriptions = {
  Fiction:   "A powerful work of literary fiction exploring the complexities of human emotion, identity, and resilience through richly drawn characters.",
  Classic:   "A timeless classic that has defined generations of readers with its enduring themes and masterful prose style.",
  NonFiction:"A meticulously researched work that illuminates the world around us with insight, data, and compelling storytelling.",
  SelfHelp:  "A practical guide packed with actionable strategies to help you build better habits, maximize performance, and transform your life.",
  Fantasy:   "An epic tale of magic, power, and adventure set in a richly imagined world where nothing is as it seems.",
  SciFi:     "A visionary science fiction novel that challenges our assumptions about humanity, technology, and the future.",
  Academic:  "A comprehensive and authoritative text widely used by students and professionals for its clarity and depth.",
  Biography: "An intimate and revealing portrait of an extraordinary life, written with honesty, courage, and remarkable insight.",
  Mystery:   "A gripping thriller that keeps you guessing until the very last page, with twists that defy all expectations.",
};

const coverImages = [
  "https://covers.openlibrary.org/b/id/10527843-L.jpg",
  "https://covers.openlibrary.org/b/id/10286124-L.jpg",
  "https://covers.openlibrary.org/b/id/8575708-L.jpg",
  "https://covers.openlibrary.org/b/id/8714263-L.jpg",
  "https://covers.openlibrary.org/b/id/8228691-L.jpg",
  "https://covers.openlibrary.org/b/id/8739161-L.jpg",
  "https://covers.openlibrary.org/b/id/10110415-L.jpg",
  "https://covers.openlibrary.org/b/id/8257091-L.jpg",
  "https://covers.openlibrary.org/b/id/10451983-L.jpg",
  "https://covers.openlibrary.org/b/id/8228228-L.jpg",
  "https://covers.openlibrary.org/b/id/8746169-L.jpg",
  "https://covers.openlibrary.org/b/id/8302946-L.jpg",
  "https://covers.openlibrary.org/b/id/12290670-L.jpg",
  "https://covers.openlibrary.org/b/id/9257016-L.jpg",
  "https://covers.openlibrary.org/b/id/10475456-L.jpg",
  "https://covers.openlibrary.org/b/id/8714507-L.jpg",
  "https://covers.openlibrary.org/b/id/7984916-L.jpg",
  "https://covers.openlibrary.org/b/id/8091016-L.jpg",
  "https://covers.openlibrary.org/b/id/8474036-L.jpg",
  "https://covers.openlibrary.org/b/id/9255566-L.jpg",
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, dp=1) { return parseFloat((Math.random() * (max - min) + min).toFixed(dp)); }
function randPrice() { return [100,149,179,199,229,249,279,299,349,379,399,449,499,549,599,699,749,799,899,999][randInt(0,19)]; }

// ── Generate 400 books ────────────────────────────────────────────────────────
async function seed() {
  const books = [];
  const categoryKeys = Object.keys(categories);
  const perCategory = Math.ceil(400 / categoryKeys.length); // ~45 per category

  for (const cat of categoryKeys) {
    const titlesPool = categories[cat];
    const authorsPool = authors[cat];
    const count = cat === "Fiction" ? 55 : cat === "Classic" ? 50 : cat === "NonFiction" ? 50 : perCategory;
    
    for (let i = 0; i < count && books.length < 400; i++) {
      books.push({
        title:       titlesPool[i % titlesPool.length] + (i >= titlesPool.length ? ` Vol.${Math.floor(i/titlesPool.length)+1}` : ""),
        author:      authorsPool[i % authorsPool.length],
        category:    cat === "NonFiction" ? "Non-Fiction" : cat === "SelfHelp" ? "Self-Help" : cat,
        price:       randPrice(),
        condition:   rand(conditions),
        description: descriptions[cat],
        image:       coverImages[i % coverImages.length],
        rating:      randFloat(3.5, 5.0),
        stock:       randInt(1, 20),
      });
    }
  }

  console.log(`📚 Generated ${books.length} books. Starting upload...`);

  let done = 0;
  for (const book of books) {
    try {
      await addDoc(collection(db, "books"), {
        ...book,
        createdAt: serverTimestamp()
      });
      done++;
      if (done % 20 === 0) console.log(`  ✅ Uploaded ${done}/${books.length}`);
    } catch (e) {
      console.error(`  ❌ Failed at book "${book.title}":`, e.message);
    }
  }

  console.log(`\n🎉 Done! ${done} books added to Firestore.`);
  process.exit(0);
}

seed();
