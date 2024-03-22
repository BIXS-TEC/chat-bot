const matchedContext = [
    { activationKeywords: ['1', '3']},
    { activationKeywords: ['1', '2']},
    { activationKeywords: ['4', '3']},
    { activationKeywords: ['2', '4']},
    { activationKeywords: ['6', '3']},
];

for (let i = matchedContext.length - 1; (i) >= 0; i--) {
  if (matchedContext.length > 1) {
    if (!matchedContext[i].activationKeywords.includes("3")) {
      matchedContext.splice(i, 1);
    }
  }
}
console.log(matchedContext);
