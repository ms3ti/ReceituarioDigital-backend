export function generatePassword(): string {
  const passwordLength = 6; // comprimento da senha
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // caracteres disponíveis para letra maiúscula
  const numbers = '0123456789'; // dígitos disponíveis
  const specials = '!@#$%^&*()_+-='; // caracteres especiais disponíveis

  let password = '';

  // adiciona 2 números aleatórios à senha
  for (let i = 0; i < 2; i++) {
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  // adiciona 1 letra maiúscula aleatória à senha
  password += characters.charAt(Math.floor(Math.random() * characters.length));

  // adiciona 1 caractere especial aleatório à senha
  password += specials.charAt(Math.floor(Math.random() * specials.length));

  // completa a senha com caracteres aleatórios até atingir o comprimento desejado
  for (let i = 0; i < passwordLength - 4; i++) {
    const availableCharacters = numbers + characters + specials; // caracteres disponíveis
    password += availableCharacters.charAt(
      Math.floor(Math.random() * availableCharacters.length),
    );
  }

  // embaralha os caracteres da senha
  password = password
    .split('')
    .sort(function () {
      return 0.5 - Math.random();
    })
    .join('');

  return password;
}
