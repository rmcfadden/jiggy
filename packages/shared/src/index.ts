export type Greeting = { name: string; message: string };

export function greet(name: string): Greeting {
  return { name, message: `Hello, ${name}!` };
}

export * from "./piece-generator";
export * from "./svg";
export * from "./jigsaw-template";
export * from "./jigsaw-vectorizer";
export * from "./puzzle";
export * from "./jigsaw-verifier";
