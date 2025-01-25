function greeter(person: string): string {
  return `Hello, ${person}`;
}

const user: string = "World";

document.body.textContent = greeter(user);
