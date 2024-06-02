export class ChoiceBase {
  content: string;
  quizId: string;
  interactionId?: string;
}

export class InteractionBase {
  answers: string[];
  quizId?: string;

  choices: ChoiceBase[];
}

export class MatchingInteractionBase {
  left: object;
  right: object;
  answers: string[];
}
