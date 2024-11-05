import { spawn } from 'child_process';

const child = spawn('npm', ['run', 'cypress:install'], {
  stdio: 'inherit'
});

child.on('close', code => {
  if (code) {
    console.error('Cypress installation failed with code:', code);
  }
});

child.on('error', error => {
  console.error('Cypress installation error:', error);
});
