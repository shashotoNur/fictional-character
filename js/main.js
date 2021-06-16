const cli = document.getElementById('cli');
const cliInput = document.getElementById('cli-input');
const txtElement = document.querySelector('.txt-type');
const navBtn = document.querySelector('.nav-button');

const words = JSON.parse(txtElement.getAttribute('data-words'));
const wait = txtElement.getAttribute('data-wait');

const about = document.getElementById('about');
const contact = document.getElementById('contact');
const aboutContent = document.getElementById('about-content');
const contactContent = document.getElementById('contact-content');

const readOnlyText = cliInput.value;
const readOnlyLength = readOnlyText.length;
const timeout = 15 * 1000;

const commands =
  [
    "cd about", "cd contact",
    "commands -l",
    "findme github", "findme stack-overflow", "findme facebook", "findme discord"
  ];

const textColors   = ["#00aa00", "#1598f0", "#ec3b3b"];
const focusColors  = ["#1598f0", "#00aa00", "#00aa00"];
const warningColors= ["#ec3b3b", "#00aa00", "#1598f0"];
const bodyColors   = ["#333", "#000", "#333"];
const cliColors    = ["#000", "#04002e", "#000"];

var focusedId = 0, highestId = 0, colorIndex = 0, textColor, focusColor, warningColor, executedCommand = false;

class TypeWriter 
{
    constructor(txtElement, words, wait = 3000)
    {
      this.txtElement = txtElement;
      this.words = words;
      this.txt = '';
      this.wordIndex = 0;
      this.wait = parseInt(wait, 10);
      this.type();
      this.isDeleting = false;
    };
  
    type()
    {
      const current = this.wordIndex % this.words.length;
      const fullTxt = this.words[current];
  
      if(this.isDeleting) 
        this.txt = fullTxt.substring(0, this.txt.length - 1);
      else
        this.txt = fullTxt.substring(0, this.txt.length + 1);
  
      this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;
  
      var typeSpeed = 300;
  
      if(this.isDeleting)
        typeSpeed /= 2;
  
      if(!this.isDeleting && this.txt === fullTxt)
      {
        typeSpeed = this.wait;
        this.isDeleting = true;
      }
      else if(this.isDeleting && this.txt === '')
      {
        this.isDeleting = false;
        this.wordIndex++;
        typeSpeed = 500;
      };
  
      setTimeout(() => this.type(), typeSpeed);
    };
    
};

const executeCommand = (inputValue) =>
{
  cli.innerHTML = '';
  focusedId = 0; highestId = 0;
  var status = `<li id="0">Command successfully executed! 
                <br>Allow popups in your browser if you didn't get the desired result</li>`;

  switch(inputValue)
  {
    case commands[0]:
      about.click();
      break;
    case commands[1]:
      contact.click();
      break;
    case commands[2]:
      executedCommand = true;
      cli.innerHTML += 'List of commands you can try:';
      recommendCommands('');
      break;
    case commands[3]:
      document.getElementById('github').click();
      cli.innerHTML += status;
      break;
    case commands[4]:
      document.getElementById('stackOverflow').click();
      cli.innerHTML += status;
      break;
    case commands[5]:
      document.getElementById('facebook').click();
      cli.innerHTML += status;
      break;
    case commands[6]:
      document.getElementById('discord').click();
      cli.innerHTML += status;
      break;
    default:
      cli.innerHTML += `<li id="0" style="color: ${warningColor}">Given input is not recognized as a command</li>`;
  };
};

const insertCommand = (command = focusedId) =>
{
  if(document.getElementById(command.toString()) !== null)
    cliInput.value = readOnlyText + document.getElementById(command.toString()).innerHTML;
  if(typeof command === "string") cliInput.value = readOnlyText + command;
}

const movefocus = (keycode) =>
{
  try
  {
    document.getElementById(focusedId.toString()).style.color = textColor;

    if(keycode === 38) focusedId = (focusedId <= 0) ? highestId : focusedId-1;
    else focusedId = (focusedId >= highestId) ? 0 : focusedId + 1;

    document.getElementById(focusedId.toString()).style.color = focusColor;
  }

  catch(err)
  {
    console.log(err);
    const inputValue = cliInput.value;
    if(inputValue !== readOnlyText) recommendCommands(inputValue);
  }
}

const recommendCommands = (inputValue) =>
{
  if(!executedCommand) cli.innerHTML = '';
  executedCommand = false;

  focusedId = 0; highestId = 0;
  var id = 0;

  commands.forEach(command =>
    {
      if(command.includes(inputValue))
        cli.innerHTML += `<li id="${id++}" onclick="insertCommand('${command}')">${command}</li>`;
    });

  focusedId = 0; if(id !== 0) highestId = --id;
  if(document.getElementById("0") !== null) document.getElementById("0").style.color = focusColor;
};

const themeChanger = () =>
{
  textColor = textColors[colorIndex];
  focusColor = focusColors[colorIndex];
  warningColor = warningColors[colorIndex];

  document.documentElement.style.setProperty('--text-color', textColors[colorIndex]);
  document.documentElement.style.setProperty('--body-color', bodyColors[colorIndex]);
  document.documentElement.style.setProperty('--cli-color', cliColors[colorIndex]);

  colorIndex++;
  if(colorIndex == 3) colorIndex = 0;
  setTimeout(() => { themeChanger() }, timeout);
}

const pause = (time = 0) =>
{
    return new Promise( (resolve) =>
        {
            setTimeout(() => { resolve(); }, ( time >= 0 ) ? time : 0);
        });
};

const demonstrateCommands = async() =>
{
  await pause(2000);
  cliInput.value = `${readOnlyText}cd about`;
  cli.innerHTML += `<li id="0">Wrote a command in the terminal!(cd about)</li>`;

  await pause(2000);

  var evt = new CustomEvent('keyup');
  evt.which = 13;
  evt.keyCode = 13;
  cliInput.dispatchEvent(evt);

  cli.innerHTML += `<li id="0">Executed the command! Give it a try!</li>`;

  await pause(5000);
  executeCommand('commands -l');
  cliInput.value = readOnlyText;
}

const addWinBox = (title, top, left, mount) =>
{
  new WinBox(
    {
      title: title,
      width: '40%',
      height: '50%',
      top: top,
      left: left,
      mount: mount,
      onfocus: function () { this.setBackground('#00aa00') },
      onblur: function () { this.setBackground('#777') }
    }
  );
}

const makeInitialTextReadOnly = () =>
{

  cliInput.addEventListener('keydown', (event) =>
  {
    var which = event.which;

    if ((which == 8 && cliInput.selectionStart <= readOnlyLength) ||
        (which == 46 && cliInput.selectionStart < readOnlyLength)) 
      event.preventDefault();
  });

  cliInput.addEventListener('keypress', (event) =>
  {
    if ((event.which != 0) && (cliInput.selectionStart < readOnlyLength)) event.preventDefault();
  });

  cliInput.addEventListener('keyup', (event) =>
  {
    var inputValue = (cliInput.value).replace(readOnlyText, "");

    if (event.keyCode === 13) executeCommand(inputValue);
    else if(event.keyCode === 38 || event.keyCode === 40) movefocus(event.keyCode);
    else if(event.keyCode === 39) insertCommand();
    else recommendCommands(inputValue);
  });
}


(() =>
{
  new TypeWriter(txtElement, words, wait);
  makeInitialTextReadOnly();

  about.addEventListener('click', () =>
  {
    var title = 'about', top = 50, left = 0, mount = aboutContent;
    addWinBox(title, top, left, mount);
  });

  contact.addEventListener('click', () =>
  {
    var title = 'contact', top = 80, left = 30, mount = contactContent;
    addWinBox(title, top, left, mount);
  });

  navBtn.addEventListener('click', function()
  {
      this.parentNode.parentNode.classList.toggle('closed');
      navBtn.innerHTML = (navBtn.innerHTML.includes('ᐳ')) ? '&#5167;' :'&#5171;'
  }, false);

  themeChanger();
  demonstrateCommands()

})();