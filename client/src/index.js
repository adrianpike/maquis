// This is all placeholder for now
// Not gonna use React for size reasons, but will use something

let ws = new WebSocket(`ws://${location.host}/ws`);
const form = document.createElement('form');
document.body.appendChild(form);
  
const input = document.createElement('input');
form.appendChild(input);

form.addEventListener('submit', function(e) {
  e.preventDefault();
  ws.send(input.value);
  return false;
});

const output = document.createElement('textarea');
document.body.appendChild(output);

ws.addEventListener('message', function(evt) {
  output.innerHTML += "\n" + evt.data;
});
