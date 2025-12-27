export default {
  '**/*.js': ['eslint --fix', 'prettier --write'],
  '**/*.{html,css}': ['prettier --write'],
};
