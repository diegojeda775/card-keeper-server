const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const SetsService = require('./sets-service')

const setsRouter = express.Router()
const bodyParser = express.json()

const sanitizedSet = set => ({
  id: set.id,
  title: xss(set.title),
})

setsRouter
    .route('/')

    .get((req, res, next) => {
        SetsService.getAllSets(req.app.get('db'))
        .then(sets => {
            res.json(sets.map(sanitizedSet))
        })
        .catch(next)
    })

    .post(bodyParser, (req, res, next) => {
        const { title } = req.body
        const newSet = { title }

    
        if (!newSet.title) {
            logger.error(`Title is required`)
            return res.status(400).send({
                error: { message: `'Title' is required` }
            })
        }
    

        SetsService.insertSet(
            req.app.get('db'),
            newSet
        )
            .then(set => {
                logger.info(`Set with id ${set.id} created.`)
                res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${set.id}`))
                .json(sanitizedSet(set))
            })
            .catch(next)
    })


setsRouter
    .route('/:set_id')

    .all((req, res, next) => {
        const { set_id } = req.params
        SetsService.getSetById(req.app.get('db'), set_id)
        .then(set => {
            if (!set) {
                logger.error(`Set with id ${set_id} not found.`)
                return res.status(404).json({
                    error: { message: `Set Not Found` }
                })
            }

            res.sets = set
            next()
        })
        .catch(next)

    })

    .get((req, res) => {
        res.json(sanitizedSet(res.sets))
    })

    .delete((req, res, next) => {
        const { set_id } = req.params
        SetsService.deleteSet(
            req.app.get('db'),
            set_id
        )
        .then(numRowsAffected => {
            logger.info(`Set with id ${set_id} deleted.`)
            res.status(204).end()
        })
        .catch(next)
    })

    .patch(bodyParser, (req, res, next) => {
        const { title } = req.body
        const setToUpdate = { title }

        const numberOfValues = Object.values(setToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            logger.error(`Invalid update without required fields`)
            return res.status(400).json({
                error: {
                    message: `Request body must contain a 'title'`
                }
            })
        }

            SetsService.updateSet(
                req.app.get('db'),
                req.params.set_id,
                setToUpdate
            )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = setsRouter