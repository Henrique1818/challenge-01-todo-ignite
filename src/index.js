const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if(!user) return response.status(404).json({ error: 'User not found!'});

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;
  const userAlreadyExists = users.some(user => user.username === username);

  if(userAlreadyExists) return response.status(400).json({ error: 'User already exists!' });

  users.push({
    id: uuidv4(),
    username,
    name,
    todos: []
  });

  return response.status(201).json(users);  
});


app.get('/todos', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const todos = user.todos;

  return response.status(200).json(todos);
});

app.post('/todos', checkExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const taskAlreadyExists = user.todos.some(task => task.title === title);

  if(taskAlreadyExists) return response.status(400).json({ error: 'Task already exists' });

  const newTask = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTask);

  return response.status(201).json(newTask);
});

app.put('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const task = user.todos.find(task => task.id === id);

  if(!task) return response.status(404).json({ error: 'Task not found' });

  task.title = title;
  task.deadline = new Date(deadline);

  return response.status(200).json(task);
});

app.patch('/todos/:id/done', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const task = user.todos.find(task => task.id === id);
  if(!task) return response.status(404).json({ error: 'Task not found' });

  task.done = true;

  return response.status(200).json(task);
});

app.delete('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
 
  const task = user.todos.find(task => task.id === id);
  if(!task) return response.status(404).json({ error: 'Task not found' });

  user.todos.splice(task, 1);

  return response.status(200).json({ message: 'Remove task' });
});

app.listen(3333);