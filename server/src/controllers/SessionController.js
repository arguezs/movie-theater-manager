const {Movie, Session, Seat} = require('../models')
const { Op } = require('sequelize')

module.exports = {
  async create (req, res) {
    try {
      const session = await Session.create(req.body)
      res.send(session)
    } catch (error) {
      res.status(500).send({error: error})
    }
  },
  async read (req, res) {
    try {
      const session = await Session.findByPk(req.params.sessionId)
      res.send(session)
    } catch (error) {
      res.status(500).send({error: error})
    }
  },
  update (req, res) {
    try {
      Session.update(
        req.body,
        {
          where: {
            id: req.params.sessionId
          }
        }
      ).then( (rowsUpdated) => {
        res.send(rowsUpdated)
      })
    } catch (error) {
      res.status(500).send({error: error})
    }
  },
  delete (req, res) {
    try {
      Session.destroy({
        where: {
          id: req.params.sessionId
        }
      }).then(() => {
        res.send(true)
      })
    } catch (error) {
      res.status(500).send({error: error})
    }
  },
  async fetchAll (req, res) {
    try {
      const sessions = await Session.findAll({
        where: {
          MovieId: req.params.movieId
        },
        order: [['date']]
      })
      res.send(sessions)
    } catch (error) {
      res.status(500).send({
        error: error
      })
    }
  },
  async fetchSessionSeat(req, res) {
    try {
      const session = await Session.findByPk(req.params.sessionId),
            seats = await session.getSeats()
      res.send(seats)
    } catch (error) {
      res.status(500).send({
        error: 'Se ha producido un error'
      })
    }
  },
  async addSessionSeats(req, res) {
    try {
      const session = await Session.findByPk(req.params.sessionId)
      let seats = req.body

      for (let seat of seats) {
        seat = await Seat.findByPk(seat)
      }

      const addedSeats = await session.addSeats(seats)

      res.send(addedSeats)
    } catch (error) {
      res.status(500).send({
        error: 'Se ha producido un error'
      })
    }
  },
  async fetchWithDayAndTheater(req, res) {
    try {
      const sessions = await Session.findAll({
        where: {
          date: req.params.date,
          TheaterId: req.params.theaterId
        },
        order: [['time']],
        include: [{
          model: Movie
        }]
      })
      res.send(sessions)
    } catch (error) {
      res.status(500).send({
        error: error
      })
    }
  },
  async fetchNextWeek (req, res) {
    const today = new Date(Date.now())
    const tomorrow = new Date(Date.now())
    tomorrow.setDate(tomorrow.getDate() + 1)
    const sessions = []

    for (let i=0; i<7; i++) {
      
      sessions.push({
        date: today.toLocaleDateString(undefined, {day: '2-digit', month: 'short'}),
        sessions: await Session.findAll({
          attributes: ['id', 'time'],
          where: {
            MovieId: req.params.movieId,
            [Op.or]: [
              { [Op.and]: [
                {date: today},
                {time: {[Op.gte]: '12:00'}}
              ] },
              { [Op.and]: [
                {date: tomorrow},
                {time: {[Op.lt]: '12:00'}}
              ]}
            ]
          }
        })
      })

      today.setDate(today.getDate() + 1)
      tomorrow.setDate(tomorrow.getDate() + 1)
    }

    res.send(sessions)
  },
  fetchSessionData (req, res) {
    Session.findByPk(req.params.sessionId, {
      attributes: ['date', 'time', 'TheaterId'],
      include: [{
        model: Movie,
        attributes: ['title']
      }]
    }).then(session => {
      res.send(session)
    }).catch(error => {
      res.status(500).send(error)
    })
  }
}