function extractQuizJson(content) {
  const match = content.match(/```(quiz|json)\s*([\s\S]*?)\s*```/);
  if (!match || match.length < 3) {
    throw new Error("Cannot find quiz JSON in the provided content.");
  }
  console.log(match);

  let quizJson = match[2].trim();
  if (match[1] === "json") {
    // If the match starts with "json", remove the prefix
    quizJson = quizJson.replace(/^json\s*/, "");
  }
  console.log(quizJson);

  // Remove trailing ``` characters, regardless of their count
  quizJson = quizJson.replace(/```+$/, "").trim();
  console.log(quizJson);
  return quizJson;
}

const quizContent = `
\`\`\`json
\`\`\`quiz

{
  "title": "Эпоха Великих реформ: правление Александра II",
  "completionTime": "10",
  "questions": [
    {
      "questionType": "MCQ",
      "stimulus": "Когда началось правление Александра II?",
      "choices": [
        {
          "content": "1825 г."
        },
        {
          "content": "1855 г.",
          "correctAnswerDescription": "Александр II вступил на престол в 1855 году после смерти своего отца Николая I."
        },
        {
          "content": "1881 г."
        },
        {
          "content": "1894 г."
        }
      ],
      "answers": [
        "1855 г."
      ]
    },
    {
      "questionType": "OEQ",
      "stimulus": "Какое событие по мнению историков подтолкнуло Александра II к проведению реформ?",
      "prompt": "Кратко опишите событие",
      "answers": [
        "Крымская война",
        "Поражение в Крымской войне"
      ]
    },
    {
      "questionType": "MRQ",
      "stimulus": "Какие реформы были проведены в период правления Александра II?",
      "choices": [
        {
          "content": "Отмена крепостного права",
          "correctAnswerDescription": "Одна из ключевых реформ Александра II"
        },
        {
          "content": "Внедрение всеобщего школьного образования"
        },
        {
          "content": "Создание земств",
          "correctAnswerDescription": "Земская реформа создала органы местного самоуправления"
        },
        {
          "content": "Введение республиканской формы правления"
        },
        {
          "content": "Судебная реформа",
          "correctAnswerDescription": "Судебная реформа сделала правосудие более современным и независимым"
        }
      ],
      "answers": [
        "Отмена крепостного права",
        "Создание земств",
        "Судебная реформа"
      ]
    },
    {
      "questionType": "CLOZE",
      "stimulus": "За что Александр II получил название {1:SHORT_ANSWER}?",
      "choices": [],
      "answers": [
        "Освободитель"
      ]
    },
    {
      "questionType": "MCQ",
      "stimulus": "В каком году был убит Александр II?",
      "choices": [
        {
          "content": "1881 г.",
          "correctAnswerDescription": "Александр II погиб в результате террористического акта 1 марта 1881 года."
        },
        {
          "content": "1894 г."
        },
        {
          "content": "1905 г."
        },
        {
          "content": "1917 г."
        }
      ],
      "answers": [
        "1881 г."
      ]
    }
  ]
}
\`\`\`
\`\`\`
`;
extractQuizJson(quizContent);
