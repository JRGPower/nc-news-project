const express = require('express')
const { getArticles, getArticleById } = require('./controllers/articles.controllers')
const { getTopics } = require('./controllers/topics.controllers')
const { invalidURL, catchAll, invalidInput, } = require('./error_handling/errors')

const app = express()

app.get('/api/topics', getTopics)

app.get('/api/articles', getArticles)
app.get('/api/articles/:article_id', getArticleById)


app.all('/*', invalidURL)

app.use(invalidInput)
app.use(catchAll)

module.exports = app