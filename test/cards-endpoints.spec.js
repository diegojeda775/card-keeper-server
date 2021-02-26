const knex = require('knex')
const fixtures = require('./keeper.fixtures')
const app = require('../src/app')
const xss = require('xss')
const supertest = require('supertest')
const { expect } = require('chai')




describe('Cards Endpoints', () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })    

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE cards, sets RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE cards, sets RESTART IDENTITY CASCADE'))

    describe('Get /api/cards', () => {

        context('Given there are no cards', () => {
            it('it responds with 200 and an empty list', () =>{
                return supertest(app)
                    .get('/api/cards')
                    .expect(200, [])
            })
        })

        context('Given there are cards in the database', () => {
            const testCards = fixtures.makeCardsArray()
            const testSets = fixtures.makeSetsArray()

            const sanitizedCard = card => ({
                id: card.id,
                name: xss(card.name),
                set_id: card.set_id,
                rarity: xss(card.rarity),
                type: xss(card.type),
            })

            beforeEach('insert cards', () => {
                return db
                .into('sets')
                .insert(testSets)
                .then(() => {
                    return db
                    .into('cards')
                    .insert(testCards)
                })
            })

            it('Gets cards from the list', () => {
                return supertest(app)
                    .get('/api/cards')
                    .expect(200, testCards.map(sanitizedCard))
            })
        })

        context('Given an xss attack on item', () => {
            const { maliciousCard, expectedCard } = fixtures.makeMaliciousCard()
            const testSets = fixtures.makeSetsArray()

            beforeEach('insert cards', () => {
                return db
                .into('sets')
                .insert(testSets)
                .then(() => {
                    return db
                    .into('cards')
                    .insert([maliciousCard])
                })
            })

            it('removes xss attack content', () => {
                return supertest(app)
                    .get('/api/cards')
                    .expect(200)
                    .then(res => {
                        expect(res.body[0].name).to.eql(expectedCard.name)
                        expect(res.body[0].rarity).to.eql(expectedCard.rarity)
                        expect(res.body[0].type).to.eql(expectedCard.type)
                    })
            })

        })

    })

    describe('Post /api/cards', () => {

        
        context('Given there are no cards in the database', () => {
            const testSets = fixtures.makeSetsArray()

            beforeEach('insert cards', () => {
                return db
                .into('sets')
                .insert(testSets)
            })

            it('Adds item to database', () => {
                const newCards = {
                    name: 'test-name',
                    set_id: 1,
                    rarity: 'test-rarity',
                    type: 'test-type',
                }

                return supertest(app)
                    .post('/api/cards')
                    .send(newCards)
                    .expect(res => {
                        expect(res.body.name).to.eql(newCards.name)
                        expect(res.body.set_id).to.eql(newCards.set_id)
                        expect(res.body.rarity).to.eql(newCards.rarity)
                        expect(res.body.type).to.eql(newCards.type)
                        expect(res.body).to.have.property('id')
                    })
                    
            })

        })

    })

    describe('DELETE /api/cards/:item_id', () => {

        context('Given there are no cards in database', () => {
            it('Responds with 404 when item does not exist', () => {
                return supertest(app)
                    .delete('/api/cards/123')
                    .expect(404, {
                        error: { message: 'Card Not Found'}
                    })
            })
        })

        context('Given there are cards in database', () => {
            const testCards = fixtures.makeCardsArray()
            const testSets = fixtures.makeSetsArray()

            const sanitizedCard = card => ({
                id: card.id,
                name: xss(card.name),
                set_id: card.set_id,
                rarity: xss(card.rarity),
                type: xss(card.type),
            })

            beforeEach('insert cards', () => {
                return db
                .into('sets')
                .insert(testSets)
                .then(() => {
                    return db
                    .into('cards')
                    .insert(testCards)
                })
            })

            it('Removes item by id from database', () => {
                const idToRemove = 2
                const formatedCards = testCards.map(set => sanitizedCard(set))
                const expectedCards = formatedCards.filter(set => set.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/cards/${idToRemove}`)
                    .expect(204)
                    .then(() => {
                        return supertest(app)
                            .get('/api/cards')
                            .expect(expectedCards)
                    })

            })
        })

    })

})