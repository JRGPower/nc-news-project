const express = require('express')
const { getArticles, getArticleById, getArticleComments, postArticleComment, patchArticle } = require('./controllers/articles.controllers')
const { deleteComment } = require('./controllers/comments.controllers')
const { getTopics } = require('./controllers/topics.controllers')
const { getUsers } = require('./controllers/users.controllers')
const { invalidURL, catchAll, invalidInput, } = require('./error_handling/errors')
const { readFile } = require('fs/promises')

const app = express()
app.use(express.json())

app.get('/api', (req, res, next) => {
    return readFile(`${__dirname}/db/endpoints.json`, "utf8").then((data) => {
        res.send(JSON.parse(data))
    })
})

app.get('/api/topics', getTopics)

app.get("/api/users", getUsers)

app.delete("/api/comments/:comment_id", deleteComment)

app.get('/api/articles', getArticles)
app.get('/api/articles/:article_id', getArticleById)
app.get('/api/articles/:article_id/comments', getArticleComments)

app.post('/api/articles/:article_id/comments', postArticleComment)

app.patch('/api/articles/:article_id', patchArticle)

app.all('/*', invalidURL)

app.use(invalidInput)
app.use(catchAll)

module.exports = app

