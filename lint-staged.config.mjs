const typecheck = () => "npm run typecheck";

export default {
  "*.{ts,tsx}": ["eslint --fix", typecheck],
  "*.{js,mjs,cjs}": ["eslint --fix"]
};
