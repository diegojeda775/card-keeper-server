const knex = require('knex')
const fixtures = require('./keeper.fixtures')
const app = require('../src/app')
const xss = require('xss')
const supertest = require('supertest')
const { expect } = require('chai')




describe('Sets Endpoints', () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })    

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE sets RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE sets RESTART IDENTITY CASCADE'))

    describe('Get /api/sets', () => {

        context('Given there are no sets', () => {
            it('it responds with 200 and an empty list', () =>{
                return supertest(app)
                    .get('/api/sets')
                    .expect(200, [])
            })
        })

        context('Given there are sets in the database', () => {
            const testSets = fixtures.makeSetsArray()

            const sanitizedSet = set => ({
                id: set.id,
                title: xss(set.title),
              })

            beforeEach('insert sets', () => {
                return db
                    .into('sets')
                    .insert(testSets)
            })

            it('Gets sets from the list', () => {
                return supertest(app)
                    .get('/api/sets')
                    .expect(200, testSets.map(sanitizedSet))
            })
        })

        context('Given an xss attack on item', () => {
            const { maliciousSet, expectedSet } = fixtures.makeMaliciousSet()

            beforeEach('insert sets', () => {
                return db
                    .into('sets')
                    .insert([maliciousSet])
            })

            it('removes xss attack content', () => {
                return supertest(app)
                    .get('/api/sets')
                    .expect(200)
                    .then(res => {
                        expect(res.body[0].title).to.eql(expectedSet.title)
                    })
            })

        })

    })

    describe('Post /api/sets', () => {

        context('Given there are no sets in the database', () => {
            

            it('Adds item to database', () => {
                const newSet = {
                    title: 'test-name',
                }

                return supertest(app)
                    .post('/api/sets')
                    .send(newSet)
                    .expect(res => {
                        expect(res.body.title).to.eql(newSet.title)
                        expect(res.body).to.have.property('id')
                    })
                    
            })

        })

    })

    describe('DELETE /api/sets/:set_id', () => {

        context('Given there are no sets in database', () => {
            it('Responds with 404 when item does not exist', () => {
                return supertest(app)
                    .delete('/api/sets/123')
                    .expect(404, {
                        error: { message: 'Set Not Found'}
                    })
            })
        })

        context('Given there are sets in database', () => {
            const testSets = fixtures.makeSetsArray()

            const sanitizedSet = set => ({
                id: set.id,
                title: xss(set.title),
            })

            beforeEach('insert sets', () => {
                return db
                    .into('sets')
                    .insert(testSets)
            })

            it('Removes item by id from database', () => {
                const idToRemove = 2
                const formatedSets = testSets.map(set => sanitizedSet(set))
                const expectedSets = formatedSets.filter(set => set.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/sets/${idToRemove}`)
                    .expect(204)
                    .then(() => {
                        return supertest(app)
                            .get('/api/sets')
                            .expect(expectedSets)
                    })

            })
        })

    })

})
