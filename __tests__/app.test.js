const request = require("supertest");
const app = require("../app.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data");
const db = require("../db/connection.js");

beforeEach(() => {
    return seed(testData);
});

afterAll(() => {
    return db.end();
});

describe('ENDPOINT TESTS', () => {
    describe('GET /api/topics', () => {
        test('GET 200 - should return an array with all topics from db', () => {
            return request(app)
                .get('/api/topics')
                .expect(200)
                .then((res) => {
                    expect(res.body.topics).toBeInstanceOf(Array)
                    expect(res.body.topics.length).toBeGreaterThan(0)
                    res.body.topics.forEach((topic) => {
                        expect(topic).toEqual(
                            expect.objectContaining({
                                slug: expect.any(String),
                                description: expect.any(String)
                            })
                        );
                    });
                })
        });
    });
    describe('GET /api/articles', () => {
        test('GET 200 - should return an array with all articles from db - sorted by defaults', () => {
            return request(app)
                .get('/api/articles')
                .expect(200).then((res) => {
                    expect(res.body.articles).toBeInstanceOf(Array)
                    expect(res.body.articles.length).toBeGreaterThan(0)
                    expect(res.body.articles).toBeSortedBy("created_at", { descending: true })
                    res.body.articles.forEach((article) => {
                        expect(article).toEqual(
                            expect.objectContaining({
                                author: expect.any(String),
                                title: expect.any(String),
                                article_id: expect.any(Number),
                                topic: expect.any(String),
                                created_at: expect.any(String),
                                votes: expect.any(Number),
                                comment_count: expect.any(String),
                            })
                        );
                        const dateCreated = new Date(article.created_at)
                        expect(dateCreated).toBeInstanceOf(Date)
                    });
                })
        });
    });
    describe('GET /api/articles/:article_id', () => {
        test('GET 200 - returns single article when given valid id', () => {
            return request(app)
                .get("/api/articles/1")
                .expect(200)
                .then((res) => {
                    expect(res.body.article.article_id).toBe(1)
                    expect(res.body.article).toEqual(
                        expect.objectContaining({
                            author: expect.any(String),
                            title: expect.any(String),
                            article_id: expect.any(Number),
                            topic: expect.any(String),
                            created_at: expect.any(String),
                            votes: expect.any(Number),
                            comment_count: expect.any(String),
                        })
                    );
                })
        });
        test('GET 404 - valid id but no data found in db', () => {
            return request(app)
                .get("/api/articles/500")
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toBe("article not found")
                })
        });
        test('GET 400 - invalid id - respond with bad request', () => {
            return request(app)
                .get("/api/articles/not_an_id")
                .expect(400)
                .then((res) => {
                    expect(res.body.msg).toBe("Bad Request")
                })
        });
    });
    describe('GET /api/articles/:article_id/comments', () => {
        test('GET 200 - retrns all comments from a given article', () => {
            return request(app)
                .get('/api/articles/1/comments')
                .expect(200)
                .then((res) => {
                    expect(res.body.comments).toBeInstanceOf(Array)
                    expect(res.body.comments.length).toBeGreaterThan(0)
                    expect(res.body.comments).toBeSortedBy("created_at", { descending: true })
                    res.body.comments.forEach((comment) => {
                        expect(comment).toEqual(
                            expect.objectContaining({
                                comment_id: expect.any(Number),
                                votes: expect.any(Number),
                                created_at: expect.any(String),
                                author: expect.any(String),
                                body: expect.any(String)
                            })
                        )
                    })
                })
        });
        test('GET 200 - return empty array for article with no comments', () => {
            return request(app)
                .get('/api/articles/2/comments')
                .expect(200)
                .then((res) => {
                    expect(res.body.comments).toEqual([])
                })
        });
        test('GET 404 - article id not found', () => {
            return request(app)
                .get("/api/articles/1000/comments")
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toBe("article does not exist")
                })
        });
        test('GET 400 - invalid article_id - bad request', () => {
            return request(app)
                .get("/api/articles/Notanumber/comments")
                .expect(400)
                .then((res) => {
                    expect(res.body.msg).toBe("Bad Request")
                })
        });
    });
    describe('POST /api/articles/:article_id/comments', () => {
        test('POST 201 - responds with comment object', () => {
            return request(app)
                .post('/api/articles/1/comments')
                .send({ username: 'lurker', body: 'still lurkin' })
                .expect(201)
                .then((res) => {
                    expect(res.body.comment).toEqual({
                        comment_id: expect.any(Number),
                        body: 'still lurkin',
                        article_id: 1,
                        author: 'lurker',
                        votes: 0,
                        created_at: expect.any(String)
                    })
                    const dateCreated = new Date(res.body.comment.created_at)
                    expect(dateCreated).toBeInstanceOf(Date)
                })
        });
        test('POST 404 - article id not found', () => {
            return request(app)
                .post("/api/articles/1001/comments")
                .send({ username: 'lurker', body: 'still lurkin' })
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toBe("article does not exist")
                })
        });
        test('POST 400 - invalid article_id - bad request', () => {
            return request(app)
                .post("/api/articles/StillNotaNumber/comments")
                .send({ username: 'lurker', body: 'still lurkin' })
                .expect(400)
                .then((res) => {
                    expect(res.body.msg).toBe("Bad Request")
                })
        });
        test('POST 404 - invalid body - user does not exist', () => {
            return request(app)
                .post("/api/articles/1/comments")
                .send({ username: 'invalid_user_', body: 'still lurkin' })
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toBe("user does not exist")
                })
        });
        test('POST 400 - invalid body - wrong structure: no body', () => {
            return request(app)
                .post("/api/articles/1/comments")
                .send({ username: 'lurker' })
                .expect(400)
                .then((res) => {
                    expect(res.body.msg).toBe("Bad Request")
                })
        });
        test('POST 400 - invalid body - wrong structure: body empty', () => {
            return request(app)
                .post("/api/articles/1/comments")
                .send({ username: 'lurker', body: '' })
                .expect(400)
                .then((res) => {
                    expect(res.body.msg).toBe("Bad Request")
                })
        });
        test('POST 201 - invalid body - ignores additional body properties', () => {
            return request(app)
                .post("/api/articles/1/comments")
                .send({ username: 'lurker', body: 'still lurkin', some: 'extra', props: 13 })
                .expect(201)
                .then((res) => {
                    expect(res.body.comment).toEqual({
                        comment_id: expect.any(Number),
                        body: 'still lurkin',
                        article_id: 1,
                        author: 'lurker',
                        votes: 0,
                        created_at: expect.any(String)
                    })
                    const dateCreated = new Date(res.body.comment.created_at)
                    expect(dateCreated).toBeInstanceOf(Date)
                })
        });
    });
    describe('Errors', () => {
        test("invalid url", () => {
            return request(app)
                .get("/api/no_topics_to_be_found_here")
                .expect(404)
                .then((res) => {
                    expect(res.body.msg).toBe("invalid url");
                });
        });
    });
});
