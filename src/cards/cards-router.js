const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const CardsService = require('./cards-service')

const cardsRouter = express.Router()
const bodyParser = express.json()

const sanitizedCard = card => ({
    id: card.id,
    name: xss(card.name),
    set_id: card.set_id,
    rarity: xss(card.rarity),
    type: xss(card.type),
})

cardsRouter
    .route('/')

    .get((req, res, next) => {
        CardsService.getAllCards(req.app.get('db'))
        .then(cards => {
            res.json(cards.map(sanitizedCard))
        })
        .catch(next)
    })

    .post(bodyParser, (req, res, next) => {

        const { name, set_id, rarity, type } = req.body
        const newCard = { name, set_id, rarity, type }

        for (const field of ['name', 'set_id', 'rarity', 'type']) {
            if (!newCard[field]) {
                logger.error(`${field} is required`)
                return res.status(400).send({
                    error: { message: `'${field}' is required` }
                })
            }
        }

        // const numPrice = +price
        
        // if(isNaN(numPrice)) {
        //     logger.error(`Invalid price $'${price}' supplied`);
        //     return res.status(400).send({
        //         error: { message: `'Price' must be a number`}
        //     })
        // }

        CardsService.insertCard(
            req.app.get('db'),
            newCard
            )
            .then(card => {
                logger.info(`Card with id ${card.id} created`)
                res
                    .status(201)
                    .json(sanitizedCard(card))
            })
            .catch(next)
    })

cardsRouter
    .route('/:card_id')

    .all((req, res, next) => {
        const { card_id } = req.params
        
        CardsService.getCardById(
            req.app.get('db'),
            card_id
        )
        .then(card => {
            if (!card) {
                logger.error(`Card with id ${card_id} not found.`)
                return res.status(404).json({
                  error: { message: `Card Not Found` }
                })
            }

            res.card = card
            next()
        })
        .catch(next)

    })

    .get((req, res) => {
        res.json(sanitizedCard(res.card))
    })

    .delete((req, res, next) => {
        const { card_id } = req.params

        CardsService.deleteCard(
            req.app.get('db'),
            card_id
        )
        .then(dltd => {
            logger.info(`Card with id ${card_id} deleted.`)
            res.status(204)
                .end()
        })
        .catch(next)    
    })
    
    .patch(bodyParser, (req, res, next) => {
        const { name, set_id, rarity, type } = req.body
        const cardToUpdate = { name, set_id, rarity, type }

        const numberOfValues = Object.values(cardToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            logger.error(`Invalid update without required fields`)
            return res.status(400).json({
                error: {
                    message: `Request body must contain a 'name', 'set_id', 'rarity' and 'type'.`
                }
            })
        }

            CardsService.updateCard(
                req.app.get('db'),
                req.params.card_id,
                cardToUpdate
            )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = cardsRouter