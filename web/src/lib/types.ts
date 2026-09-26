export type TraitMap = Record<string, number>;

export type AnswerOption = {
  id: string;
  text: string;
  traits: TraitMap;
};

export type Question = {
  id: string;
  question: string;
  answers: AnswerOption[];
};

export type PublicAnswer = {
  id: string;
  text: string;
};

export type PublicQuestion = {
  id: string;
  question: string;
  answers: PublicAnswer[];
};

export type PlayerAnswer = {
  questionId: string;
  answerId: string;
};

export type Celebrity = {
  id: string;
  name: string;
  description: string;
  avatar: string;
  traits: TraitMap;
};

export type GameResult = {
  celebrity: {
    id: string;
    name: string;
    description: string;
    avatar: string;
  };
  matchPercent: number;
  topTraits: string[];
  reasons: string[];
};

export type GamePhase =
  | "start"
  | "howto"
  | "about"
  | "loading"
  | "question"
  | "selected"
  | "thinking"
  | "result";
