const axios = require('axios');
const he = require('he');

const fetchQuestion = () =>
  axios.get('https://opentdb.com/api.php?amount=1&type=multiple')
    .then(({ data: { results } }) => results[0]);

const sendCongrats = res =>
  res.send('That is correct!');

const renderAnswerOptions = (options) => {
  return options.map((item) => {
    return `${item.key}. ${item.value} \n`;
  })
  .join('');
}

const shuffle = (array) => {
  let currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array.map((item, idx) => {
    return {
      value: item,
      key: idx + 1,
    };
  });
}

module.exports = (robot) => {
  let answer = '';

  const generateNewQuestion = (res) => {
    fetchQuestion()
      .then((trivia) => {
        const answerOptions = shuffle(trivia.incorrect_answers.concat(trivia.correct_answer));
        const question = `${he.decode(trivia.question)} \n \n ${renderAnswerOptions(answerOptions)}`;

        res.send(question);

        answer = he.decode(trivia.correct_answer);
        robot.hear(answer, sendCongrats);
      });
  };

  robot.hear(/question/i, generateNewQuestion);
  robot.hear('give', res => res.send(`You suck: ${answer}`));
}
