import { DebateFormat } from '../types/debate';

export const defaultFormats: DebateFormat[] = [
  {
    name: "Lincoln-Douglas",
    description: "Traditional LD format with 6-3-7-3-4-6-3",
    affirmative: [
      { id: "aff-constructive", name: "Affirmative Constructive", duration: 360, allowNegative: false },
      { id: "aff-rebuttal", name: "Affirmative Rebuttal", duration: 180, allowNegative: false },
      { id: "aff-summary", name: "Affirmative Summary", duration: 240, allowNegative: false },
    ],
    negative: [
      { id: "neg-constructive", name: "Negative Constructive", duration: 420, allowNegative: false },
      { id: "neg-rebuttal", name: "Negative Rebuttal", duration: 180, allowNegative: false },
      { id: "neg-summary", name: "Negative Summary", duration: 240, allowNegative: false },
    ],
  },
  {
    name: "Public Forum",
    description: "Traditional PF format with 4-4-4-4-2-2-2-2",
    affirmative: [
      { id: "aff-speaker1", name: "First Affirmative Speaker", duration: 240, allowNegative: false },
      { id: "aff-speaker2", name: "Second Affirmative Speaker", duration: 240, allowNegative: false },
      { id: "aff-rebuttal1", name: "First Affirmative Rebuttal", duration: 120, allowNegative: false },
      { id: "aff-rebuttal2", name: "Second Affirmative Rebuttal", duration: 120, allowNegative: false },
    ],
    negative: [
      { id: "neg-speaker1", name: "First Negative Speaker", duration: 240, allowNegative: false },
      { id: "neg-speaker2", name: "Second Negative Speaker", duration: 240, allowNegative: false },
      { id: "neg-rebuttal1", name: "First Negative Rebuttal", duration: 120, allowNegative: false },
      { id: "neg-rebuttal2", name: "Second Negative Rebuttal", duration: 120, allowNegative: false },
    ],
  },
]; 