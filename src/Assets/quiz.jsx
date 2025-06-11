export const sortedListAnswers = () => {
  //map the data to a list
  let list = quizData.map((item) => ({ value: item.A, label: item.A }));
  //sort the list ascending
  const listSorted = [...list].sort((a, b) => (a.value > b.value ? 1 : -1));
  console.log("sortedListAnswers in quiz.js", listSorted);
  return listSorted;
};

export const quizData = [
  {
    Q: "What is the capital of New Zealand",
    A: "Wellington",
  },
  {
    Q: "What is New Zealand’s official name in Maori",
    A: "Aotearoa",
  },
  {
    Q: "What currency is used in New Zealand",
    A: "New Zealand Dollar",
  },
  {
    Q: "What colours are on the flag of New Zealand",
    A: "Blue, red and white",
  },
  {
    Q: "What are the two main political parties in New Zealand",
    A: "National and Labour",
  },
  {
    Q: "What is the nickname given to New Zealanders",
    A: "Kiwi(s)",
  },
  {
    Q: "Who was the first European to arrive in New Zealand",
    A: "(+ Bonus point for his nationality) Abel Tasman, Dutch",
  },
  {
    Q: "Who is New Zealand’s monarch",
    A: "King Charles",
  },
  {
    Q: "How many official languages are there in NZ",
    A: "Two. Te reo Māori (the language Māori) and New Zealand Sign Language.",
  },
  {
    Q: "What are the two national anthems of New Zealand",
    A: "(1 point each) “God defend New Zealand” and “God Save the Queen”",
  },
  {
    Q: "How tall is Aoraki Mount Cook",
    A: "3,754 metres",
  },
  {
    Q: "When did Captain Cook come to the islands",
    A: "1769",
  },
  {
    Q: "When did New Zealand gain independence from Britain",
    A: "1947",
  },
  {
    Q: "What animal can you find on a 1 dollar coin",
    A: "Kiwi",
  },
  {
    Q: "In 1893, New Zealand became the first country to do what",
    A: "Give women the right to vote",
  },
  {
    Q: "What is a Tuatara",
    A: "Reptile",
  },
  {
    Q: "When was NZ Rugby Football Union founded",
    A: "1892",
  },
  {
    Q: "When was New Zealand first Poppy Day",
    A: "1922",
  },
  {
    Q: "What is the name of the strait that separates the North and South Islands",
    A: "Cook Strait",
  },
  {
    Q: "What is the largest lake in New Zealand",
    A: "Lake Taupo",
  },
  {
    Q: "What is the largest city in New Zealand",
    A: "Auckland",
  },
  {
    Q: "What is the highest mountain peak in New Zealand",
    A: "Aoraki Mount Cook",
  },
  {
    Q: "How many regions are there in New Zealand",
    A: "16",
  },
  {
    Q: "What is the highest range of mountains in Australasia",
    A: "Southern Alps",
  },
  {
    Q: "What is the largest glacier in New Zealand",
    A: "The Tasman Glacier",
  },
  {
    Q: "On which island can you find the Canterbury Plains",
    A: "South Island",
  },
  {
    Q: "What is the longest river in New Zealand",
    A: "Waikato River",
  },
  {
    Q: "In which city can you find the Sky Tower",
    A: "Auckland",
  },
];
