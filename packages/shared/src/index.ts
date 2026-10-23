export type Greeting = { name: string; message: string };

export function greet(name: string): Greeting {
  return { name, message: `Hello, ${name}!` };
}
